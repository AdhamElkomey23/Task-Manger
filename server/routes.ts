import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWorkspaceSchema,
  insertTaskSchema,
  insertCommentSchema,
  registerSchema,
  loginSchema,
  type User,
  type RegisterInput,
  type LoginInput,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId: string;
    user: User;
  }
}

// File upload configuration
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip', 'application/x-rar-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, Office documents, and archives are allowed.'));
    }
  },
});

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

// Authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.set("trust proxy", 1);
  app.use(getSession());

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email or password. Please check your credentials." });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Wrong email or password. Please check your credentials." });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user route
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workspace routes
  app.get('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const workspaces = await storage.getWorkspaces(userId, user?.role || "worker");
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const data = insertWorkspaceSchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      const workspace = await storage.createWorkspace(data);
      res.json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.get('/api/workspaces/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(id);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      res.json(workspace);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.patch('/api/workspaces/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertWorkspaceSchema.partial().parse(req.body);
      const workspace = await storage.updateWorkspace(id, updates);
      res.json(workspace);
    } catch (error) {
      console.error("Error updating workspace:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workspace" });
    }
  });

  app.delete('/api/workspaces/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWorkspace(id);
      res.json({ message: "Workspace deleted" });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });

  app.post('/api/workspaces/:id/members', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const { userId } = req.body;
      const member = await storage.addWorkspaceMember(workspaceId, userId);
      res.json(member);
    } catch (error) {
      console.error("Error adding workspace member:", error);
      res.status(500).json({ message: "Failed to add workspace member" });
    }
  });

  app.delete('/api/workspaces/:id/members/:userId', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const { userId } = req.params;
      await storage.removeWorkspaceMember(workspaceId, userId);
      res.json({ message: "Member removed from workspace" });
    } catch (error) {
      console.error("Error removing workspace member:", error);
      res.status(500).json({ message: "Failed to remove workspace member" });
    }
  });

  app.get('/api/workspaces/:id/members', isAuthenticated, async (req: any, res) => {
    try {
      const workspaceId = parseInt(req.params.id);
      const members = await storage.getWorkspaceMembers(workspaceId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
      res.status(500).json({ message: "Failed to fetch workspace members" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const workspaceId = req.query.workspaceId ? parseInt(req.query.workspaceId) : undefined;
      const tasks = await storage.getTasks(userId, workspaceId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, upload.array('attachments', 10), async (req: any, res) => {
    try {
      // Parse task data
      const taskData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        workspaceId: parseInt(req.body.workspaceId),
        assigneeId: req.body.assigneeId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        createdBy: req.session.userId,
      };

      // Validate task data
      const validatedTaskData = insertTaskSchema.parse(taskData);
      
      // Create the task
      const task = await storage.createTask(validatedTaskData);

      // Handle file attachments
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileUrl = `/uploads/${file.filename}`;
          await storage.createAttachment({
            taskId: task.id,
            fileName: file.filename,
            originalName: file.originalname,
            fileUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: req.session.userId,
          });
        }
      }

      // Handle URL attachments
      const urls = req.body.urls;
      if (urls) {
        const urlArray = Array.isArray(urls) ? urls : [urls];
        for (const url of urlArray) {
          if (url && url.trim()) {
            // Create a simple attachment record for URLs
            await storage.createAttachment({
              taskId: task.id,
              fileName: url,
              originalName: url,
              fileUrl: url,
              fileType: 'url',
              fileSize: 0,
              uploadedBy: req.session.userId,
            });
          }
        }
      }

      // Fetch the complete task with attachments
      const completeTask = await storage.getTask(task.id);
      res.json(completeTask);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Comment routes
  app.post('/api/tasks/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const data = insertCommentSchema.parse({
        ...req.body,
        taskId,
        authorId: req.session.userId,
      });
      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // File upload route
  app.post('/api/tasks/:id/attachments', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // In a production app, you would upload to a cloud storage service like S3
      // For now, we'll just store the file path
      const fileUrl = `/uploads/${file.filename}`;
      
      const attachment = await storage.createAttachment({
        taskId,
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.session.userId,
      });
      
      res.json(attachment);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Analytics routes (admin only)
  app.get('/api/analytics', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const dateRange = req.query.from && req.query.to 
        ? { from: new Date(req.query.from), to: new Date(req.query.to) }
        : undefined;
      
      const analytics = await storage.getAnalytics(dateRange);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const userData = req.body;
      
      // Check if user with this email already exists
      const existingUsers = await storage.getAllUsers();
      const existingUser = existingUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Don't return the password in the response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      
      // Hash password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      const user = await storage.updateUser(id, updates);
      
      // Don't return the password in the response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = req.params.id;
      await storage.deleteUser(id);
      res.json({ message: "User deleted" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
