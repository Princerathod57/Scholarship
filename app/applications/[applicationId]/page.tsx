"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGetApplications } from "@/app/features/applications/use-get-applications";
import { useApproveApplication } from "@/app/features/applications/use-approve-application";
import { useRejectApplication } from "@/app/features/applications/use-reject-application";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ArrowLeft, 
  FileText, 
  Award, 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Check,
  X,
  BookOpen,
  GraduationCap,
  Phone,
  Mail
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminApplicationDetailsPage() {
  const { applicationId } = useParams();
  const router = useRouter();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: applicationsData, isLoading } = useGetApplications();
  const applications = applicationsData?.data || [];
  const application = applications.find((app: any) => app.id === applicationId);

  const approveApplicationMutation = useApproveApplication();
  const rejectApplicationMutation = useRejectApplication();

  const handleApprove = async () => {
    if (!application) return;
    
    try {
      await approveApplicationMutation.mutateAsync({
        id: application.id,
        awardedAmount: application.appliedAmount || application.scholarship?.amount,
        reviewNotes: reviewNotes || "Application approved"
      });
      setIsApproveDialogOpen(false);
      setReviewNotes("");
      toast.success("Application approved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve application");
    }
  };

  const handleReject = async () => {
    if (!application) return;
    
    try {
      await rejectApplicationMutation.mutateAsync({
        id: application.id,
        reason: reviewNotes || "Application rejected",
        reviewNotes: reviewNotes
      });
      setIsRejectDialogOpen(false);
      setReviewNotes("");
      toast.success("Application rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject application");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-6xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Application not found. Please check the URL or browse applications.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/applications">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'UNDER_REVIEW':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'PENDING':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      case 'UNDER_REVIEW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const canApproveOrReject = application.status === 'PENDING' || application.status === 'UNDER_REVIEW';

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Application Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Application #{application.applicationId || application.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(application.submittedAt || application.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <span className="font-medium">Status: {application.status.replace('_', ' ')}</span>
                  </div>
                  {canApproveOrReject && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setIsApproveDialogOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setIsRejectDialogOpen(true)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scholarship Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Scholarship Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{application.scholarship?.name}</h3>
                    <p className="text-muted-foreground">{application.scholarship?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Amount Requested</p>
                      <p className="text-lg font-semibold text-green-600">
                        {application.appliedAmount 
                          ? formatCurrency(application.appliedAmount)
                          : formatCurrency(application.scholarship?.amount || 0)
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="text-sm">{application.scholarship?.category?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fund</p>
                      <p className="text-sm">{application.scholarship?.fund?.name || 'General Fund'}</p>
                    </div>
                  </div>

                  {application.scholarship?.requirements && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Requirements</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{application.scholarship.requirements}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Essay */}
            {application.essay && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Personal Statement / Essay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      {application.essay}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Notes */}
            {application.reviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Review Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm">{application.reviewNotes}</p>
                    {application.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed on {formatDate(application.reviewedAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{application.student?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">Student ID: {application.student?.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.student?.user?.email}</span>
                    </div>
                    
                    {application.student?.user?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{application.student.user.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{application.student?.program?.name}</span>
                    </div>
                    
                    {application.student?.gpa && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">GPA: {application.student.gpa.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Application Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(application.submittedAt || application.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {application.status === 'UNDER_REVIEW' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Under Review</p>
                        <p className="text-xs text-muted-foreground">
                          Application is being reviewed
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(application.status === 'APPROVED' || application.status === 'REJECTED') && application.reviewedAt && (
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        application.status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">
                          {application.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(application.reviewedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Award Information */}
            {application.award && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Award Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Award ID</p>
                      <p className="text-sm font-mono">{application.award.awardId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Awarded Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(application.award.awardedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="default">{application.award.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this application? This will create an award for the student.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="approve-notes">Review Notes (Optional)</Label>
                <Textarea
                  id="approve-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about the approval decision..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={approveApplicationMutation.isPending}>
                {approveApplicationMutation.isPending ? "Approving..." : "Approve Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this application? Please provide a reason for the rejection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-notes">Rejection Reason *</Label>
                <Textarea
                  id="reject-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Please provide a reason for rejecting this application..."
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={rejectApplicationMutation.isPending || !reviewNotes.trim()}
              >
                {rejectApplicationMutation.isPending ? "Rejecting..." : "Reject Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
