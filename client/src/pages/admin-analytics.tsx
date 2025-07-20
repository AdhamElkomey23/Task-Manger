import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, Download, BarChart3 } from "lucide-react";

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgCompletionTime: number;
  tasksByUser: Array<{
    user: any;
    completedTasks: number;
    totalTasks: number;
  }>;
  tasksByWorkspace: Array<{
    workspace: any;
    completedTasks: number;
    totalTasks: number;
  }>;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    retry: false,
    enabled: isAuthenticated && user?.role === "admin",
  });

  if (isLoading || !isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Team productivity insights and task metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select defaultValue="30">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.totalTasks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.completedTasks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.avgCompletionTime || 0}d
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.overdueTasks || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Completion by Team Member */}
            <Card>
              <CardHeader>
                <CardTitle>Tasks Completed by Team Member</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.tasksByUser.map((userStat) => {
                    const completionRate = userStat.totalTasks > 0 
                      ? (userStat.completedTasks / userStat.totalTasks) * 100 
                      : 0;
                    
                    return (
                      <div key={userStat.user.id} className="flex items-center">
                        <div className="flex items-center w-32">
                          <Avatar className="w-8 h-8 mr-3">
                            <AvatarImage src={userStat.user.profileImageUrl || undefined} />
                            <AvatarFallback>
                              {userStat.user.firstName?.[0]}{userStat.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {userStat.user.firstName} {userStat.user.lastName}
                          </span>
                        </div>
                        <div className="flex-1 mx-4">
                          <Progress value={completionRate} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">
                          {userStat.completedTasks}
                        </span>
                      </div>
                    );
                  })}
                  
                  {(!analytics?.tasksByUser || analytics.tasksByUser.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      No user data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Workspace Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Workspace Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.tasksByWorkspace.map((workspaceStat) => {
                    const completionRate = workspaceStat.totalTasks > 0 
                      ? (workspaceStat.completedTasks / workspaceStat.totalTasks) * 100 
                      : 0;
                    
                    return (
                      <div key={workspaceStat.workspace.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded mr-3"
                            style={{ backgroundColor: workspaceStat.workspace.color }}
                          />
                          <span className="font-medium text-gray-900">
                            {workspaceStat.workspace.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round(completionRate)}%
                          </span>
                          <p className="text-xs text-gray-500">
                            {workspaceStat.completedTasks}/{workspaceStat.totalTasks} completed
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!analytics?.tasksByWorkspace || analytics.tasksByWorkspace.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      No workspace data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
