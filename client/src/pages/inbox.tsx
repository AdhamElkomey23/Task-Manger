import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  User, 
  AlertCircle,
  FileText,
  Users,
  Calendar
} from "lucide-react";
import Sidebar from "@/components/sidebar";

// Dummy notification data
const notificationData = [
  {
    id: 1,
    type: "task_assigned",
    title: "New task assigned to you",
    message: "Sarah Johnson assigned you 'Update landing page design' in Marketing workspace",
    user: "Sarah Johnson",
    time: "2 minutes ago",
    read: false,
    priority: "high"
  },
  {
    id: 2,
    type: "task_completed",
    title: "Task completed",
    message: "Mike Chen completed 'Database optimization' task",
    user: "Mike Chen",
    time: "15 minutes ago",
    read: false,
    priority: "medium"
  },
  {
    id: 3,
    type: "document_uploaded",
    title: "New document uploaded",
    message: "Lisa Rodriguez uploaded 'Q1 Budget Analysis.xlsx' to the Data section",
    user: "Lisa Rodriguez",
    time: "1 hour ago",
    read: true,
    priority: "low"
  },
  {
    id: 4,
    type: "deadline_approaching",
    title: "Deadline approaching",
    message: "The task 'Client presentation preparation' is due tomorrow",
    user: "System",
    time: "2 hours ago",
    read: false,
    priority: "high"
  },
  {
    id: 5,
    type: "comment_added",
    title: "New comment added",
    message: "John Smith commented on 'Website redesign project' task",
    user: "John Smith",
    time: "3 hours ago",
    read: true,
    priority: "medium"
  },
  {
    id: 6,
    type: "workspace_invite",
    title: "Workspace invitation",
    message: "Emily Davis invited you to join 'Design Team' workspace",
    user: "Emily Davis",
    time: "5 hours ago",
    read: false,
    priority: "medium"
  },
  {
    id: 7,
    type: "task_overdue",
    title: "Task overdue",
    message: "The task 'Code review' is now overdue",
    user: "System",
    time: "1 day ago",
    read: true,
    priority: "high"
  },
  {
    id: 8,
    type: "meeting_reminder",
    title: "Meeting reminder",
    message: "Team standup meeting starts in 30 minutes",
    user: "System",
    time: "1 day ago",
    read: true,
    priority: "medium"
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "task_assigned":
    case "task_completed":
      return <User className="h-5 w-5" />;
    case "document_uploaded":
      return <FileText className="h-5 w-5" />;
    case "deadline_approaching":
    case "task_overdue":
      return <AlertCircle className="h-5 w-5" />;
    case "comment_added":
      return <Users className="h-5 w-5" />;
    case "workspace_invite":
      return <Users className="h-5 w-5" />;
    case "meeting_reminder":
      return <Calendar className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function Inbox() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) return null;

  const unreadCount = notificationData.filter(n => !n.read).length;
  const unreadNotifications = notificationData.filter(n => !n.read);
  const readNotifications = notificationData.filter(n => n.read);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
              <p className="text-gray-600 mt-2">Stay updated with team activity and notifications</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {unreadCount} unread
              </Badge>
              <Button variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{notificationData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
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
                    <p className="text-sm font-medium text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {notificationData.filter(n => n.priority === "high").length}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Read</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {notificationData.filter(n => n.read).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Unread Notifications</h2>
              <div className="space-y-4">
                {unreadNotifications.map((notification) => (
                  <Card key={notification.id} className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                              <Badge variant="secondary" className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-3">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-xs">
                                    {notification.user.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{notification.user}</span>
                              </div>
                              <span>•</span>
                              <span>{notification.time}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Read Notifications</h2>
              <div className="space-y-4">
                {readNotifications.map((notification) => (
                  <Card key={notification.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-700">{notification.title}</h3>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                              <Badge variant="outline" className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-xs">
                                    {notification.user.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{notification.user}</span>
                              </div>
                              <span>•</span>
                              <span>{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}