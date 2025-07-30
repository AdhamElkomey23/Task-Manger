import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, MessageSquare, Brain, Sparkles, Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Sidebar from "@/components/sidebar";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface BrainConversation {
  id: number;
  userId: string;
  title: string;
  messages: ChatMessage[];
  workspaceId?: number;
  taskId?: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function BrainPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

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

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/brain/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch current conversation
  const { data: currentConversation } = useQuery({
    queryKey: ["/api/brain/conversations", selectedConversation],
    enabled: !!selectedConversation && isAuthenticated,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/brain/conversations", { title });
      return response.json();
    },
    onSuccess: (newConversation: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain/conversations"] });
      setSelectedConversation(newConversation.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; conversationId?: number }) => {
      const response = await apiRequest("POST", "/api/brain/chat", data);
      return response.json();
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/brain/conversations", selectedConversation] });
      if (!selectedConversation && response.conversation) {
        setSelectedConversation(response.conversation.id);
      }
      setMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/brain/conversations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brain/conversations"] });
      if (selectedConversation) {
        setSelectedConversation(null);
      }
      toast({
        title: "Success",
        description: "Conversation deleted successfully.",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    setIsTyping(true);
    sendMessageMutation.mutate({
      message: message.trim(),
      conversationId: selectedConversation || undefined,
    });
  };

  const handleNewConversation = () => {
    const title = "New Conversation";
    createConversationMutation.mutate(title);
  };

  const handleDeleteConversation = (id: number) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversationMutation.mutate(id);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [(currentConversation as any)?.messages, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading || !isAuthenticated) return null;

  if (conversationsLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">AI Brain</h1>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by GPT-4o
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Your built-in AI assistant for task planning, productivity advice, and general assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Conversations Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <Button
              onClick={handleNewConversation}
              size="sm"
              disabled={createConversationMutation.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {(conversations as any[]).length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new chat to get help</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {(conversations as BrainConversation[]).map((conv: BrainConversation) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer group transition-colors ${
                        selectedConversation === conv.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{conv.title}</p>
                          <p className="text-xs opacity-70">
                            {format(new Date(conv.updatedAt), "MMM d, HH:mm")}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          {!selectedConversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Welcome to AI Brain</h3>
                <p className="text-muted-foreground mb-4">
                  Start a new conversation to get AI assistance with your tasks and projects.
                </p>
                <Button onClick={handleNewConversation} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="border-b">
                <CardTitle className="text-lg">
                  {(currentConversation as any)?.title || "Loading..."}
                </CardTitle>
                <CardDescription>
                  AI-powered assistance for your productivity needs
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0 flex flex-col h-[500px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {(currentConversation as any)?.messages && (currentConversation as any).messages.length > 0 ? (
                    <div className="space-y-4">
                      {((currentConversation as any).messages as ChatMessage[]).map((msg: ChatMessage, index: number) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            {msg.timestamp && (
                              <p className="text-xs opacity-70 mt-1">
                                {format(new Date(msg.timestamp), "HH:mm")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Start the conversation by sending a message below
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <Separator />

                {/* Message Input */}
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about your tasks, productivity, or general questions..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendMessageMutation.isPending}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}