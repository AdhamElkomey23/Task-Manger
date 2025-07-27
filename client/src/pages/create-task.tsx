import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Upload,
  Link as LinkIcon,
  User,
  Calendar,
  Flag,
  FileText,
  X,
  Plus,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import type { User as UserType, WorkspaceWithDetails } from "@shared/schema";

// Form validation schema
const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title too long"),
  description: z.string().min(1, "Task description is required"),
  priority: z.enum(["low", "medium", "high"]),
  workspaceId: z.string().min(1, "Please select a workspace"),
  assigneeId: z.string().min(1, "Please assign to a team member"),
  dueDate: z.string().optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

// Dummy team members data (will be replaced with real API call)
const teamMembers = [
  { id: "1", firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@company.com", role: "admin", department: "Product Management" },
  { id: "2", firstName: "Mike", lastName: "Chen", email: "mike.chen@company.com", role: "worker", department: "Engineering" },
  { id: "3", firstName: "Lisa", lastName: "Rodriguez", email: "lisa.rodriguez@company.com", role: "worker", department: "Finance" },
  { id: "4", firstName: "John", lastName: "Smith", email: "john.smith@company.com", role: "worker", department: "Design" },
  { id: "5", firstName: "Emily", lastName: "Davis", email: "emily.davis@company.com", role: "admin", department: "Operations" },
  { id: "6", firstName: "Alex", lastName: "Kim", email: "alex.kim@company.com", role: "worker", department: "Marketing" },
  { id: "7", firstName: "Sophia", lastName: "Lee", email: "sophia.lee@company.com", role: "worker", department: "Engineering" },
  { id: "8", firstName: "David", lastName: "Brown", email: "david.brown@company.com", role: "worker", department: "Support" }
];

export default function CreateTask() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedUrls, setAttachedUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      workspaceId: "",
      assigneeId: "",
      dueDate: "",
    },
  });

  // Fetch workspaces
  const { data: workspaces = [] } = useQuery<WorkspaceWithDetails[]>({
    queryKey: ["/api/workspaces"],
    retry: false,
    enabled: isAuthenticated,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskForm & { attachments?: File[], urls?: string[] }) => {
      const formData = new FormData();
      
      // Add task data
      Object.entries(taskData).forEach(([key, value]) => {
        if (key !== 'attachments' && key !== 'urls' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add files
      attachedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      // Add URLs
      attachedUrls.forEach((url) => {
        formData.append('urls', url);
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
      
      // Reset form and state
      form.reset();
      setAttachedFiles([]);
      setAttachedUrls([]);
      setNewUrl("");
      
      // Invalidate tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateTaskForm) => {
    setIsSubmitting(true);
    try {
      await createTaskMutation.mutateAsync({
        ...data,
        attachments: attachedFiles,
        urls: attachedUrls,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    if (newUrl.trim() && !attachedUrls.includes(newUrl.trim())) {
      setAttachedUrls(prev => [...prev, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const removeUrl = (index: number) => {
    setAttachedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-gray-600 mt-2">Assign tasks to team members with detailed requirements and resources</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available Workers</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.filter(m => m.role === 'worker').length}</p>
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
                    <p className="text-sm font-medium text-gray-600">Active Workspaces</p>
                    <p className="text-2xl font-bold text-gray-900">{workspaces.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tasks Created Today</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">
                                <div className="flex items-center space-x-2">
                                  <Flag className="h-4 w-4 text-green-500" />
                                  <span>Low Priority</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="medium">
                                <div className="flex items-center space-x-2">
                                  <Flag className="h-4 w-4 text-yellow-500" />
                                  <span>Medium Priority</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="high">
                                <div className="flex items-center space-x-2">
                                  <Flag className="h-4 w-4 text-red-500" />
                                  <span>High Priority</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide detailed description of what needs to be done..." 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Workspace and Assignment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="workspaceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select workspace" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workspaces.map((workspace) => (
                                <SelectItem key={workspace.id} value={workspace.id.toString()}>
                                  {workspace.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assigneeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign to Worker *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        {member.firstName[0]}{member.lastName[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{member.firstName} {member.lastName}</div>
                                      <div className="text-xs text-gray-500">{member.department}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Due Date */}
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              type="datetime-local" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Attachments */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">File Attachments</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500 font-medium">
                            Click to upload files
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Supports: PDF, DOC, XLS, PPT, Images, Archives (Max 10MB each)
                        </p>
                      </div>
                    </div>

                    {/* Attached Files List */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Attached Files:</Label>
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* URL Attachments */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Related URLs</Label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="https://example.com/resource"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          className="pl-10"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                        />
                      </div>
                      <Button type="button" onClick={addUrl} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Attached URLs List */}
                    {attachedUrls.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Attached URLs:</Label>
                        {attachedUrls.map((url, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <LinkIcon className="h-5 w-5 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
                              >
                                {url}
                              </a>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUrl(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{attachedFiles.length} files</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <LinkIcon className="h-3 w-3" />
                        <span>{attachedUrls.length} URLs</span>
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset Form
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || createTaskMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>Creating Task...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Create Task</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}