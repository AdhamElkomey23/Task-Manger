import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Type,
  Calendar,
  User,
  MessageSquare,
  Share,
  Star,
  MoreHorizontal,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type TaskWithDetails } from "@shared/schema";
import { format } from "date-fns";

interface NotionTaskModalProps {
  task: TaskWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'url';
  content: string;
  title?: string;
}

export function NotionTaskModal({ task, open, onOpenChange }: NotionTaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [taskTitle, setTaskTitle] = useState(task?.title || "");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize content blocks from task data
  React.useEffect(() => {
    if (task) {
      const blocks: ContentBlock[] = [];
      
      // Add description as text block
      if (task.description) {
        blocks.push({
          id: 'desc-1',
          type: 'text',
          content: task.description
        });
      }
      
      // Add links as URL blocks
      if (task.links && task.links.length > 0) {
        task.links.forEach((link, index) => {
          blocks.push({
            id: `link-${index}`,
            type: 'url',
            content: link,
            title: `Link ${index + 1}`
          });
        });
      }
      
      setContentBlocks(blocks);
      setTaskTitle(task.title);
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: { title?: string; description?: string; links?: string[] }) => {
      if (!task) return;
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!task) return;
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
  });

  const handleSave = () => {
    const textBlocks = contentBlocks.filter(block => block.type === 'text');
    const urlBlocks = contentBlocks.filter(block => block.type === 'url');
    
    const description = textBlocks.map(block => block.content).join('\n\n');
    const links = urlBlocks.map(block => block.content);

    updateTaskMutation.mutate({
      title: taskTitle,
      description: description || undefined,
      links: links.length > 0 ? links : undefined
    });
  };

  const addContentBlock = (type: 'text' | 'image' | 'url') => {
    const newBlock: ContentBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: '',
      title: type === 'url' ? 'New Link' : undefined
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setShowAddMenu(false);
  };

  const updateContentBlock = (id: string, content: string, title?: string) => {
    setContentBlocks(blocks => 
      blocks.map(block => 
        block.id === id ? { ...block, content, title } : block
      )
    );
  };

  const removeContentBlock = (id: string) => {
    setContentBlocks(blocks => blocks.filter(block => block.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (response.ok) {
          const { filePath } = await response.json();
          const newBlock: ContentBlock = {
            id: `image-${Date.now()}`,
            type: 'image',
            content: filePath, // Use server path instead of blob URL
            title: file.name
          };
          setContentBlocks([...contentBlocks, newBlock]);
          setShowAddMenu(false);
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex h-[90vh]">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                <Badge variant="outline" className="capitalize">
                  {task.status.replace("-", " ")}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {task.priority} Priority
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Share className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* Title */}
              <div className="px-6 py-4">
                {isEditing ? (
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
                    placeholder="Task title..."
                  />
                ) : (
                  <h1 
                    className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 p-2 rounded"
                    onClick={() => setIsEditing(true)}
                  >
                    {task.title}
                  </h1>
                )}
              </div>

              {/* Content Blocks */}
              <div className="px-6 space-y-3">
              {contentBlocks.map((block) => (
                <div key={block.id} className="group relative">
                  {block.type === 'text' && (
                    <div className="border border-transparent hover:border-gray-200 rounded p-2">
                      {isEditing ? (
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateContentBlock(block.id, e.target.value)}
                          placeholder="Write something..."
                          className="min-h-[100px] border-none resize-none focus-visible:ring-0"
                        />
                      ) : (
                        <div 
                          className="min-h-[60px] p-2 cursor-text hover:bg-gray-50 rounded"
                          onClick={() => setIsEditing(true)}
                        >
                          {block.content || (
                            <span className="text-gray-400">Click to add content...</span>
                          )}
                        </div>
                      )}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentBlock(block.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {block.type === 'url' && (
                    <div className="border border-gray-200 rounded p-3 bg-gray-50">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={block.title || ''}
                            onChange={(e) => updateContentBlock(block.id, block.content, e.target.value)}
                            placeholder="Link title..."
                            className="font-medium"
                          />
                          <Input
                            value={block.content}
                            onChange={(e) => updateContentBlock(block.id, e.target.value, block.title)}
                            placeholder="https://..."
                          />
                        </div>
                      ) : (
                        <a 
                          href={block.content} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>{block.title || block.content}</span>
                        </a>
                      )}
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentBlock(block.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {block.type === 'image' && (
                    <div className="border border-gray-200 rounded overflow-hidden">
                      <img 
                        src={block.content.startsWith('/uploads/') ? block.content : `/uploads/${block.content}`} 
                        alt={block.title || 'Task image'} 
                        className="w-full max-w-md h-auto"
                        onError={(e) => {
                          // Fallback for blob URLs during editing
                          if (!block.content.startsWith('blob:')) {
                            e.currentTarget.src = block.content;
                          }
                        }}
                      />
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentBlock(block.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Content Button */}
              {isEditing && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="w-full justify-start text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add content
                  </Button>
                  
                  {showAddMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addContentBlock('text')}
                        className="w-full justify-start"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        Text
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full justify-start"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Image
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addContentBlock('url')}
                        className="w-full justify-start"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Link
                      </Button>
                    </div>
                  )}
                </div>
              )}

                {!isEditing && contentBlocks.length === 0 && (
                  <div 
                    className="p-4 text-center text-gray-400 cursor-pointer hover:bg-gray-50 rounded"
                    onClick={() => setIsEditing(true)}
                  >
                    Click to add description, images, or links...
                  </div>
                )}

                {/* Comments Section */}
                <div className="px-6 py-6 border-t border-gray-200 mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Comments ({task.comments?.length || 0})
                  </h3>
                  
                  {/* Comment List */}
                  <div className="space-y-4 mb-6">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">
                                  {comment.author.firstName} {comment.author.lastName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {comment.createdAt ? format(new Date(comment.createdAt), "MMM d, h:mm a") : ""}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet</p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={() => addCommentMutation.mutate(newComment)}
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        size="sm"
                      >
                        {addCommentMutation.isPending ? "Adding..." : "Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Action Buttons for Editing Mode */}
            {isEditing && (
              <div className="border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={updateTaskMutation.isPending}>
                    {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Task Properties */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Properties</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant="outline" className="capitalize">
                      {task.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority</span>
                    <Badge variant="secondary" className="capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.assignee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assignee</span>
                      <span className="text-sm">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <span className="text-sm">
                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm">
                      {task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}