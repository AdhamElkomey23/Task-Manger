import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWorkspaceSchema,
  insertTaskSchema,
  insertCommentSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

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
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and PDF files are allowed.'));
    }
  },
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.claims?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workspace routes
  app.get('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const workspaces = await storage.getWorkspaces(userId, user?.role || "worker");
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post('/api/workspaces', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const data = insertWorkspaceSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
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

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = req.query.workspaceId ? parseInt(req.query.workspaceId) : undefined;
      const tasks = await storage.getTasks(userId, workspaceId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const data = insertTaskSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const task = await storage.createTask(data);
      res.json(task);
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
        authorId: req.user.claims.sub,
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
        uploadedBy: req.user.claims.sub,
      });
      
      res.json(attachment);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

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

  // User management routes (admin only)
  app.get('/api/users', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, requireAdmin, async (req: any, res) => {
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
