import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Target,
  Award,
  Activity,
  Zap
} from "lucide-react";
import Sidebar from "@/components/sidebar";

// Dummy team data for analysis
const teamAnalytics = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "admin",
    department: "Product Management",
    tasksCompleted: 45,
    tasksInProgress: 3,
    avgCompletionTime: 2.3,
    productivity: 92,
    thisMonthTasks: 12,
    lastMonthTasks: 15,
    onTimeDelivery: 87,
    qualityScore: 94,
    collaborationScore: 89
  },
  {
    id: "2", 
    name: "Mike Chen",
    role: "worker",
    department: "Engineering",
    tasksCompleted: 38,
    tasksInProgress: 5,
    avgCompletionTime: 1.8,
    productivity: 88,
    thisMonthTasks: 18,
    lastMonthTasks: 16,
    onTimeDelivery: 92,
    qualityScore: 91,
    collaborationScore: 85
  },
  {
    id: "3",
    name: "Lisa Rodriguez",
    role: "worker", 
    department: "Finance",
    tasksCompleted: 31,
    tasksInProgress: 2,
    avgCompletionTime: 3.1,
    productivity: 85,
    thisMonthTasks: 8,
    lastMonthTasks: 12,
    onTimeDelivery: 78,
    qualityScore: 88,
    collaborationScore: 92
  },
  {
    id: "4",
    name: "John Smith",
    role: "worker",
    department: "Design", 
    tasksCompleted: 28,
    tasksInProgress: 4,
    avgCompletionTime: 4.2,
    productivity: 82,
    thisMonthTasks: 7,
    lastMonthTasks: 11,
    onTimeDelivery: 71,
    qualityScore: 85,
    collaborationScore: 78
  },
  {
    id: "5",
    name: "Emily Davis",
    role: "admin",
    department: "Operations",
    tasksCompleted: 52,
    tasksInProgress: 6,
    avgCompletionTime: 1.5,
    productivity: 95,
    thisMonthTasks: 22,
    lastMonthTasks: 18,
    onTimeDelivery: 95,
    qualityScore: 96,
    collaborationScore: 94
  },
  {
    id: "6",
    name: "Alex Kim",
    role: "worker",
    department: "Marketing",
    tasksCompleted: 19,
    tasksInProgress: 2,
    avgCompletionTime: 5.8,
    productivity: 68,
    thisMonthTasks: 5,
    lastMonthTasks: 8,
    onTimeDelivery: 62,
    qualityScore: 72,
    collaborationScore: 75
  },
  {
    id: "7",
    name: "Sophia Lee",
    role: "worker",
    department: "Engineering",
    tasksCompleted: 42,
    tasksInProgress: 7,
    avgCompletionTime: 2.0,
    productivity: 91,
    thisMonthTasks: 19,
    lastMonthTasks: 17,
    onTimeDelivery: 89,
    qualityScore: 93,
    collaborationScore: 87
  },
  {
    id: "8",
    name: "David Brown",
    role: "worker",
    department: "Support",
    tasksCompleted: 15,
    tasksInProgress: 1,
    avgCompletionTime: 6.2,
    productivity: 65,
    thisMonthTasks: 3,
    lastMonthTasks: 7,
    onTimeDelivery: 58,
    qualityScore: 69,
    collaborationScore: 71
  }
];

