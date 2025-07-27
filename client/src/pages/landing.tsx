import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, BarChart3, Rocket, Clock, Shield, Target, TrendingUp, FolderOpen } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TaskFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
            <Button 
              onClick={() => window.location.href = '/signup'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

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
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/signup'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started. It's FREE →
            </Button>
            <p className="text-sm text-gray-500 mt-4">Free Forever. No Credit Card.</p>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything your team is looking for
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
              TaskFlow's exceptional flexibility can handle any type of work. And we never stop innovating.
            </p>
          </div>

          {/* Main Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Organized Workspaces */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Organized Workspaces</h3>
                  <p className="text-purple-100 mb-6">
                    Create dedicated spaces for design, sales, development, and more. Keep projects organized and team members focused.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-sm text-purple-100">Unlimited workspaces</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-sm text-purple-100">Team member management</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Productivity Analytics */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Productivity Analytics</h3>
                  <p className="text-blue-100 mb-6">
                    Track team performance, task completion rates, and identify bottlenecks with comprehensive admin analytics.
                  </p>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-xs text-blue-100 mb-2">Analytics features:</div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>• Task completion tracking</div>
                      <div>• Team performance insights</div>
                      <div>• Workflow bottleneck detection</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ClickUp-Style Interface */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">ClickUp-Style Interface</h3>
                  <p className="text-indigo-100 mb-6">
                    Kanban boards, detailed task views, file uploads, and comments. Everything you need in one intuitive interface.
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
                        <span className="text-sm">File Attachments</span>
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
        </div>
      </div>

      {/* Bottom Feature Grid */}
      <div className="px-12 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
                    <div className="text-3xl font-bold">∞</div>
                    <div className="text-blue-100">Unlimited Workspaces</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Everything Your Team Needs */}
            <Card className="border-0 shadow-xl bg-gray-900 text-white p-8 rounded-3xl hover:shadow-2xl transition-all duration-300">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Everything Your Team Needs</h3>
                <p className="text-gray-300">
                  Built specifically for teams transitioning from WhatsApp chaos to organized productivity.
                </p>
                
                <div className="space-y-4 mt-8">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Task Management</div>
                      <div className="text-xs text-gray-400">Create, assign, and track with priorities</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Role-Based Access</div>
                      <div className="text-xs text-gray-400">Admin and Worker permissions</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Time Tracking</div>
                      <div className="text-xs text-gray-400">Estimated vs actual hours</div>
                    </div>
                  </div>
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
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/signup'}
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Your Free Account
          </Button>
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
  );
}