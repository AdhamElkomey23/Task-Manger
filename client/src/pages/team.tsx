import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle,
  Star,
  MoreVertical,
  Filter,
  Users as UsersIcon
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import type { User } from "@shared/schema";

// Dummy team member data with realistic information
const teamMembers = [
  {
    id: "1",
    email: "sarah.johnson@company.com",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "admin" as const,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-01-27"),
    department: "Product Management",
    position: "Senior Product Manager",
    lastActive: "Online now",
    tasksCompleted: 45,
    tasksInProgress: 3,
    avgResponseTime: "2.3 hours",
    performance: 92
  },
  {
    id: "2", 
    email: "mike.chen@company.com",
    firstName: "Mike",
    lastName: "Chen",
    role: "worker" as const,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2025-01-27"),
    department: "Engineering",
    position: "Full Stack Developer",
    lastActive: "5 minutes ago",
    tasksCompleted: 38,
    tasksInProgress: 5,
    avgResponseTime: "1.8 hours",
    performance: 88
  },
  {
    id: "3",
    email: "lisa.rodriguez@company.com", 
    firstName: "Lisa",
    lastName: "Rodriguez",
    role: "worker" as const,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2025-01-26"),
    department: "Finance",
    position: "Financial Analyst",
    lastActive: "2 hours ago",
    tasksCompleted: 31,
    tasksInProgress: 2,
    avgResponseTime: "3.1 hours",
    performance: 85
  },
  {
    id: "4",
    email: "john.smith@company.com",
    firstName: "John", 
    lastName: "Smith",
    role: "worker" as const,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2025-01-25"),
    department: "Design",
    position: "UI/UX Designer",
    lastActive: "1 day ago",
    tasksCompleted: 28,
    tasksInProgress: 4,
    avgResponseTime: "4.2 hours",
    performance: 82
  },
  {
    id: "5",
    email: "emily.davis@company.com",
    firstName: "Emily",
    lastName: "Davis", 
    role: "admin" as const,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2025-01-27"),
    department: "Operations",
    position: "Operations Manager",
    lastActive: "30 minutes ago",
    tasksCompleted: 52,
    tasksInProgress: 6,
    avgResponseTime: "1.5 hours",
    performance: 95
  },
  {
    id: "6",
    email: "alex.kim@company.com",
    firstName: "Alex",
    lastName: "Kim",
    role: "worker" as const,
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2025-01-24"),
    department: "Marketing",
    position: "Marketing Specialist",
    lastActive: "3 hours ago",
    tasksCompleted: 19,
    tasksInProgress: 2,
    avgResponseTime: "5.8 hours",
    performance: 68
  },
  {
    id: "7",
    email: "sophia.lee@company.com",
    firstName: "Sophia",
    lastName: "Lee",
    role: "worker" as const,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2025-01-27"),
    department: "Engineering",
    position: "Frontend Developer", 
    lastActive: "Online now",
    tasksCompleted: 42,
    tasksInProgress: 7,
    avgResponseTime: "2.0 hours",
    performance: 91
  },
  {
    id: "8",
    email: "david.brown@company.com",
    firstName: "David",
    lastName: "Brown",
    role: "worker" as const,
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2025-01-23"),
    department: "Support",
    position: "Customer Success Manager",
    lastActive: "2 days ago",
    tasksCompleted: 15,
    tasksInProgress: 1,
    avgResponseTime: "6.2 hours",
    performance: 65
  }
];

const getStatusColor = (lastActive: string) => {
  if (lastActive.includes("Online now")) {
    return "bg-green-500";
  } else if (lastActive.includes("minutes ago") || lastActive.includes("hour")) {
    return "bg-yellow-500";
  } else {
    return "bg-gray-400";
  }
};

const getPerformanceColor = (performance: number) => {
  if (performance >= 90) return "text-green-600 bg-green-100";
  if (performance >= 80) return "text-blue-600 bg-blue-100";
  if (performance >= 70) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

export default function Team() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) return null;

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => 
    m.lastActive.includes("Online now") || m.lastActive.includes("minutes ago")
  ).length;
  const adminMembers = teamMembers.filter(m => m.role === "admin").length;
  const avgPerformance = Math.round(
    teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team</h1>
              <p className="text-gray-600 mt-2">Manage and monitor team members</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search team members..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Team Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Now</p>
                    <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{adminMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                    <p className="text-2xl font-bold text-gray-900">{avgPerformance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-lg">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div 
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.lastActive)}`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{member.position}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                            {member.role}
                          </Badge>
                          <span className="text-xs text-gray-500">{member.department}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Last active: {member.lastActive}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{member.tasksCompleted}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">{member.tasksInProgress}</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Performance</p>
                        <Badge className={`text-xs ${getPerformanceColor(member.performance)}`}>
                          {member.performance}%
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg Response Time</span>
                        <span className="font-medium text-gray-900">{member.avgResponseTime}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}