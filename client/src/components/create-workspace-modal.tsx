import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Palette, 
  TrendingUp, 
  Settings, 
  Users, 
  Code, 
  Megaphone,
  HeadphonesIcon,
  Building
} from "lucide-react";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name too long"),
  description: z.string().optional(),
  color: z.string().min(1, "Please select a color"),
  icon: z.string().min(1, "Please select an icon"),
});

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workspaceIcons = [
  { value: "briefcase", label: "Business", icon: Briefcase },
  { value: "palette", label: "Design", icon: Palette },
  { value: "trending-up", label: "Sales", icon: TrendingUp },
  { value: "settings", label: "Operations", icon: Settings },
  { value: "users", label: "HR", icon: Users },
  { value: "code", label: "Development", icon: Code },
  { value: "megaphone", label: "Marketing", icon: Megaphone },
  { value: "headphones", label: "Support", icon: HeadphonesIcon },
  { value: "building", label: "Management", icon: Building },
];

const workspaceColors = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
];

export default function CreateWorkspaceModal({ open, onOpenChange }: CreateWorkspaceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
      icon: "",
    },
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: CreateWorkspaceForm) => {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workspace created successfully!",
      });
      
      form.reset();
      onOpenChange(false);
      
      // Invalidate workspaces query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateWorkspaceForm) => {
    await createWorkspaceMutation.mutateAsync(data);
  };

  const selectedIcon = workspaceIcons.find(icon => icon.value === form.watch("icon"));
  const selectedColor = workspaceColors.find(color => color.value === form.watch("color"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your tasks by category or department.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Workspace Preview */}
            {(form.watch("name") || selectedIcon || selectedColor) && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${selectedColor?.class || 'bg-gray-300'}`}>
                    {selectedIcon ? (
                      <selectedIcon.icon className="h-5 w-5 text-white" />
                    ) : (
                      <Building className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {form.watch("name") || "Workspace Name"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {form.watch("description") || "No description"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Design Team, Sales Department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of what this workspace is for..."
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Icon Selection */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Icon *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {workspaceIcons.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => field.onChange(icon.value)}
                          className={`p-3 border rounded-lg flex flex-col items-center space-y-1 hover:bg-gray-50 transition-colors ${
                            field.value === icon.value 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200"
                          }`}
                        >
                          <icon.icon className="h-5 w-5 text-gray-600" />
                          <span className="text-xs text-gray-600">{icon.label}</span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Color *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {workspaceColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className={`p-3 border rounded-lg flex flex-col items-center space-y-1 hover:opacity-80 transition-opacity ${
                            field.value === color.value 
                              ? "border-gray-900 border-2" 
                              : "border-gray-200"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full ${color.class}`}></div>
                          <span className="text-xs text-gray-600">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWorkspaceMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createWorkspaceMutation.isPending ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}