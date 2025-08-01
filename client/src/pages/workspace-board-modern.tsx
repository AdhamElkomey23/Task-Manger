import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";
import { CreateTaskModal } from "@/components/create-task-modal";
import { NotionTaskModal } from "@/components/notion-task-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  User,
  Tag,
  Filter,
  Search,
  Grid3X3,
  List,
  Users,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import type { TaskWithDetails, WorkspaceWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function ModernWorkspaceBoard() {
  const params = useParams();
  const workspaceId = parseInt(params.id || "0");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("list");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState<TaskWithDetails | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; status?: string; workspaceId: number }) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...taskData,
          status: taskData.status || 'todo'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskTitle("");
      setAddingTask(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: Partial<TaskWithDetails> }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDraggedTask(null);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const handleQuickCreateTask = (status?: string) => {
    if (!newTaskTitle.trim()) return;
    
    createTaskMutation.mutate({
      title: newTaskTitle.trim(),
      status: status || 'todo',
      workspaceId,
    });
  };

  const handleStatusChange = (taskId: number, newStatus: "todo" | "in-progress" | "done") => {
    updateTaskMutation.mutate({
      taskId,
      updates: { status: newStatus }
    });
  };

  const handleDragStart = (e: React.DragEvent, task: TaskWithDetails) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      handleStatusChange(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  const handleTaskClick = (task: TaskWithDetails) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskModalClose = (open: boolean) => {
    setTaskModalOpen(open);
    if (!open) {
      setSelectedTask(null);
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64 flex-1 flex flex-col">
        {/* ClickUp Style Header */}
        <header className="bg-background border-b border-border">
          {/* Main Header */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
                <div className="text-muted-foreground text-sm">
                  / {workspace.description || "Workspace"}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Team Members */}
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {workspace.members.slice(0, 3).map((member) => (
                      <Avatar key={member.userId} className="border-2 border-background w-8 h-8">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {workspace.members.length > 3 && (
                      <div className="w-8 h-8 bg-muted rounded-full border-2 border-background flex items-center justify-center text-xs text-muted-foreground font-medium">
                        +{workspace.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Header with View Toggle */}
          <div className="px-6 py-3 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* View Toggle */}
                <div className="flex bg-background rounded-md border border-border">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3 py-1.5 text-xs rounded-l-md rounded-r-none border-r"
                  >
                    <List className="mr-1.5 h-3 w-3" /> List
                  </Button>
                  <Button
                    variant={viewMode === "kanban" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                    className="px-3 py-1.5 text-xs rounded-r-md rounded-l-none"
                  >
                    <Grid3X3 className="mr-1.5 h-3 w-3" /> Board
                  </Button>
                </div>

                {/* View Info */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="text-xs">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => {
                    if (viewMode === "list") {
                      setAddingTask(true);
                      setNewTaskTitle("");
                    } else {
                      setShowCreateTask(true);
                    }
                  }}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 text-xs"
                >
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 bg-muted/30">
          {viewMode === "list" ? (
            /* LIST VIEW - Simple list without status grouping */
            <div className="bg-background">
              {/* Column Headers */}
              <div className="bg-background border-b border-border px-6 py-2">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Assignee</div>
                  <div className="col-span-2">Due date</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-2">Status</div>
                </div>
              </div>

              {/* Quick Add Task Row */}
              {addingTask && (
                <div className="bg-muted/30 px-6 py-2 border-b border-border">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <Input
                        placeholder="Task name"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleQuickCreateTask();
                          } else if (e.key === 'Escape') {
                            setAddingTask(false);
                            setNewTaskTitle("");
                          }
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="col-span-8 flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickCreateTask()}
                        disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                        className="h-6 px-3 text-xs"
                      >
                        {createTaskMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setAddingTask(false);
                          setNewTaskTitle("");
                        }}
                        className="h-6 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div>
                {filteredTasks.length === 0 ? (
                  <div className="px-6 py-8 text-center text-muted-foreground">
                    <p className="text-sm mb-4">No tasks found</p>
                    {!addingTask && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setAddingTask(true);
                          setNewTaskTitle("");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Task
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group hover:bg-muted/50 px-6 py-3 border-b border-border/50"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Task Name */}
                        <div className="col-span-4 flex items-center space-x-3">
                          <Checkbox className="w-4 h-4" />
                          <span 
                            className="text-sm font-medium text-foreground hover:text-blue-600 cursor-pointer"
                            onClick={() => handleTaskClick(task)}
                          >
                            {task.title}
                          </span>
                        </div>
                        
                        {/* Assignee */}
                        <div className="col-span-2">
                          {task.assignee ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="text-xs">
                                  {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                              <User className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Due Date */}
                        <div className="col-span-2">
                          {task.dueDate ? (
                            <span className="text-sm text-muted-foreground">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Priority */}
                        <div className="col-span-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {/* Status Dropdown */}
                        <div className="col-span-2">
                          <Select 
                            value={task.status} 
                            onValueChange={(value) => handleStatusChange(task.id, value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Add Task Button at bottom */}
                {!addingTask && filteredTasks.length > 0 && (
                  <div className="px-6 py-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setAddingTask(true);
                        setNewTaskTitle("");
                      }}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BOARD VIEW - Drag and Drop Kanban */
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {statusColumns.map((column) => {
                  const columnTasks = getTasksByStatus(column.id);
                  
                  return (
                    <div 
                      key={column.id} 
                      className="flex flex-col bg-background rounded-lg border"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      {/* Column Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              column.id === 'todo' ? 'bg-gray-400' :
                              column.id === 'in-progress' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`} />
                            <h3 className="font-medium text-foreground text-sm uppercase tracking-wide">
                              {column.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {column.count}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tasks */}
                      <div className="flex-1 p-4 space-y-3 min-h-[500px]">
                        {columnTasks.map((task) => (
                          <Card 
                            key={task.id} 
                            className={`group hover:shadow-md transition-all duration-200 cursor-move ${
                              draggedTask?.id === task.id ? 'opacity-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                {/* Task Header */}
                                <div className="flex items-start justify-between">
                                  <h4 
                                    className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors cursor-pointer"
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    {task.title}
                                  </h4>
                                  <div className="text-xs text-muted-foreground">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority.charAt(0).toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {/* Task Meta */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {task.assignee ? (
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="text-xs">
                                          {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <div className="h-5 w-5 bg-muted rounded-full flex items-center justify-center">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                    )}
                                    
                                    {task.dueDate && (
                                      <div className="text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 inline mr-1" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Add Task Button */}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newTitle = prompt("Enter task name:");
                            if (newTitle?.trim()) {
                              createTaskMutation.mutate({
                                title: newTitle.trim(),
                                status: column.id,
                                workspaceId,
                              });
                            }
                          }}
                          className="w-full justify-start text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg h-10"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
      
      <NotionTaskModal
        task={selectedTask}
        open={taskModalOpen}
        onOpenChange={handleTaskModalClose}
      />
    </div>
  );
}