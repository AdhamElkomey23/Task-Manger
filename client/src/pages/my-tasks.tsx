import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Columns, List, Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { CreateTaskModal } from "@/components/create-task-modal";
import type { TaskWithDetails } from "@shared/schema";

export default function MyTasks() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("kanban");
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-gray-600 mt-1">Tasks assigned to you across all workspaces</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="px-3 py-1 text-sm"
                >
                  <Columns className="mr-1 h-4 w-4" /> Kanban
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3 py-1 text-sm"
                >
                  <List className="mr-1 h-4 w-4" /> List
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="px-3 py-1 text-sm"
                >
                  <Calendar className="mr-1 h-4 w-4" /> Calendar
                </Button>
              </div>
              
              {/* Filters */}
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setShowCreateTask(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {viewMode === "kanban" && (
            <KanbanBoard workspaceId={0} />
          )}
          {viewMode === "list" && (
            <div className="text-center text-gray-500 mt-20">
              List view coming soon...
            </div>
          )}
          {viewMode === "calendar" && (
            <div className="text-center text-gray-500 mt-20">
              Calendar view coming soon...
            </div>
          )}
        </div>
      </div>
      
      {showCreateTask && (
        <CreateTaskModal workspaceId={1}>
          <div />
        </CreateTaskModal>
      )}
    </div>
  );
}
