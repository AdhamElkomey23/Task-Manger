import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { CreateTaskModal } from "@/components/create-task-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Tag,
  Filter,
  Search,
  Grid3X3,
  List,
  Users,
  UserPlus
} from "lucide-react";
import type { TaskWithDetails, WorkspaceWithDetails } from "@shared/schema";

export default function WorkspaceBoard() {
  const params = useParams();
  const workspaceId = parseInt(params.id || "0");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    queryFn: () => fetch(`/api/tasks?workspaceId=${workspaceId}`, { credentials: 'include' }).then(res => res.json()),
    retry: false,
    enabled: !!workspaceId,
  });

  const statusColumns = [
    { 
      id: "todo", 
      title: "To Do", 
      bgColor: "bg-slate-50 dark:bg-slate-900",
      borderColor: "border-slate-200 dark:border-slate-700",
      count: tasks.filter(t => t.status === "todo").length
    },
    { 
      id: "in-progress", 
      title: "In Progress", 
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      count: tasks.filter(t => t.status === "in-progress").length
    },
    { 
      id: "done", 
      title: "Done", 
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
      count: tasks.filter(t => t.status === "done").length
    },
  ];

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

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
      
      <div className="ml-64 flex-1 flex flex-col">
        {/* Modern Header */}
        <header className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center shadow-sm"
                style={{ backgroundColor: workspace.color || '#3b82f6' }}
              >
                <i className={`${workspace.icon} text-white text-lg`}></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{workspace.name}</h1>
                <p className="text-muted-foreground text-lg mt-1">{workspace.description || "Organize your tasks and collaborate with your team"}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Team Members */}
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {workspace.members.slice(0, 4).map((member) => (
                    <Avatar key={member.userId} className="border-2 border-background w-10 h-10">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-sm">
                        {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {workspace.members.length > 4 && (
                    <div className="w-10 h-10 bg-muted rounded-full border-2 border-background flex items-center justify-center text-sm text-muted-foreground font-medium">
                      +{workspace.members.length - 4}
                    </div>
                  )}
                </div>
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="px-4 py-2"
                >
                  <Grid3X3 className="mr-2 h-4 w-4" /> Kanban
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-4 py-2"
                >
                  <List className="mr-2 h-4 w-4" /> List
                </Button>
              </div>
              
              {/* Add Task Button */}
              <Button 
                onClick={() => setShowCreateTask(true)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Task
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mt-6 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 p-8">
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              {statusColumns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                
                return (
                  <div key={column.id} className="flex flex-col">
                    {/* Column Header */}
                    <div className={`${column.bgColor} ${column.borderColor} border rounded-lg p-4 mb-4`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-lg">{column.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-sm">
                            {column.count}
                          </Badge>
                          {column.id === "todo" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => setShowCreateTask(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tasks */}
                    <div className="flex-1 space-y-3 min-h-[400px]">
                      {columnTasks.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-muted-foreground text-sm">
                            {column.id === "todo" ? "No pending tasks" : 
                             column.id === "in-progress" ? "No tasks in progress" : 
                             "No completed tasks"}
                          </div>
                          {column.id === "todo" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => setShowCreateTask(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Task
                            </Button>
                          )}
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <Card key={task.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Task Header */}
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                    {task.title}
                                  </h4>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {/* Task Description */}
                                {task.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                
                                {/* Task Meta */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </Badge>
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <Tag className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {task.tags.slice(0, 2).join(", ")}
                                          {task.tags.length > 2 && "..."}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {task.assignee && (
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={undefined} />
                                      <AvatarFallback className="text-xs">
                                        {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                                
                                {/* Due Date */}
                                {task.dueDate && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="text-center text-muted-foreground py-12">
                <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">List View Coming Soon</h3>
                <p className="text-sm">We're working on a detailed list view for your tasks.</p>
              </div>
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
