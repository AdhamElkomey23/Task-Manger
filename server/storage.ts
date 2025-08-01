import {
  users,
  workspaces,
  tasks,
  comments,
  attachments,
  workspaceMembers,
  files,
  brainConversations,
  type User,
  type UpsertUser,
  type InsertWorkspace,
  type Workspace,
  type InsertTask,
  type Task,
  type InsertComment,
  type Comment,
  type InsertAttachment,
  type Attachment,
  type InsertWorkspaceMember,
  type WorkspaceMember,
  type InsertFile,
  type File,
  type InsertBrainConversation,
  type BrainConversation,
  type TaskWithDetails,
  type WorkspaceWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export interface IStorage {
  // User operations (authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; password: string; firstName?: string; lastName?: string; role?: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Workspace operations
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  getWorkspaces(userId: string, role: string): Promise<WorkspaceWithDetails[]>;
  getWorkspace(id: number): Promise<WorkspaceWithDetails | undefined>;
  updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace>;
  deleteWorkspace(id: number): Promise<void>;
  addWorkspaceMember(workspaceId: number, userId: string): Promise<WorkspaceMember>;
  removeWorkspaceMember(workspaceId: number, userId: string): Promise<void>;
  getWorkspaceMembers(workspaceId: number): Promise<User[]>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasks(userId: string, workspaceId?: number): Promise<TaskWithDetails[]>;
  getTask(id: number): Promise<TaskWithDetails | undefined>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getTaskComments(taskId: number): Promise<(Comment & { author: User })[]>;
  
  // Attachment operations
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;
  
  // Analytics
  getAnalytics(dateRange?: { from: Date; to: Date }): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalHours: number;
    avgCompletionTime: number;
    tasksByUser: Array<{ user: User; completedTasks: number; totalTasks: number }>;
    tasksByWorkspace: Array<{ workspace: Workspace; completedTasks: number; totalTasks: number }>;
  }>;
  
  // User management
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // File management
  getAllFiles(): Promise<(File & { uploader: User })[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<void>;
  
  // Brain conversation operations
  getBrainConversations(userId: string): Promise<BrainConversation[]>;
  getBrainConversation(id: number, userId: string): Promise<BrainConversation | undefined>;
  createBrainConversation(conversation: InsertBrainConversation): Promise<BrainConversation>;
  updateBrainConversation(id: number, updates: Partial<InsertBrainConversation>): Promise<BrainConversation>;
  deleteBrainConversation(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: { email: string; password: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: user.email,
        password: user.password,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        role: (user.role as "worker" | "admin") || 'worker',
      })
      .returning();
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [newWorkspace] = await db.insert(workspaces).values(workspace).returning();
    
    // Add creator as member
    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userId: workspace.createdBy,
    });
    
    return newWorkspace;
  }

  async getWorkspaces(userId: string, role: string): Promise<WorkspaceWithDetails[]> {
    const query = db
      .select({
        workspace: workspaces,
        creator: users,
        taskCount: sql<number>`count(${tasks.id})::int`,
      })
      .from(workspaces)
      .leftJoin(users, eq(workspaces.createdBy, users.id))
      .leftJoin(tasks, eq(workspaces.id, tasks.workspaceId))
      .where(eq(workspaces.isArchived, false))
      .groupBy(workspaces.id, users.id);

    if (role !== "admin") {
      query.innerJoin(workspaceMembers, and(
        eq(workspaceMembers.workspaceId, workspaces.id),
        eq(workspaceMembers.userId, userId)
      ));
    }

    const result = await query;
    
    return result.map(row => ({
      ...row.workspace,
      creator: row.creator!,
      members: [],
      taskCount: row.taskCount,
    }));
  }

  async getWorkspace(id: number): Promise<WorkspaceWithDetails | undefined> {
    const [workspace] = await db
      .select({
        workspace: workspaces,
        creator: users,
      })
      .from(workspaces)
      .leftJoin(users, eq(workspaces.createdBy, users.id))
      .where(eq(workspaces.id, id));

    if (!workspace) return undefined;

    const members = await db
      .select({
        workspaceMember: workspaceMembers,
        user: users,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, id));

    const [taskCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.workspaceId, id));

    return {
      ...workspace.workspace,
      creator: workspace.creator!,
      members: members.map(m => ({ ...m.workspaceMember, user: m.user })),
      taskCount: taskCount.count,
    };
  }

  async updateWorkspace(id: number, updates: Partial<InsertWorkspace>): Promise<Workspace> {
    const [workspace] = await db
      .update(workspaces)
      .set(updates)
      .where(eq(workspaces.id, id))
      .returning();
    return workspace;
  }

  async deleteWorkspace(id: number): Promise<void> {
    await db.delete(workspaces).where(eq(workspaces.id, id));
  }

  async addWorkspaceMember(workspaceId: number, userId: string): Promise<WorkspaceMember> {
    const [member] = await db
      .insert(workspaceMembers)
      .values({ workspaceId, userId })
      .returning();
    return member;
  }

  async removeWorkspaceMember(workspaceId: number, userId: string): Promise<void> {
    await db
      .delete(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ));
  }

  async getWorkspaceMembers(workspaceId: number): Promise<User[]> {
    const members = await db
      .select({ user: users })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    
    return members.map(m => m.user);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTasks(userId: string, workspaceId?: number): Promise<TaskWithDetails[]> {
    const assigneeAlias = alias(users, 'assignee');
    const creatorAlias = alias(users, 'creator');
    
    let baseQuery = db
      .select({
        task: tasks,
        workspace: workspaces,
        assignee: assigneeAlias,
        creator: creatorAlias,
      })
      .from(tasks)
      .innerJoin(workspaces, eq(tasks.workspaceId, workspaces.id))
      .leftJoin(assigneeAlias, eq(tasks.assigneeId, assigneeAlias.id))
      .leftJoin(creatorAlias, eq(tasks.createdBy, creatorAlias.id))
      .orderBy(desc(tasks.createdAt));

    let query;
    if (workspaceId) {
      query = baseQuery.where(eq(tasks.workspaceId, workspaceId));
    } else {
      // For "My Tasks", only show tasks assigned to the user
      query = baseQuery.where(eq(tasks.assigneeId, userId));
    }

    const result = await query;
    
    // Get comments and attachments for each task
    const tasksWithDetails: TaskWithDetails[] = [];
    
    for (const row of result) {
      const taskComments = await this.getTaskComments(row.task.id);
      const taskAttachments = await db
        .select()
        .from(attachments)
        .where(eq(attachments.taskId, row.task.id));

      tasksWithDetails.push({
        ...row.task,
        workspace: row.workspace,
        assignee: row.assignee || undefined,
        creator: row.creator!,
        comments: taskComments,
        attachments: taskAttachments,
      });
    }

    return tasksWithDetails;
  }

  async getTask(id: number): Promise<TaskWithDetails | undefined> {
    const assigneeAlias = alias(users, 'assignee');
    const creatorAlias = alias(users, 'creator');
    
    const [task] = await db
      .select({
        task: tasks,
        workspace: workspaces,
        assignee: assigneeAlias,
        creator: creatorAlias,
      })
      .from(tasks)
      .innerJoin(workspaces, eq(tasks.workspaceId, workspaces.id))
      .leftJoin(assigneeAlias, eq(tasks.assigneeId, assigneeAlias.id))
      .leftJoin(creatorAlias, eq(tasks.createdBy, creatorAlias.id))
      .where(eq(tasks.id, id));

    if (!task) return undefined;

    const taskComments = await this.getTaskComments(id);
    const taskAttachments = await db
      .select()
      .from(attachments)
      .where(eq(attachments.taskId, id));

    return {
      ...task.task,
      workspace: task.workspace,
      assignee: task.assignee || undefined,
      creator: task.creator!,
      comments: taskComments,
      attachments: taskAttachments,
    };
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.status === "done") {
      (updateData as any).completedAt = new Date();
    }

    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getTaskComments(taskId: number): Promise<(Comment & { author: User })[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(comments.createdAt);

    return result.map(row => ({
      ...row.comment,
      author: row.author,
    }));
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db.insert(attachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  async getAnalytics(dateRange?: { from: Date; to: Date }) {
    let whereCondition = undefined;
    
    if (dateRange) {
      whereCondition = and(
        sql`${tasks.createdAt} >= ${dateRange.from}`,
        sql`${tasks.createdAt} <= ${dateRange.to}`
      );
    }

    const allTasks = await db.select().from(tasks).where(whereCondition);
    const completedTasks = allTasks.filter(t => t.status === "done");
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    );

    // Calculate average completion time
    const completedWithDates = completedTasks.filter(t => t.completedAt && t.createdAt);
    const avgCompletionTime = completedWithDates.length > 0
      ? completedWithDates.reduce((sum, task) => {
          const diff = new Date(task.completedAt!).getTime() - new Date(task.createdAt!).getTime();
          return sum + diff;
        }, 0) / completedWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Tasks by user
    const userStats = await db
      .select({
        user: users,
        completedCount: sql<number>`count(case when ${tasks.status} = 'done' then 1 end)::int`,
        totalCount: sql<number>`count(${tasks.id})::int`,
      })
      .from(users)
      .leftJoin(tasks, eq(users.id, tasks.assigneeId))
      .groupBy(users.id);

    // Tasks by workspace
    const workspaceStats = await db
      .select({
        workspace: workspaces,
        completedCount: sql<number>`count(case when ${tasks.status} = 'done' then 1 end)::int`,
        totalCount: sql<number>`count(${tasks.id})::int`,
      })
      .from(workspaces)
      .leftJoin(tasks, eq(workspaces.id, tasks.workspaceId))
      .groupBy(workspaces.id);

    const inProgressTasks = allTasks.filter(t => t.status === "in-progress");
    const totalHours = allTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      overdueTasks: overdueTasks.length,
      totalHours,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      tasksByUser: userStats.map(stat => ({
        user: stat.user,
        completedTasks: stat.completedCount,
        totalTasks: stat.totalCount,
      })),
      tasksByWorkspace: workspaceStats.map(stat => ({
        workspace: stat.workspace,
        completedTasks: stat.completedCount,
        totalTasks: stat.totalCount,
      })),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName, users.lastName);
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Update tasks to unassign the user
    await db
      .update(tasks)
      .set({ assigneeId: null })
      .where(eq(tasks.assigneeId, id));
    
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllFiles(): Promise<(File & { uploader: User })[]> {
    const result = await db
      .select({
        file: files,
        uploader: users,
      })
      .from(files)
      .innerJoin(users, eq(files.uploadedBy, users.id))
      .orderBy(desc(files.createdAt));

    return result.map(row => ({
      ...row.file,
      uploader: row.uploader,
    }));
  }

  async createFile(fileData: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(fileData).returning();
    return newFile;
  }

  async deleteFile(id: number): Promise<void> {
    // Get file info to delete physical file
    const [fileInfo] = await db.select().from(files).where(eq(files.id, id));
    
    if (fileInfo) {
      // Delete physical file
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'uploads', fileInfo.fileName);
      
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.log("File not found on disk:", filePath);
      }
    }
    
    // Delete from database
    await db.delete(files).where(eq(files.id, id));
  }

  async getBrainConversations(userId: string): Promise<BrainConversation[]> {
    // For admin users, show all conversations from all workspaces they have access to
    const user = await this.getUser(userId);
    if (user?.role === 'admin') {
      const conversations = await db
        .select()
        .from(brainConversations)
        .where(eq(brainConversations.isArchived, false))
        .orderBy(desc(brainConversations.updatedAt));
      return conversations;
    }
    
    // For regular users, show their own conversations plus workspace conversations they have access to
    const userWorkspaces = await this.getWorkspaces(userId, user?.role || 'worker');
    const workspaceIds = userWorkspaces.map(w => w.id);
    
    const conversations = await db
      .select()
      .from(brainConversations)
      .where(
        and(
          eq(brainConversations.isArchived, false),
          sql`${brainConversations.userId} = ${userId} OR ${brainConversations.workspaceId} = ANY(${workspaceIds})`
        )
      )
      .orderBy(desc(brainConversations.updatedAt));
    
    return conversations;
  }

  async getBrainConversation(id: number, userId: string): Promise<BrainConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(brainConversations)
      .where(and(eq(brainConversations.id, id), eq(brainConversations.userId, userId)));
    return conversation;
  }

  async createBrainConversation(conversationData: InsertBrainConversation): Promise<BrainConversation> {
    const [newConversation] = await db
      .insert(brainConversations)
      .values(conversationData)
      .returning();
    return newConversation;
  }

  async updateBrainConversation(id: number, updates: Partial<InsertBrainConversation>): Promise<BrainConversation> {
    const [updatedConversation] = await db
      .update(brainConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brainConversations.id, id))
      .returning();
    return updatedConversation;
  }

  async deleteBrainConversation(id: number, userId: string): Promise<void> {
    await db
      .delete(brainConversations)
      .where(and(eq(brainConversations.id, id), eq(brainConversations.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
