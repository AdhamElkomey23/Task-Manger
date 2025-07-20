import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, MessageSquare, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type TaskWithDetails } from "@shared/schema";
import { format, isAfter } from "date-fns";

interface TaskDetailModalProps {
  task: TaskWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!task) return;
      return apiRequest(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
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

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!task) return;
      return apiRequest(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Task deleted successfully",
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

  const handleAddComment = () => {
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  const handleDeleteTask = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${getPriorityColor(task.priority)}`} />
              {task.title}
            </DialogTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDeleteTask}
                disabled={deleteTaskMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="capitalize">
              {task.status.replace("-", " ")}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {task.priority} Priority
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{task.description}</p>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Assignee
              </h4>
              {task.assignee ? (
                <div className="flex items-center">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarImage src={task.assignee.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {task.assignee.firstName} {task.assignee.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{task.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Unassigned</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Due Date
              </h4>
              {task.dueDate ? (
                <p className={`${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                  {isOverdue && <span className="ml-2 text-red-600">(Overdue)</span>}
                </p>
              ) : (
                <p className="text-gray-600">No due date</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments ({task.comments?.length || 0})
            </h4>
            
            {/* Comment List */}
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No comments yet</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <Button 
                onClick={handleAddComment}
                disabled={!comment.trim() || addCommentMutation.isPending}
                size="sm"
              >
                {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}