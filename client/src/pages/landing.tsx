import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, BarChart3, Rocket, Clock, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TaskFlow</span>
          </div>
          <Button onClick={() => window.location.href = '/api/login'}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Streamline Your Team's 
              <span className="text-blue-600"> Workflow</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              TaskFlow replaces chaotic WhatsApp coordination with organized workspaces, 
              powerful analytics, and seamless task management for small to mid-size teams.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Free
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Organized Workspaces</CardTitle>
                <CardDescription>
                  Create dedicated spaces for design, sales, development, and more. 
                  Keep projects organized and team members focused.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Productivity Analytics</CardTitle>
                <CardDescription>
                  Track team performance, task completion rates, and identify bottlenecks 
                  with comprehensive admin analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>ClickUp-Style Interface</CardTitle>
                <CardDescription>
                  Kanban boards, detailed task views, file uploads, and comments. 
                  Everything you need in one intuitive interface.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything Your Team Needs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built specifically for teams transitioning from WhatsApp chaos to organized productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Task Management</h3>
                <p className="text-gray-600 text-sm">Create, assign, and track tasks with due dates, priorities, and tags</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Role-Based Access</h3>
                <p className="text-gray-600 text-sm">Admin and Worker roles with appropriate permissions and views</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Time Tracking</h3>
                <p className="text-gray-600 text-sm">Track estimated vs actual hours for better project planning</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 text-sm">Monthly productivity reports and task completion insights</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">File Attachments</h3>
                <p className="text-gray-600 text-sm">Upload images, documents, and files directly to tasks</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">External Links</h3>
                <p className="text-gray-600 text-sm">Add website links, resources, and references to tasks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Team's Productivity?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join teams who've replaced WhatsApp chaos with organized, trackable workflows
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Your Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">TaskFlow</span>
          </div>
          <p className="text-sm">
            © 2024 TaskFlow. Built for teams who value organized productivity.
          </p>
        </div>
      </footer>
    </div>
  );
}