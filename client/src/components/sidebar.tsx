import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import CreateWorkspaceModal from "./create-workspace-modal";
import { 
  CheckSquare, 
  User, 
  Plus, 
  BarChart3, 
  Users, 
  Building, 
  LogOut,
  Folder,
  Home,
  Inbox,
  Database,
  PieChart,
  Briefcase,
  Palette,
  TrendingUp,
  Settings,
  Code,
  Megaphone,
  HeadphonesIcon
} from "lucide-react";
import type { WorkspaceWithDetails } from "@shared/schema";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const { data: workspaces = [] } = useQuery<WorkspaceWithDetails[]>({
    queryKey: ["/api/workspaces"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isActive = (path: string) => location === path;

  const getWorkspaceIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      briefcase: Briefcase,
      palette: Palette,
      "trending-up": TrendingUp,
      settings: Settings,
      users: Users,
      code: Code,
      megaphone: Megaphone,
      headphones: HeadphonesIcon,
      building: Building,
    };
    return iconMap[iconName] || Building;
  };

  const getWorkspaceColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      teal: "bg-teal-500",
    };
    return colorMap[color] || "bg-gray-500";
  };

  return (
    <>
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">TaskFlow</span>
          </div>
          
          {/* User Profile */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {/* Main Pages */}
            <Link href="/">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Home className="mr-3 h-5 w-5" />
                Home
              </a>
            </Link>
            
            <Link href="/inbox">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/inbox") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Inbox className="mr-3 h-5 w-5" />
                Inbox
              </a>
            </Link>
            
            <Link href="/team">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/team") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Users className="mr-3 h-5 w-5" />
                Team
              </a>
            </Link>
            
            <Link href="/data">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/data") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Database className="mr-3 h-5 w-5" />
                Data
              </a>
            </Link>
            
            <Link href="/analysis">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/analysis") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <PieChart className="mr-3 h-5 w-5" />
                Analysis
              </a>
            </Link>
            
            <Link href="/create-task">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                isActive("/create-task") 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Plus className="mr-3 h-5 w-5" />
                Create Task
              </a>
            </Link>
            
            {/* Workspaces Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Workspaces
                </h3>
                {user?.role === "admin" && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowCreateWorkspace(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-1">
                {workspaces.map((workspace) => {
                  const IconComponent = getWorkspaceIcon(workspace.icon || "building");
                  return (
                    <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                      <a className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                        location.startsWith(`/workspace/${workspace.id}`)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}>
                        <div className={`p-1.5 rounded mr-3 ${getWorkspaceColorClass(workspace.color || "blue")}`}>
                          <IconComponent className="h-3 w-3 text-white" />
                        </div>
                        <span className="flex-1 truncate">{workspace.name}</span>
                        <span className="text-xs text-gray-500">
                          {workspace.taskCount || 0}
                        </span>
                      </a>
                    </Link>
                  );
                })}
                
                {workspaces.length === 0 && (
                  <div className="px-3 py-4 text-center text-gray-500">
                    <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No workspaces yet</p>
                    {user?.role === "admin" && (
                      <button 
                        onClick={() => setShowCreateWorkspace(true)}
                        className="text-blue-600 hover:text-blue-700 text-xs mt-1"
                      >
                        Create your first workspace
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Admin Section */}
            {user?.role === "admin" && (
              <div className="pt-8 border-t border-gray-200">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                <div className="space-y-1">
                  <Link href="/admin/analytics">
                    <a className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                      isActive("/admin/analytics")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                      <BarChart3 className="mr-3 h-5 w-5" />
                      Analytics
                    </a>
                  </Link>
                  <Link href="/admin/users">
                    <a className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                      isActive("/admin/users")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                      <Users className="mr-3 h-5 w-5" />
                      User Management
                    </a>
                  </Link>
                  <Link href="/admin/workspaces">
                    <a className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                      isActive("/admin/workspaces")
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                      <Building className="mr-3 h-5 w-5" />
                      Workspaces
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </nav>
          
          {/* Logout */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-500 hover:text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <CreateWorkspaceModal 
        open={showCreateWorkspace} 
        onOpenChange={setShowCreateWorkspace} 
      />
    </>
  );
}
