import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Columns, List, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { CreateTaskModal } from "@/components/create-task-modal";
import type { TaskWithDetails, WorkspaceWithDetails } from "@shared/schema";

export default function WorkspaceBoard() {
  const params = useParams();
  const workspaceId = parseInt(params.id || "0");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
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

  const { data: workspace } = useQuery<WorkspaceWithDetails>({
    queryKey: ["/api/workspaces", workspaceId],
    retry: false,
    enabled: !!workspaceId,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks", `workspaceId=${workspaceId}`],
    queryFn: () => fetch(`/api/tasks?workspaceId=${workspaceId}`).then(res => res.json()),
    retry: false,
    enabled: !!workspaceId,
  });

  if (isLoading || !isAuthenticated) return null;

  if (!workspace) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Workspace not found</h2>
            <p className="text-muted-foreground mt-2">The workspace you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center"
                style={{ backgroundColor: workspace.color || '#3b82f6' }}
              >
                <i className={`${workspace.icon} text-white text-sm`}></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
                <p className="text-muted-foreground mt-1">{workspace.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Members */}
              <div className="flex -space-x-2">
                {workspace.members.slice(0, 4).map((member) => (
                  <Avatar key={member.userId} className="border-2 border-white">
                    <AvatarImage src={member.user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {workspace.members.length > 4 && (
                  <div className="w-8 h-8 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                    +{workspace.members.length - 4}
                  </div>
                )}
                <Button size="sm" variant="ghost" className="w-8 h-8 rounded-full">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
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
              </div>
              
              <Button 
                onClick={() => setShowCreateTask(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {viewMode === "kanban" && (
            <KanbanBoard workspaceId={workspaceId} />
          )}
          {viewMode === "list" && (
            <div className="text-center text-muted-foreground mt-20">
              List view coming soon...
            </div>
          )}
        </div>
      </div>
      
      <CreateTaskModal 
        workspaceId={workspaceId} 
        open={showCreateTask} 
        onOpenChange={setShowCreateTask}
      />
    </div>
  );
}
