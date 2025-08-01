import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Target,
  Award,
  Activity,
  Zap,
  FileText,
  HardDrive,
  Database
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import type { TaskWithDetails, User, File as FileType } from "@shared/schema";

type FileWithUploader = FileType & {
  uploader: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

type AnalyticsData = {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgCompletionTime: number;
  tasksByUser: Array<{
    user: User;
    completedTasks: number;
    totalTasks: number;
  }>;
  tasksByWorkspace: Array<{
    workspace: {
      id: number;
      name: string;
      color: string;
    };
    completedTasks: number;
    totalTasks: number;
  }>;
};

export default function Analysis() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/summary"],
    enabled: isAuthenticated,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });

  const { data: tasks = [] } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    enabled: isAuthenticated,
  });

  const { data: files = [] } = useQuery<FileWithUploader[]>({
    queryKey: ["/api/files"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) return null;

  // Only allow admin users to access this page
  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Only admin users can access the analytics dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate real analytics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => 
    tasks.some(task => task.assigneeId === user.id)
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // File analytics
  const totalFiles = files.length;
  const totalFileSize = files.reduce((sum, file) => sum + file.fileSize, 0);
  const filesByType = files.reduce((acc, file) => {
    const type = file.fileType.split('/')[0];
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // User performance analytics
  const userPerformance = users.map(user => {
    const userTasks = tasks.filter(task => task.assigneeId === user.id);
    const userCompletedTasks = userTasks.filter(task => task.status === 'done');
    const userInProgressTasks = userTasks.filter(task => task.status === 'in-progress');
    const userOverdueTasks = userTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
    );
    const userFiles = files.filter(file => file.uploadedBy === user.id);

    return {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      role: user.role,
      tasksTotal: userTasks.length,
      tasksCompleted: userCompletedTasks.length,
      tasksInProgress: userInProgressTasks.length,
      tasksOverdue: userOverdueTasks.length,
      completionRate: userTasks.length > 0 ? Math.round((userCompletedTasks.length / userTasks.length) * 100) : 0,
      filesUploaded: userFiles.length,
      productivity: userTasks.length > 0 ? Math.min(100, Math.round(
        (userCompletedTasks.length * 0.6 + userInProgressTasks.length * 0.3 - userOverdueTasks.length * 0.1) * 10
      )) : 0,
    };
  }).sort((a, b) => b.productivity - a.productivity);

  // Workspace performance
  const workspacePerformance = analytics?.tasksByWorkspace || [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const selectedUserData = selectedUser === "all" ? null : userPerformance.find(u => u.id === selectedUser);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Real-time performance insights and productivity metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {userPerformance.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Cards */}
          {selectedUser === "all" ? (
            <>
              {/* Team Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Team Size</p>
                        <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                        <p className="text-xs text-gray-500">{activeUsers} active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                        <p className="text-xs text-gray-500">{completedTasks} completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                        <p className="text-xs text-gray-500">{inProgressTasks} in progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{overdueTasks}</p>
                        <p className="text-xs text-gray-500">{todoTasks} pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <FileText className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Files</p>
                        <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                        <p className="text-xs text-gray-500">{Object.keys(filesByType).length} file types</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <HardDrive className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Storage Used</p>
                        <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalFileSize)}</p>
                        <p className="text-xs text-gray-500">Across all uploads</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Database className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg File Size</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatFileSize(totalFiles > 0 ? totalFileSize / totalFiles : 0)}
                        </p>
                        <p className="text-xs text-gray-500">Per file uploaded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team Performance & Workspace Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Team Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-yellow-600" />
                      Team Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userPerformance.slice(0, 6).map((user) => (
                        <div key={user.id} className="flex items-center">
                          <Avatar className="w-8 h-8 mr-3">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {user.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                  {user.role}
                                </Badge>
                                <span className="text-sm font-bold text-gray-700">
                                  {user.productivity}%
                                </span>
                              </div>
                            </div>
                            <Progress value={user.productivity} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {user.tasksCompleted}/{user.tasksTotal} tasks • {user.filesUploaded} files
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {userPerformance.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          No team members found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Workspace Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Workspace Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workspacePerformance.map((workspace) => {
                        const completionRate = workspace.totalTasks > 0 
                          ? (workspace.completedTasks / workspace.totalTasks) * 100 
                          : 0;
                      
                        return (
                          <div key={workspace.workspace.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded mr-3"
                                style={{ backgroundColor: workspace.workspace.color || '#6b7280' }}
                              />
                              <span className="font-medium text-gray-900">
                                {workspace.workspace.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round(completionRate)}%
                              </span>
                              <p className="text-xs text-gray-500">
                                {workspace.completedTasks}/{workspace.totalTasks} completed
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {workspacePerformance.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          No workspace data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    File Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(filesByType).map(([type, count]) => (
                      <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">{type} files</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((count / totalFiles) * 100)}% of total
                        </p>
                      </div>
                    ))}
                    
                    {Object.keys(filesByType).length === 0 && (
                      <div className="col-span-full text-center text-gray-500 py-8">
                        No files uploaded yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Individual User Analysis
            selectedUserData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedUserData.tasksCompleted}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">In Progress</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedUserData.tasksInProgress}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Target className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedUserData.completionRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedUserData.filesUploaded}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                      Performance Overview for {selectedUserData.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Overall Productivity</span>
                        <span className="text-lg font-bold text-gray-900">{selectedUserData.productivity}%</span>
                      </div>
                      <Progress value={selectedUserData.productivity} className="h-3" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedUserData.tasksTotal}</p>
                          <p className="text-sm text-gray-600">Total Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{selectedUserData.tasksCompleted}</p>
                          <p className="text-sm text-gray-600">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{selectedUserData.tasksInProgress}</p>
                          <p className="text-sm text-gray-600">In Progress</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{selectedUserData.tasksOverdue}</p>
                          <p className="text-sm text-gray-600">Overdue</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}