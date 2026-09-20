"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
  TrendingUp,
  RefreshCw,
  Filter,
  Users,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { 
  useGetApplications, 
  useApproveApplication, 
  useRejectApplication 
} from "@/app/features";
import { DateFormatter } from "@/components/ui/date-formatter";
import { CurrencyFormatter } from "@/components/ui/currency-formatter";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reviewNotes, setReviewNotes] = useState("");

  const searchParams = useSearchParams();
  const scholarshipIdFromUrl = searchParams.get('scholarshipId');
  const scholarshipNameFromUrl = searchParams.get('scholarshipName');
  const studentIdFromUrl = searchParams.get('studentId');
  const studentNameFromUrl = searchParams.get('studentName');

  const { data: applicationsData, isLoading, error } = useGetApplications({
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    page,
    limit: 10
  });

  const approveApplicationMutation = useApproveApplication();
  const rejectApplicationMutation = useRejectApplication();

  // Filter applications by scholarship or student if IDs are provided
  let filteredApplications = applicationsData?.data || [];
  
  if (scholarshipIdFromUrl) {
    filteredApplications = filteredApplications.filter((app: any) => app.scholarshipId === scholarshipIdFromUrl);
  }
  
  if (studentIdFromUrl) {
    filteredApplications = filteredApplications.filter((app: any) => app.studentId === studentIdFromUrl);
  }

  // Update statistics to use filtered data
  const statisticsData = {
    total: filteredApplications.length,
    pending: filteredApplications.filter((app: any) => app.status === 'PENDING').length,
    approved: filteredApplications.filter((app: any) => app.status === 'APPROVED').length,
    rejected: filteredApplications.filter((app: any) => app.status === 'REJECTED').length,
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;
    
    try {
      await approveApplicationMutation.mutateAsync({
        id: selectedApplication.id,
        awardedAmount: selectedApplication.scholarship?.amount
      });
      setActionDialogOpen(false);
      setSelectedApplication(null);
      setReviewNotes("");
      toast.success("Application approved successfully");
    } catch (error) {
      toast.error("Failed to approve application");
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;
    
    try {
      await rejectApplicationMutation.mutateAsync({
        id: selectedApplication.id,
        reason: reviewNotes || "Application rejected"
      });
      setActionDialogOpen(false);
      setSelectedApplication(null);
      setReviewNotes("");
      toast.success("Application rejected");
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      APPROVED: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      REJECTED: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      UNDER_REVIEW: { variant: "outline" as const, icon: AlertCircle, color: "text-blue-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const openActionDialog = (application: any, type: "approve" | "reject") => {
    setSelectedApplication(application);
    setActionType(type);
    setActionDialogOpen(true);
    setReviewNotes("");
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl" />
        <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {scholarshipNameFromUrl 
                    ? `Applications: ${decodeURIComponent(scholarshipNameFromUrl)}` 
                    : studentNameFromUrl 
                      ? `Applications: ${decodeURIComponent(studentNameFromUrl)}`
                      : 'Application Management'
                  }
                </h1>
                <p className="text-muted-foreground mt-1">
                  {scholarshipNameFromUrl 
                    ? `Viewing applications for ${decodeURIComponent(scholarshipNameFromUrl)} scholarship`
                    : studentNameFromUrl
                      ? `Viewing applications by ${decodeURIComponent(studentNameFromUrl)}`
                      : 'Review and manage scholarship applications from students'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {(scholarshipNameFromUrl || studentNameFromUrl) && (
                <Link href="/applications">
                  <Button variant="outline" size="sm">
                    ← Back to All Applications
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Applications</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {statisticsData.total}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {statisticsData.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {statisticsData.approved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {statisticsData.rejected}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Application Review
              </CardTitle>
              <CardDescription>
                Review pending applications and manage their status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications by student name or scholarship..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load applications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications?.map((application: any) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {application.student?.user?.name || 'Unknown Student'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.student?.studentId || 'No ID'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.student?.program?.name || 'No Program'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {application.scholarship?.name || 'Unknown Scholarship'}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {application.scholarship?.category?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        <CurrencyFormatter amount={application.scholarship?.amount || 0} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DateFormatter date={application.createdAt} />
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      {application.student?.gpa ? (
                        <Badge variant={
                          application.student.gpa >= 3.5 ? "default" : 
                          application.student.gpa >= 3.0 ? "secondary" : 
                          "destructive"
                        }>
                          {application.student.gpa.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/applications/${application.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {application.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog(application, "approve")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog(application, "reject")}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredApplications?.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No applications found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {scholarshipNameFromUrl 
                  ? `No applications found for ${decodeURIComponent(scholarshipNameFromUrl)} scholarship`
                  : studentNameFromUrl
                    ? `No applications found for ${decodeURIComponent(studentNameFromUrl)}`
                    : searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search terms or filters" 
                      : "No applications have been submitted yet"}
              </p>
            </div>
          )}

          {/* Pagination - Only show when not filtering by scholarship or student */}
          {!scholarshipIdFromUrl && !studentIdFromUrl && applicationsData?.pagination && applicationsData.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {applicationsData.pagination.page} of {applicationsData.pagination.pages} 
                ({applicationsData.pagination.total} total applications)
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= applicationsData.pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? `Are you sure you want to approve the application from ${selectedApplication?.student?.user?.name} for ${selectedApplication?.scholarship?.name}?`
                : `Are you sure you want to reject the application from ${selectedApplication?.student?.user?.name} for ${selectedApplication?.scholarship?.name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Notes (Optional)</label>
              <Textarea
                placeholder={`Add notes about this ${actionType === "approve" ? "approval" : "rejection"}...`}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={actionType === "approve" ? handleApproveApplication : handleRejectApplication}
              disabled={approveApplicationMutation.isPending || rejectApplicationMutation.isPending}
            >
              {(approveApplicationMutation.isPending || rejectApplicationMutation.isPending) 
                ? `${actionType === "approve" ? "Approving" : "Rejecting"}...` 
                : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
