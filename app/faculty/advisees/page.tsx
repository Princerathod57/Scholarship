"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetStudents } from "@/app/features/students/use-get-students";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { useSendMessage } from "@/app/features/messages";
import { Users, Search, User, Mail, Phone, GraduationCap, Trophy, MessageSquare, ExternalLink, Send, Bell, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Simple date formatting function
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function FacultyAdviseesPage() {
  const [search, setSearch] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  const { data: studentsData, isLoading: studentsLoading } = useGetStudents();
  const { data: applicationsData, isLoading: applicationsLoading } = useGetApplications();
  
  const isDataLoading = studentsLoading || applicationsLoading;
  
  // Send message function
  const handleSendMessage = async () => {
    if (!selectedStudent || !messageSubject.trim() || !messageContent.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Sending message to:", selectedStudent.user?.id || selectedStudent.userId || selectedStudent.id);
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedStudent.user?.id || selectedStudent.userId || selectedStudent.id,
          subject: messageSubject,
          content: messageContent,
          type: "GENERAL",
        }),
      });
      
      const responseData = await response.json();
      console.log("Response:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to send message");
      }
      
      toast.success("Message sent successfully! 🔔 Recipient will see it in their notifications.");
      
      // Refresh message queries for notifications
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      
      setShowMessageDialog(false);
      setSelectedStudent(null);
      setMessageSubject("");
      setMessageContent("");
    } catch (error: any) {
      console.error("Send message error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extract students array from API response
  const students = studentsData?.data || [];
  const applications = applicationsData?.data || [];
  
  // In a real app, filter by faculty advisor ID
  // For now, we'll use a mock filter or show all students
  const advisees = students.filter((student: any) => 
    // In production, this would filter by actual advisor relationship
    // For demo purposes, we'll show students who have applications
    applications.some((app: any) => app.studentId === student.id)
  );

  // Calculate statistics for each advisee
  const adviseesWithStats = advisees.map((student: any) => {
    const studentApps = applications.filter((app: any) => app.studentId === student.id);
    const approvedApps = studentApps.filter((app: any) => app.status === 'APPROVED');
    const pendingApps = studentApps.filter((app: any) => app.status === 'PENDING' || app.status === 'UNDER_REVIEW');
    
    return {
      ...student,
      totalScholarships: approvedApps.length,
      activeApplications: pendingApps.length,
      lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Mock last contact
    };
  });

  const filteredAdvisees = adviseesWithStats.filter((student: any) =>
    `${student.user?.name || ''}`.toLowerCase().includes(search.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    student.program?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getYearBadgeVariant = (year: string) => {
    switch (year) {
      case 'Freshman':
        return 'outline';
      case 'Sophomore':
        return 'secondary';
      case 'Junior':
        return 'default';
      case 'Senior':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getGpaBadgeVariant = (gpa: number) => {
    if (gpa >= 3.8) return 'default';
    if (gpa >= 3.5) return 'secondary';
    if (gpa >= 3.0) return 'outline';
    return 'destructive';
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your advisees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h1 className="text-3xl font-bold">My Advisees</h1>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Search Advisees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or major..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredAdvisees.length}</p>
                <p className="text-sm text-muted-foreground">Total Advisees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredAdvisees.reduce((sum: number, student: any) => sum + student.totalScholarships, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Awards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advisees List */}
      {filteredAdvisees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Advisees Found</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {search ? "No advisees match your search criteria." : "You don't have any assigned advisees yet."}
            </p>
            {search && (
              <Button onClick={() => setSearch("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAdvisees.map((student: any) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {student.user?.name || 'Unknown Student'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {student.user?.email || 'No email'}
                      </span>
                      {student.user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.user.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {student.program?.name && (
                      <Badge variant="secondary">
                        {student.program.name}
                      </Badge>
                    )}
                    {student.gpa && (
                      <Badge variant={getGpaBadgeVariant(student.gpa)}>
                        GPA: {student.gpa.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Program</p>
                    <p className="text-sm flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {student.program?.name || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scholarships</p>
                    <p className="text-sm flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {student.totalScholarships} awarded
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
                    <p className="text-sm">{student.activeApplications} pending</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                    <p className="text-sm">{student.studentId || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/students/${student.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/applications?studentId=${student.id}&studentName=${encodeURIComponent(student.user?.name || 'Student')}`}>
                    <Button variant="outline" size="sm">
                      <Trophy className="h-4 w-4 mr-1" />
                      View Applications
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowMessageDialog(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedStudent?.user?.name || "student"}
              <br />
              <span className="text-xs text-muted-foreground">
                📧 Recipient will be notified in their notification bell
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="content" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="content"
                placeholder="Enter your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowMessageDialog(false);
                setSelectedStudent(null);
                setMessageSubject("");
                setMessageContent("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !messageSubject.trim() || !messageContent.trim()}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
