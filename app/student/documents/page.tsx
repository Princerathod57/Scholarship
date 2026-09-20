"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetDocuments } from "@/app/features/documents/use-get-documents";
import { FileText, Upload, Download, Eye, Trash2, Plus, FolderOpen, File } from "lucide-react";

// Simple date formatting function
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Simple file size formatting
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function StudentDocumentsPage() {
  const [search, setSearch] = useState("");
  
  // In a real app, this would fetch documents for the current student
  const { data: documents, isLoading } = useGetDocuments();
  
  // Mock data for demonstration
  const studentDocuments = [
    {
      id: "1",
      name: "Transcript - Fall 2024.pdf",
      type: "academic",
      size: 2048576,
      uploadedAt: new Date().toISOString(),
      status: "verified",
    },
    {
      id: "2", 
      name: "Letter of Recommendation - Dr. Smith.pdf",
      type: "recommendation",
      size: 1024768,
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
    },
    {
      id: "3",
      name: "Financial Aid Form.pdf", 
      type: "financial",
      size: 3072256,
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      status: "verified",
    },
  ];

  const filteredDocuments = studentDocuments.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return '📚';
      case 'recommendation':
        return '✍️';
      case 'financial':
        return '💰';
      default:
        return '📄';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Documents</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>

      {/* Search and Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Management
          </CardTitle>
          <CardDescription>
            Upload and manage your scholarship application documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-1" />
              Upload New
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Academic Records</p>
                <p className="text-sm text-muted-foreground">Transcripts, diplomas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Recommendations</p>
                <p className="text-sm text-muted-foreground">Letters of support</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold">Financial</p>
                <p className="text-sm text-muted-foreground">Aid forms, tax docs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {search ? "No documents match your search." : "You haven't uploaded any documents yet."}
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-1" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getTypeIcon(document.type)}</div>
                    <div>
                      <h3 className="font-semibold">{document.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Uploaded {formatDate(document.uploadedAt)}</span>
                        <span>{formatFileSize(document.size)}</span>
                        <Badge variant={getStatusBadgeVariant(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
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
      )}
    </div>
  );
}
