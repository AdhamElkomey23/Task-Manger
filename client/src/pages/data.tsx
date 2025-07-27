import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Download, 
  Search,
  Filter,
  FolderOpen,
  Calendar,
  User,
  MoreVertical,
  Eye,
  Trash2,
  Share
} from "lucide-react";
import Sidebar from "@/components/sidebar";

// Dummy file data with realistic content
const fileData = [
  {
    id: 1,
    name: "Project Requirements.docx",
    type: "document",
    size: "2.4 MB",
    uploadedAt: "2025-01-20",
    uploadedBy: "Sarah Johnson",
    description: "Detailed project requirements and specifications for Q1 deliverables",
    category: "Documentation",
    downloads: 23,
    lastAccessed: "2 hours ago"
  },
  {
    id: 2,
    name: "Design Mockups.fig",
    type: "design",
    size: "15.8 MB", 
    uploadedAt: "2025-01-19",
    uploadedBy: "Mike Chen",
    description: "UI/UX mockups for the new landing page redesign",
    category: "Design",
    downloads: 18,
    lastAccessed: "5 hours ago"
  },
  {
    id: 3,
    name: "Budget Analysis Q1 2025.xlsx",
    type: "spreadsheet",
    size: "892 KB",
    uploadedAt: "2025-01-18", 
    uploadedBy: "Lisa Rodriguez",
    description: "Financial analysis and budget breakdown for first quarter",
    category: "Finance",
    downloads: 31,
    lastAccessed: "1 day ago"
  },
  {
    id: 4,
    name: "Team Photo - Retreat 2024.jpg",
    type: "image",
    size: "4.2 MB",
    uploadedAt: "2025-01-17",
    uploadedBy: "John Smith", 
    description: "Team building retreat photos from December 2024",
    category: "HR",
    downloads: 12,
    lastAccessed: "3 days ago"
  },
  {
    id: 5,
    name: "Meeting Notes - Strategy Session.pdf",
    type: "document",
    size: "1.1 MB",
    uploadedAt: "2025-01-16",
    uploadedBy: "Emily Davis",
    description: "Strategic planning session notes and action items",
    category: "Management",
    downloads: 27,
    lastAccessed: "2 days ago"
  },
  {
    id: 6,
    name: "API Documentation v2.3.pdf",
    type: "document", 
    size: "3.7 MB",
    uploadedAt: "2025-01-15",
    uploadedBy: "Alex Kim",
    description: "Updated API documentation with new endpoints and examples",
    category: "Technical",
    downloads: 45,
    lastAccessed: "6 hours ago"
  },
  {
    id: 7,
    name: "Marketing Campaign Assets.zip",
    type: "archive",
    size: "28.3 MB",
    uploadedAt: "2025-01-14",
    uploadedBy: "Sophia Lee",
    description: "Complete marketing campaign materials including images, videos, and copy",
    category: "Marketing",
    downloads: 19,
    lastAccessed: "1 week ago"
  },
  {
    id: 8,
    name: "Customer Feedback Survey.xlsx",
    type: "spreadsheet",
    size: "654 KB",
    uploadedAt: "2025-01-13",
    uploadedBy: "David Brown",
    description: "Compiled customer feedback and satisfaction survey results",
    category: "Customer Success",
    downloads: 22,
    lastAccessed: "4 days ago"
  },
  {
    id: 9,
    name: "Code Review Checklist.md",
    type: "document",
    size: "45 KB",
    uploadedAt: "2025-01-12",
    uploadedBy: "Mike Chen",
    description: "Standardized code review checklist for development team",
    category: "Technical",
    downloads: 38,
    lastAccessed: "1 day ago"
  },
  {
    id: 10,
    name: "Office Floor Plan.dwg",
    type: "drawing",
    size: "2.1 MB",
    uploadedAt: "2025-01-11",
    uploadedBy: "Emily Davis",
    description: "Updated office layout and seating arrangement plan",
    category: "Operations",
    downloads: 8,
    lastAccessed: "1 week ago"
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "document":
      return <FileText className="h-8 w-8 text-blue-500" />;
    case "image":
      return <Image className="h-8 w-8 text-green-500" />;
    case "spreadsheet":
      return <File className="h-8 w-8 text-green-600" />;
    case "design":
      return <File className="h-8 w-8 text-purple-500" />;
    case "archive":
      return <FolderOpen className="h-8 w-8 text-yellow-500" />;
    case "drawing":
      return <File className="h-8 w-8 text-red-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

const getFileBadgeColor = (type: string) => {
  switch (type) {
    case "document":
      return "bg-blue-100 text-blue-800";
    case "image":
      return "bg-green-100 text-green-800";
    case "spreadsheet":
      return "bg-emerald-100 text-emerald-800";
    case "design":
      return "bg-purple-100 text-purple-800";
    case "archive":
      return "bg-yellow-100 text-yellow-800";
    case "drawing":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Data() {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (isLoading || !isAuthenticated) return null;

  const categories = ["All", ...Array.from(new Set(fileData.map(file => file.category)))];
  const filteredFiles = selectedCategory === "All" 
    ? fileData 
    : fileData.filter(file => file.category === selectedCategory);

  const totalFiles = fileData.length;
  const totalSize = fileData.reduce((sum, file) => {
    const size = parseFloat(file.size.split(' ')[0]);
    const unit = file.size.split(' ')[1];
    const sizeInMB = unit === 'KB' ? size / 1024 : (unit === 'GB' ? size * 1024 : size);
    return sum + sizeInMB;
  }, 0);
  const totalDownloads = fileData.reduce((sum, file) => sum + file.downloads, 0);
  const recentUploads = fileData.filter(file => {
    const uploadDate = new Date(file.uploadedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate > weekAgo;
  }).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data</h1>
              <p className="text-gray-600 mt-2">File upload and document management system</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search files..." className="pl-10 w-64" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <File className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FolderOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDownloads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                    <p className="text-2xl font-bold text-gray-900">{recentUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-sm"
                >
                  {category}
                  {category !== "All" && (
                    <Badge variant="secondary" className="ml-2">
                      {fileData.filter(f => f.category === category).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* File Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getFileBadgeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{file.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{file.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{file.uploadedBy}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Uploaded {file.uploadedAt}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{file.downloads}</span>
                        </div>
                        <span>•</span>
                        <span>Last accessed {file.lastAccessed}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Area */}
          <Card className="mt-8 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="p-12">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your files here, or click to browse
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Select Files
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, ZIP, RAR (Max 100MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}