const getPerformanceColor = (score: number) => {
  if (score >= 90) return "text-green-600 bg-green-100";
  if (score >= 80) return "text-blue-600 bg-blue-100";
  if (score >= 70) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

const getPerformanceIcon = (score: number) => {
  if (score >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (score >= 70) return <Activity className="h-4 w-4 text-blue-600" />;
  return <TrendingDown className="h-4 w-4 text-red-600" />;
};

const getInsightMessage = (member: typeof teamAnalytics[0]) => {
  const issues = [];
  
  if (member.productivity < 70) {
    issues.push("Low overall productivity");
  }
  if (member.thisMonthTasks < 8 && member.role === "worker") {
    issues.push("Below average task completion this month");
  }
  if (member.onTimeDelivery < 70) {
    issues.push("Frequent deadline misses");
  }
  if (member.avgCompletionTime > 5) {
    issues.push("Slower than average completion time");
  }
  if (member.collaborationScore < 75) {
    issues.push("Limited team collaboration");
  }

  if (issues.length === 0) {
    return {
      type: "positive",
      message: "Performing excellently across all metrics"
    };
  } else if (issues.length >= 3) {
    return {
      type: "critical",
      message: `Multiple areas need attention: ${issues.slice(0, 2).join(", ")} and ${issues.length - 2} more issues`
    };
  } else {
    return {
      type: "warning", 
      message: issues.join(" and ")
    };
  }
};

export default function Analysis() {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>("all");

  if (isLoading || !isAuthenticated) return null;

  const selectedMember = selectedUser === "all" ? null : teamAnalytics.find(m => m.id === selectedUser);
  
  // Overall team statistics
  const totalTasks = teamAnalytics.reduce((sum, m) => sum + m.tasksCompleted, 0);
  const avgProductivity = Math.round(teamAnalytics.reduce((sum, m) => sum + m.productivity, 0) / teamAnalytics.length);
  const topPerformer = teamAnalytics.reduce((best, member) => 
    member.productivity > best.productivity ? member : best
  );
  const underperformers = teamAnalytics.filter(m => m.productivity < 75);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis</h1>
              <p className="text-gray-600 mt-2">Performance overview and productivity insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {teamAnalytics.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Overview Cards */}
          {selectedUser === "all" ? (
            <>
              {/* Team Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Team Size</p>
                        <p className="text-2xl font-bold text-gray-900">{teamAnalytics.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Productivity</p>
                        <p className="text-2xl font-bold text-gray-900">{avgProductivity}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Need Attention</p>
                        <p className="text-2xl font-bold text-gray-900">{underperformers.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performer Highlight */}
              <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Top Performer</h3>
                        <p className="text-green-600 font-medium">{topPerformer.name}</p>
                        <p className="text-sm text-gray-600">{topPerformer.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{topPerformer.productivity}%</p>
                      <p className="text-sm text-gray-600">Productivity Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamAnalytics.map((member) => {
                  const insight = getInsightMessage(member);
                  return (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{member.name}</h3>
                              <p className="text-sm text-gray-600">{member.department}</p>
                              <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs mt-1">
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              {getPerformanceIcon(member.productivity)}
                              <Badge className={`${getPerformanceColor(member.productivity)}`}>
                                {member.productivity}%
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">{member.thisMonthTasks}</p>
                            <p className="text-xs text-gray-500">This Month</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-blue-600">{member.tasksInProgress}</p>
                            <p className="text-xs text-gray-500">In Progress</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-green-600">{member.onTimeDelivery}%</p>
                            <p className="text-xs text-gray-500">On Time</p>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg mb-4 ${
                          insight.type === "positive" ? "bg-green-50 border border-green-200" :
                          insight.type === "critical" ? "bg-red-50 border border-red-200" :
                          "bg-yellow-50 border border-yellow-200"
                        }`}>
                          <div className="flex items-start space-x-2">
                            {insight.type === "positive" ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : insight.type === "critical" ? (
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            )}
                            <p className={`text-sm ${
                              insight.type === "positive" ? "text-green-700" :
                              insight.type === "critical" ? "text-red-700" :
                              "text-yellow-700"
                            }`}>
                              {insight.message}
                            </p>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedUser(member.id)}
                        >
                          View Detailed Analysis
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : selectedMember && (
            <>
              {/* Individual Performance Analysis */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="text-xl">
                          {selectedMember.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{selectedMember.name}</CardTitle>
                        <p className="text-gray-600">{selectedMember.department}</p>
                        <Badge variant={selectedMember.role === "admin" ? "default" : "secondary"} className="mt-2">
                          {selectedMember.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPerformanceIcon(selectedMember.productivity)}
                        <span className="text-3xl font-bold text-gray-900">{selectedMember.productivity}%</span>
                      </div>
                      <p className="text-sm text-gray-600">Overall Productivity</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedMember.tasksCompleted}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedMember.avgCompletionTime}d</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedMember.onTimeDelivery}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Collaboration</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedMember.collaborationScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{selectedMember.thisMonthTasks} tasks</span>
                          {selectedMember.thisMonthTasks > selectedMember.lastMonthTasks ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Month</span>
                        <span className="font-semibold">{selectedMember.lastMonthTasks} tasks</span>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Change</span>
                          <span className={`font-semibold ${
                            selectedMember.thisMonthTasks > selectedMember.lastMonthTasks ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedMember.thisMonthTasks > selectedMember.lastMonthTasks ? '+' : ''}
                            {selectedMember.thisMonthTasks - selectedMember.lastMonthTasks} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quality Score</span>
                        <Badge className={getPerformanceColor(selectedMember.qualityScore)}>
                          {selectedMember.qualityScore}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">On-Time Delivery</span>
                        <Badge className={getPerformanceColor(selectedMember.onTimeDelivery)}>
                          {selectedMember.onTimeDelivery}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Team Collaboration</span>
                        <Badge className={getPerformanceColor(selectedMember.collaborationScore)}>
                          {selectedMember.collaborationScore}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights and Recommendations */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${
                    getInsightMessage(selectedMember).type === "positive" ? "bg-green-50 border border-green-200" :
                    getInsightMessage(selectedMember).type === "critical" ? "bg-red-50 border border-red-200" :
                    "bg-yellow-50 border border-yellow-200"
                  }`}>
                    <div className="flex items-start space-x-3">
                      {getInsightMessage(selectedMember).type === "positive" ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      ) : getInsightMessage(selectedMember).type === "critical" ? (
                        <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`font-semibold ${
                          getInsightMessage(selectedMember).type === "positive" ? "text-green-800" :
                          getInsightMessage(selectedMember).type === "critical" ? "text-red-800" :
                          "text-yellow-800"
                        }`}>
                          {getInsightMessage(selectedMember).type === "positive" ? "Excellent Performance" :
                           getInsightMessage(selectedMember).type === "critical" ? "Needs Immediate Attention" :
                           "Improvement Opportunities"}
                        </p>
                        <p className={`mt-1 ${
                          getInsightMessage(selectedMember).type === "positive" ? "text-green-700" :
                          getInsightMessage(selectedMember).type === "critical" ? "text-red-700" :
                          "text-yellow-700"
                        }`}>
                          {getInsightMessage(selectedMember).message}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}