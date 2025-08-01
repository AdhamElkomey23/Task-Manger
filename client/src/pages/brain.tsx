import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, MessageSquare, Brain, Sparkles, Send, Loader2, User } from "lucide-react";
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white/70 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Brain
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100/80 text-purple-700 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by GPT-4o
                </Badge>
                <span className="text-sm text-gray-600">Your intelligent productivity assistant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r bg-white/50 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
                <Button
                  onClick={handleNewConversation}
                  size="sm"
                  disabled={createConversationMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {(conversations as any[]).length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No conversations yet</h3>
                  <p className="text-sm text-gray-500">Start a new chat to get AI assistance</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {(conversations as BrainConversation[]).map((conv: BrainConversation) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-xl cursor-pointer group transition-all duration-200 ${
                        selectedConversation === conv.id
                          ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
                          : "hover:bg-white/80 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{conv.title}</p>
                          <p className={`text-xs mt-1 ${
                            selectedConversation === conv.id ? "text-purple-100" : "text-gray-500"
                          }`}>
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
                          className={`opacity-0 group-hover:opacity-100 h-8 w-8 p-0 transition-opacity ${
                            selectedConversation === conv.id 
                              ? "hover:bg-white/20 text-white" 
                              : "hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to AI Brain</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Your intelligent assistant is ready to help with task planning, productivity advice, 
                    and answer any questions you have about your projects.
                  </p>
                  <Button 
                    onClick={handleNewConversation} 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-6">
                      {(currentConversation as any)?.messages && (currentConversation as any).messages.length > 0 ? (
                        <>
                          {((currentConversation as any).messages as ChatMessage[]).map((msg: ChatMessage, index: number) => (
                            <div
                              key={index}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  msg.role === "user" 
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600" 
                                    : "bg-gradient-to-r from-purple-500 to-indigo-600"
                                }`}>
                                  {msg.role === "user" ? (
                                    <User className="h-4 w-4 text-white" />
                                  ) : (
                                    <Brain className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div
                                  className={`p-4 rounded-2xl shadow-sm ${
                                    msg.role === "user"
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                      : "bg-white border border-gray-200"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                  {msg.timestamp && (
                                    <p className={`text-xs mt-2 ${
                                      msg.role === "user" ? "text-blue-100" : "text-gray-500"
                                    }`}>
                                      {format(new Date(msg.timestamp), "HH:mm")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                  <Brain className="h-4 w-4 text-white" />
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                              <MessageSquare className="h-8 w-8 text-purple-500" />
                            </div>
                            <p className="text-gray-500 font-medium">Start the conversation</p>
                            <p className="text-sm text-gray-400 mt-1">Send a message below to begin chatting</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="border-t bg-white/70 backdrop-blur-sm p-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Ask me anything about your tasks, productivity, or general questions..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={sendMessageMutation.isPending}
                          className="min-h-[48px] pr-12 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl shadow-sm"
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg rounded-xl h-12 px-6"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Press Enter to send • Shift+Enter for new line
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}