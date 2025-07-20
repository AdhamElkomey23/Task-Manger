import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Zap, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-white text-4xl" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to TaskFlow
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Modern task management for teams. Organize workspaces, track progress, 
            and collaborate seamlessly with role-based access control.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 mb-12"
            onClick={handleLogin}
          >
            Get Started
          </Button>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Team Collaboration
                </h3>
                <p className="text-gray-600">
                  Organize teams into workspaces with role-based permissions
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Kanban Boards
                </h3>
                <p className="text-gray-600">
                  Visual task management with drag-and-drop functionality
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analytics
                </h3>
                <p className="text-gray-600">
                  Track productivity and performance with detailed insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
