import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { NotionTaskModal } from "./notion-task-modal";
import { CreateTaskModal } from "./create-task-modal";
import { type TaskWithDetails } from "@shared/schema";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
  workspaceId: number;
}

const statusColumns = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" },
] as const;

export function KanbanBoard({ workspaceId }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks", `workspaceId=${workspaceId}`],
    queryFn: () => fetch(`/api/tasks?workspaceId=${workspaceId}`, { credentials: 'include' }).then(res => res.json()),
    retry: false,
    enabled: !!workspaceId,
  });

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <Card key={column.id} className="flex flex-col h-full">
              <CardHeader className={`${column.color} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {columnTasks.length}
                    </span>
                    {column.id === "todo" && (
                      <CreateTaskModal workspaceId={workspaceId}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CreateTaskModal>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks in {column.title.toLowerCase()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NotionTaskModal
        task={selectedTask}
        open={taskModalOpen}
        onOpenChange={handleTaskModalClose}
      />
    </>
  );
}