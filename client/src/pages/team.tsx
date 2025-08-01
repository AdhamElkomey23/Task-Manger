import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { CreateUserModal } from "@/components/create-user-modal";
import { EditUserModal } from "@/components/edit-user-modal";
import type { User } from "@shared/schema";

export default function Team() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: false,
    enabled: isAuthenticated,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(teamMember => 
    teamMember.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teamMember.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teamMember.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">
                {user?.role === "admin" 
                  ? "Add workers with email/password to access your workspace" 
                  : "View team members and their information"
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {/* Only admin users can add new workers */}
              {user?.role === "admin" && (
                <CreateUserModal>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Worker
                  </Button>
                </CreateUserModal>
              )}
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((teamMember) => (
                  <TableRow key={teamMember.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {teamMember.firstName?.[0]}{teamMember.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teamMember.firstName} {teamMember.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{teamMember.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={teamMember.role === "admin" ? "default" : "secondary"}>
                        {teamMember.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {teamMember.createdAt ? new Date(teamMember.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {/* Only admin users can edit/delete users */}
                      {user?.role === "admin" ? (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(teamMember)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(teamMember.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          View only
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No users found matching your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <EditUserModal
        user={editingUser}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </div>
  );
}