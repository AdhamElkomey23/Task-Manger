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
    task.dueDate && new Date(task.dueDate.toString()) < new Date() && task.status !== 'done'
  ).length;

  const recentTasks = myTasks
    .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime())
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Here's what's happening with your tasks and workspaces today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <CreateWorkspaceModal>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="mr-2 h-4 w-4" />
                  New Workspace
                </Button>
              </CreateWorkspaceModal>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-blue-100">Total Tasks</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{totalTasks}</div>
                <p className="text-blue-100 text-sm">All assigned tasks</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-emerald-100">Completed</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{completedTasks}</div>
                <p className="text-emerald-100 text-sm">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-amber-100">In Progress</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{inProgressTasks}</div>
                <p className="text-amber-100 text-sm">Currently working on</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-500 via-red-600 to-pink-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-rose-100">Overdue</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{overdueTasks}</div>
                <p className="text-rose-100 text-sm">Need immediate attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* My Workspaces */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 bg-blue-600/10 rounded-lg mr-3">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      My Workspaces
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold">
                      {workspaces.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {workspaces.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {workspaces.slice(0, 4).map((workspace) => (
                        <Card key={workspace.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200/50 hover:border-blue-300 group">
                          <CardContent className="p-5">
                            <div className="flex items-center space-x-4">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
                                style={{ backgroundColor: workspace.color || '#3b82f6' }}
                              >
                                <i className={`${workspace.icon} text-white text-lg`}></i>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                  {workspace.name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {workspace.description || "No description"}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                    <Users className="w-3 h-3 mr-1" />
                                    {workspace.members?.length || 0} members
                                  </div>
                                  <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full ml-2">
                                    <Target className="w-3 h-3 mr-1 text-blue-600" />
                                    {workspace.taskCount || 0} tasks
                                  </div>
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
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-600/10 to-green-600/10 rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <div className="p-2 bg-emerald-600/10 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200/50">
                        <div className={`w-4 h-4 rounded-full shadow-sm ${
                          task.status === 'done' ? 'bg-emerald-500' :
                          task.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate mb-1">
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-1 ${
                                task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.status.replace('-', ' ')}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-1 ${
                                task.priority === 'high' ? 'border-red-300 text-red-700' :
                                task.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                                'border-gray-300 text-gray-700'
                              }`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
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
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 bg-purple-600/10 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <Plus className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-blue-600">Create Task</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 group"
                >
                  <FolderOpen className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-emerald-600">Browse Workspaces</span>
                </Button>
                {user?.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <BarChart3 className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-purple-600">View Analytics</span>
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