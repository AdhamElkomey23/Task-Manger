import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Archive, Users } from "lucide-react";
import { CreateWorkspaceModal } from "@/components/create-workspace-modal";
import type { WorkspaceWithDetails } from "@shared/schema";

export default function AdminWorkspaces() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
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
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: workspaces = [] } = useQuery<WorkspaceWithDetails[]>({
    queryKey: ["/api/workspaces"],
    retry: false,
    enabled: isAuthenticated && user?.role === "admin",
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      await apiRequest("DELETE", `/api/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete workspace",
        variant: "destructive",
      });
    },
  });

  const archiveWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      await apiRequest("PATCH", `/api/workspaces/${workspaceId}`, {
        isArchived: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Success",
        description: "Workspace archived successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to archive workspace",
        variant: "destructive",
      });
    },
  });

  const handleDeleteWorkspace = async (workspaceId: number) => {
    if (confirm("Are you sure you want to delete this workspace? All tasks will be permanently deleted.")) {
      deleteWorkspaceMutation.mutate(workspaceId);
    }
  };

  const handleArchiveWorkspace = async (workspaceId: number) => {
    if (confirm("Are you sure you want to archive this workspace?")) {
      archiveWorkspaceMutation.mutate(workspaceId);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workspace Management</h1>
              <p className="text-gray-600 mt-1">Create and manage team workspaces</p>
            </div>
            <Button onClick={() => setShowCreateWorkspace(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: workspace.color || '#3b82f6' }}
                      >
                        <i className={`${workspace.icon} text-white`}></i>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{workspace.name}</CardTitle>
                        {workspace.isArchived && (
                          <Badge variant="secondary" className="mt-1">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleArchiveWorkspace(workspace.id)}
                        disabled={archiveWorkspaceMutation.isPending}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        disabled={deleteWorkspaceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {workspace.description || "No description"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {workspace.members.length} members
                    </div>
                    <div className="text-gray-500">
                      {workspace.taskCount} tasks
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Created by {workspace.creator.firstName} {workspace.creator.lastName}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {workspaces.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No workspaces yet</h3>
                  <p className="mb-4">Create your first workspace to get started</p>
                  <Button onClick={() => setShowCreateWorkspace(true)}>
                    Create Workspace
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateWorkspaceModal 
        open={showCreateWorkspace} 
        onOpenChange={setShowCreateWorkspace}
      />
    </div>
  );
}
