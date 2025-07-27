import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  BarChart3, 
  Users, 
  FolderOpen,
  Calendar,
  Target,
  TrendingUp
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import { CreateWorkspaceModal } from "@/components/create-workspace-modal";
import type { WorkspaceWithDetails, TaskWithDetails } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
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

  const { data: workspaces = [] } = useQuery<WorkspaceWithDetails[]>({
    queryKey: ["/api/workspaces"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: myTasks = [] } = useQuery<TaskWithDetails[]>({
    queryKey: ["/api/tasks"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/summary"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) return null;

  // Calculate task statistics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = myTasks.filter(task => 
    task.dueDate && new Date(task.dueDate.toString()) < new Date() && task.status !== 'done'
  ).length;

  const recentTasks = myTasks
    .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime())
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-gray-900 mb-6">
                The everything app, <span className="text-blue-600">for work</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Get everyone working in a single platform designed to manage any type of work.
              </p>
              <CreateWorkspaceModal>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Get Started. It's FREE →
                </Button>
              </CreateWorkspaceModal>
              <p className="text-sm text-gray-500 mt-4">Free Forever. No Credit Card.</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="px-12 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Everything your team is looking for
            </h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
              ClickUp's exceptional flexibility can handle any type of work. And we never stop innovating.
            </p>

            {/* Main Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* AI-powered productivity */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">AI-powered productivity</h3>
                    <p className="text-purple-100 mb-6">
                      Get work done faster with the only AI-powered assistant tailored to your role.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-sm text-purple-100">Generate action items</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-sm text-purple-100">Use simple language</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* View work your way */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">View work your way</h3>
                    <p className="text-blue-100 mb-6">
                      Instantly switch between 15 views including list, board, gantt, and more.
                    </p>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-xs text-blue-100 mb-2">Quick stats:</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-2xl font-bold">{totalTasks}</div>
                          <div className="text-blue-100">Total Tasks</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{completedTasks}</div>
                          <div className="text-blue-100">Completed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Customize in a click */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Customize in a click</h3>
                    <p className="text-indigo-100 mb-6">
                      Configuring ClickUp for different types of work is as easy as flipping a switch.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5" />
                          <span className="text-sm">Time Tracking</span>
                        </div>
                        <div className="w-10 h-6 bg-white rounded-full relative">
                          <div className="w-4 h-4 bg-indigo-600 rounded-full absolute top-1 right-1"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5" />
                          <span className="text-sm">Team Collaboration</span>
                        </div>
                        <div className="w-10 h-6 bg-white rounded-full relative">
                          <div className="w-4 h-4 bg-indigo-600 rounded-full absolute top-1 right-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Feature Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Plays well with others & Replaces them entirely */}
              <div className="grid gap-6">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Plays well with others</h3>
                    <p className="text-purple-100">
                      Easily integrates with the tools you already use.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-6">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Z</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Replaces them entirely</h3>
                    <p className="text-blue-100">
                      Eliminate app sprawl and reduce software spend.
                    </p>
                    <div className="flex items-center space-x-4 mt-6">
                      <div className="text-3xl font-bold">{workspaces.length}</div>
                      <div className="text-blue-100">Active Workspaces</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Search everything */}
              <Card className="border-0 shadow-xl bg-gray-900 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Search everything</h3>
                  <p className="text-gray-300">
                    Find any file in ClickUp, a connected app, or your local drive, from one place.
                  </p>
                  
                  {/* Mock search results */}
                  <div className="space-y-4 mt-8">
                    {recentTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{task.title}</div>
                          <div className="text-xs text-gray-400 capitalize">{task.status.replace('-', ' ')} • {task.priority} priority</div>
                        </div>
                      </div>
                    ))}
                    {recentTasks.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No tasks to display</p>
                        <CreateWorkspaceModal>
                          <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800">
                            Create Your First Workspace
                          </Button>
                        </CreateWorkspaceModal>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-12 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Team's Productivity?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join teams who've replaced WhatsApp chaos with organized, trackable workflows
            </p>
            <CreateWorkspaceModal>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Your Free Account
              </Button>
            </CreateWorkspaceModal>
          </div>
        </div>

        {/* Trusted by section */}
        <div className="px-12 py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600 mb-8">Trusted by the world's leading businesses</p>
            <div className="flex items-center justify-center space-x-12 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Microsoft</div>
              <div className="text-2xl font-bold text-gray-400">Google</div>
              <div className="text-2xl font-bold text-gray-400">Spotify</div>
              <div className="text-2xl font-bold text-gray-400">Airbnb</div>
              <div className="text-2xl font-bold text-gray-400">Nike</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}