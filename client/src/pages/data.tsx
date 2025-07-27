import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Search,
  Trash2,
  Calendar,
  User,
  HardDrive,
  Plus,
  Folder,
  FolderPlus,
  Grid,
  List
} from "lucide-react";
import type { File as FileType } from "@shared/schema";

type FileWithUploader = FileType & {
  uploader: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

// Predefined categories with their file type patterns
const PREDEFINED_CATEGORIES = {
  'Images': ['image/'],
  'Documents': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml', 'text/'],
  'Spreadsheets': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml'],
  'Archives': ['application/zip', 'application/x-rar', 'application/x-7z'],
  'Videos': ['video/'],
  'Audio': ['audio/'],
};

export default function Data() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'folders'>('folders');
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("General");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading: filesLoading } = useQuery<FileWithUploader[]>({
    queryKey: ["/api/files"],
    enabled: isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);
    formData.append("description", `Uploaded file: ${file.name}`);
    
    uploadMutation.mutate(formData);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    // For now, we'll just add it to the upload category options
    // In a real app, you might want to store custom folders in the database
    setUploadCategory(newFolderName);
    setNewFolderName("");
    setIsCreateFolderOpen(false);
    
    toast({
      title: "Success",
      description: `Folder "${newFolderName}" created`,
    });
  };

  const handleDeleteFile = (fileId: number, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(fileId);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
    if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes("word") || fileType.includes("document")) return <FileText className="h-8 w-8 text-blue-600" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileText className="h-8 w-8 text-green-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCategoryByFileType = (fileType: string): string => {
    for (const [category, patterns] of Object.entries(PREDEFINED_CATEGORIES)) {
      if (patterns.some(pattern => fileType.startsWith(pattern))) {
        return category;
      }
    }
    return 'Other';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Images': return <Image className="h-6 w-6 text-blue-500" />;
      case 'Documents': return <FileText className="h-6 w-6 text-red-500" />;
      case 'Spreadsheets': return <FileText className="h-6 w-6 text-green-600" />;
      case 'Archives': return <File className="h-6 w-6 text-yellow-600" />;
      case 'Videos': return <File className="h-6 w-6 text-purple-600" />;
      case 'Audio': return <File className="h-6 w-6 text-pink-600" />;
      default: return <Folder className="h-6 w-6 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'All') return matchesSearch;
    
    // Check if it's a predefined category
    if (PREDEFINED_CATEGORIES[selectedCategory]) {
      const autoCategory = getCategoryByFileType(file.fileType);
      return matchesSearch && autoCategory === selectedCategory;
    }
    
    // Check custom category
    return matchesSearch && file.category === selectedCategory;
  });

  // Group files by category for folder view
  const groupedFiles = files.reduce((acc, file) => {
    const autoCategory = getCategoryByFileType(file.fileType);
    const category = file.category && !PREDEFINED_CATEGORIES[file.category] ? file.category : autoCategory;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {} as Record<string, FileWithUploader[]>);

  // Get all unique categories (both predefined and custom)
  const allCategories = ['All', ...Object.keys(PREDEFINED_CATEGORIES), ...Array.from(new Set(files.map(f => f.category).filter(c => c && !PREDEFINED_CATEGORIES[c])))];
  const customCategories = Array.from(new Set(files.map(f => f.category).filter(c => c && !PREDEFINED_CATEGORIES[c])));
  const availableUploadCategories = [...Object.keys(PREDEFINED_CATEGORIES), 'General', ...customCategories];

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">File Manager</h1>
              <p className="text-gray-600 mt-1">Upload and manage your files - Word, Excel, PDF, images, and more</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center">
                        {category !== 'All' && getCategoryIcon(category)}
                        <span className={category !== 'All' ? 'ml-2' : ''}>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'folders' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('folders')}
                >
                  <Folder className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folderName">Folder Name</Label>
                      <Input
                        id="folderName"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateFolder}>
                        Create Folder
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={uploading}>
                    <Plus className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUploadCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center">
                                {getCategoryIcon(category)}
                                <span className="ml-2">{category}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="*/*"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <HardDrive className="h-12 w-12 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Upload className="h-12 w-12 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatFileSize(files.reduce((total, file) => total + file.fileSize, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-12 w-12 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">File Types</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(files.map(f => f.fileType.split('/')[0])).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Files Content */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {viewMode === 'folders' ? 'File Folders' : 'Your Files'}
                </h2>
                <span className="text-sm text-gray-500">
                  {viewMode === 'folders' ? Object.keys(groupedFiles).length + ' folders' : filteredFiles.length + ' files'}
                </span>
              </div>
              
              {filesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading files...</div>
                </div>
              ) : viewMode === 'folders' ? (
                // Folder View
                Object.keys(groupedFiles).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Folder className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
                    <p className="text-gray-500 mb-4">Upload your first file to create folders</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
                      <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {setSelectedCategory(category); setViewMode('grid');}}>
                        <CardContent className="p-6 text-center">
                          <div className="flex flex-col items-center">
                            {getCategoryIcon(category)}
                            <h3 className="text-sm font-medium text-gray-900 mt-3 mb-1">{category}</h3>
                            <p className="text-xs text-gray-500">{categoryFiles.length} files</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatFileSize(categoryFiles.reduce((total, file) => total + file.fileSize, 0))}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                // Grid View
                filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <File className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || selectedCategory !== 'All' ? "No files found" : "No files uploaded yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || selectedCategory !== 'All' ? "Try adjusting your filters" : "Upload your first file to get started"}
                    </p>
                    {!searchTerm && selectedCategory === 'All' && (
                      <Button onClick={() => setViewMode('folders')}>
                        <Folder className="mr-2 h-4 w-4" />
                        View Folders
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCategory !== 'All' && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedCategory('All')}>
                          ← Back to All Files
                        </Button>
                        <div className="flex items-center">
                          {getCategoryIcon(selectedCategory)}
                          <span className="ml-2 font-medium">{selectedCategory}</span>
                          <Badge variant="secondary" className="ml-2">{filteredFiles.length}</Badge>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFiles.map((file) => (
                        <Card key={file.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                {getFileIcon(file.fileType)}
                                <div className="ml-3 flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {file.originalName}
                                  </h3>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.fileUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFile(file.id, file.originalName)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {file.category && (
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {file.category}
                              </Badge>
                            )}
                            
                            {file.description && (
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                {file.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {file.uploader.firstName} {file.uploader.lastName}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "N/A"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}