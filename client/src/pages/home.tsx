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
  TrendingUp,
  CheckSquare,
  FileText
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

  // Recent documents dummy data (will be replaced with real data later)
  const recentDocuments = [
    { id: 1, name: "Project Requirements.docx", type: "document", uploadedAt: "2025-01-20", uploadedBy: "Sarah Johnson" },
    { id: 2, name: "Design Mockups.fig", type: "design", uploadedAt: "2025-01-19", uploadedBy: "Mike Chen" },
    { id: 3, name: "Budget Analysis.xlsx", type: "spreadsheet", uploadedAt: "2025-01-18", uploadedBy: "Lisa Rodriguez" },
    { id: 4, name: "Team Photo.jpg", type: "image", uploadedAt: "2025-01-17", uploadedBy: "John Smith" },
    { id: 5, name: "Meeting Notes.pdf", type: "document", uploadedAt: "2025-01-16", uploadedBy: "Emily Davis" }
  ];

  // Add some dummy tasks to make the home page look active
  const dummyTasks = recentTasks.length === 0 ? [
    {
      id: 1,
      title: "Update landing page design",
      description: "Refresh the main landing page with new branding and improved user experience",
      status: "in-progress" as const,
      priority: "high" as const,
      workspace: { name: "Marketing" },
      assignee: { firstName: "Sarah", lastName: "Johnson" },
      creator: { firstName: "Mike", lastName: "Chen" },
      updatedAt: new Date("2025-01-27T10:30:00"),
      comments: [],
      attachments: []
    },
    {
      id: 2,
      title: "Database optimization",
      description: "Improve query performance and reduce response times",
      status: "done" as const,
      priority: "medium" as const,
      workspace: { name: "Engineering" },
      assignee: { firstName: "Alex", lastName: "Kim" },
      creator: { firstName: "Lisa", lastName: "Rodriguez" },
      updatedAt: new Date("2025-01-26T15:45:00"),
      comments: [],
      attachments: []
    },
    {
      id: 3,
      title: "Client presentation preparation",
      description: "Prepare slides and demo for the quarterly business review",
      status: "todo" as const,
      priority: "high" as const,
      workspace: { name: "Sales" },
      assignee: { firstName: "John", lastName: "Smith" },
      creator: { firstName: "Emily", lastName: "Davis" },
      updatedAt: new Date("2025-01-25T09:15:00"),
      comments: [],
      attachments: []
    },
    {
      id: 4,
      title: "Code review checklist update",
      description: "Update the development team's code review guidelines",
      status: "in-progress" as const,
      priority: "low" as const,
      workspace: { name: "Engineering" },
      assignee: { firstName: "Sophia", lastName: "Lee" },
      creator: { firstName: "David", lastName: "Brown" },
      updatedAt: new Date("2025-01-24T14:20:00"),
      comments: [],
      attachments: []
    },
    {
      id: 5,
      title: "Budget analysis Q1",
      description: "Analyze first quarter spending and create projections",
      status: "done" as const,
      priority: "medium" as const,
      workspace: { name: "Finance" },
      assignee: { firstName: "Lisa", lastName: "Rodriguez" },
      creator: { firstName: "Sarah", lastName: "Johnson" },
      updatedAt: new Date("2025-01-23T11:00:00"),
      comments: [],
      attachments: []
    }
  ] : recentTasks;

  const displayTasks = dummyTasks.slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "todo": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your team today</p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{displayTasks.length}</p>
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
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {displayTasks.filter(task => task.status === 'done').length}
                    </p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {displayTasks.filter(task => task.status === 'in-progress').length}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {displayTasks.filter(task => task.priority === 'high').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2" />
                    Recently Added Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h3>
                          <p className="text-sm text-gray-600 truncate">{task.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">{task.workspace.name}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm text-gray-900">
                            {task.assignee?.firstName} {task.assignee?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Documents */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    Recent Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            {doc.type === 'document' ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : doc.type === 'design' ? (
                              <FileText className="h-4 w-4 text-purple-500" />
                            ) : doc.type === 'spreadsheet' ? (
                              <FileText className="h-4 w-4 text-green-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.uploadedBy}</p>
                          <p className="text-xs text-gray-400">{doc.uploadedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {displayTasks.filter(task => 
                      task.updatedAt && new Date(task.updatedAt).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Tasks Updated Today</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {recentDocuments.filter(doc => 
                      new Date(doc.uploadedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Files Uploaded This Week</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
                  <div className="text-sm text-gray-600">Team Members Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}