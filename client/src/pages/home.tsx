import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  BarChart3, 
  Users, 
  FolderOpen,
  Calendar,
  Target,
  TrendingUp
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { CreateWorkspaceModal } from "@/components/create-workspace-modal";
import type { WorkspaceWithDetails, TaskWithDetails } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
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

  const { data: workspaces = [] } = useQuery<WorkspaceWithDetails[]>({
    queryKey: ["/api/workspaces"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: myTasks = [] } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/summary"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) return null;

  // Calculate task statistics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = myTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  ).length;

  const recentTasks = myTasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your tasks and workspaces today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <CreateWorkspaceModal>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Workspace
                </Button>
              </CreateWorkspaceModal>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-blue-100">Total Tasks</CardTitle>
                <Target className="h-5 w-5 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalTasks}</div>
                <p className="text-blue-100 text-sm">All assigned tasks</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-green-100">Completed</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedTasks}</div>
                <p className="text-green-100 text-sm">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-yellow-100">In Progress</CardTitle>
                <Clock className="h-5 w-5 text-yellow-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{inProgressTasks}</div>
                <p className="text-yellow-100 text-sm">Currently working on</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-red-100">Overdue</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overdueTasks}</div>
                <p className="text-red-100 text-sm">Need immediate attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Workspaces */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FolderOpen className="mr-2 h-5 w-5 text-blue-600" />
                      My Workspaces
                    </CardTitle>
                    <Badge variant="secondary">{workspaces.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {workspaces.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {workspaces.slice(0, 4).map((workspace) => (
                        <Card key={workspace.id} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: workspace.color || '#3b82f6' }}
                              >
                                <i className={`${workspace.icon} text-white text-sm`}></i>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{workspace.name}</h4>
                                <p className="text-sm text-gray-600 truncate">
                                  {workspace.description || "No description"}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <Users className="w-3 h-3 mr-1" />
                                  {workspace.members?.length || 0} members
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
                      <p className="text-gray-500 mb-4">Create your first workspace to get started</p>
                      <CreateWorkspaceModal>
                        <Button>Create Workspace</Button>
                      </CreateWorkspaceModal>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-green-600" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'done' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {task.status.replace('-', ' ')} • {task.priority} priority
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No recent tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Task</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Browse Workspaces</span>
                </Button>
                {user?.role === 'admin' && (
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>View Analytics</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}