import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar } from "lucide-react";
import { type TaskWithDetails } from "@shared/schema";
import { format, isAfter } from "date-fns";

interface TaskCardProps {
  task: TaskWithDetails;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
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
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Priority indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div className={`flex items-center text-xs mb-3 ${
          isOverdue ? "text-red-600" : "text-gray-500"
        }`}>
          <Calendar className="w-3 h-3 mr-1" />
          {format(new Date(task.dueDate), "MMM d")}
          {isOverdue && <span className="ml-1">(Overdue)</span>}
        </div>
      )}

      {/* Assignee */}
      <div className="flex items-center justify-between">
        {task.assignee ? (
          <div className="flex items-center">
            <Avatar className="w-6 h-6 mr-2">
              <AvatarImage src={task.assignee.profileImageUrl || undefined} />
              <AvatarFallback className="text-xs">
                {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">
              {task.assignee.firstName} {task.assignee.lastName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        )}

        {/* Comments count */}
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {task.comments.length}
          </div>
        )}
      </div>
    </div>
  );
}