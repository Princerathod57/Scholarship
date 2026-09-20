"use client";

import { useState } from "react";
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
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Award,
  DollarSign,
  Calendar,
  Users,
  GraduationCap,
  TrendingUp,
  Filter,
  RefreshCw,
  Star,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useGetScholarships, useDeleteScholarship } from "@/app/features";
import { DateFormatter } from "@/components/ui/date-formatter";
import { CurrencyFormatter } from "@/components/ui/currency-formatter";
import { toast } from "sonner";

export default function ScholarshipsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: scholarshipsData, isLoading, error } = useGetScholarships({
    search: searchTerm,
    page,
    limit: 10
  });

  const deleteScholarshipMutation = useDeleteScholarship();

  const handleDeleteScholarship = async () => {
    if (!selectedScholarship) return;
    
    try {
      await deleteScholarshipMutation.mutateAsync(selectedScholarship.id);
      setDeleteDialogOpen(false);
      setSelectedScholarship(null);
      toast.success("Scholarship deleted successfully");
    } catch (error) {
      toast.error("Failed to delete scholarship");
    }
  };

  const getStatusBadge = (scholarship: any) => {
    const now = new Date();
    const applicationDeadline = scholarship.applicationDeadline ? new Date(scholarship.applicationDeadline) : null;
    
    if (!scholarship.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (applicationDeadline && applicationDeadline < now) {
      return <Badge variant="outline">Closed</Badge>;
    }
    return <Badge variant="default">Open</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const colors: { [key: string]: string } = {
      ACADEMIC: "bg-blue-100 text-blue-800",
      NEED_BASED: "bg-green-100 text-green-800",
      MERIT: "bg-purple-100 text-purple-800",
      ATHLETIC: "bg-orange-100 text-orange-800",
      RESEARCH: "bg-cyan-100 text-cyan-800",
      COMMUNITY_SERVICE: "bg-pink-100 text-pink-800"
    };
    
    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl" />
        <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Scholarship Programs
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage and oversee scholarship opportunities for students
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/scholarships/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Scholarship
                </Link>
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
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Scholarships</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {scholarshipsData?.pagination?.total || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Programs</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {scholarshipsData?.data?.filter((s: any) => s.isActive).length || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Value</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  <CurrencyFormatter 
                    amount={scholarshipsData?.data?.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) || 0} 
                  />
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Open Applications</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {scholarshipsData?.data?.filter((s: any) => {
                    const deadline = s.applicationDeadline ? new Date(s.applicationDeadline) : null;
                    return s.isActive && (!deadline || deadline > new Date());
                  }).length || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Scholarship Programs
              </CardTitle>
              <CardDescription>
                View and manage all available scholarships
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships by name, category, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-6 border rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-[250px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-red-600 dark:text-red-400">Failed to load scholarships</p>
              <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Application Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scholarshipsData?.data?.map((scholarship: any) => (
                  <TableRow key={scholarship.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {scholarship.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {scholarship.description?.substring(0, 100)}
                          {scholarship.description?.length > 100 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(scholarship.category)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        <CurrencyFormatter amount={scholarship.amount} />
                      </div>
                      {scholarship.maxRecipients && (
                        <div className="text-sm text-muted-foreground">
                          Max {scholarship.maxRecipients} recipients
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {scholarship.applicationDeadline ? (
                        <div className="space-y-1">
                          <DateFormatter date={scholarship.applicationDeadline} />
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(scholarship.applicationDeadline) > new Date() ? 'Open' : 'Closed'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No deadline</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(scholarship)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {scholarship.fund?.name || 'No Fund'}
                        </div>
                        {scholarship.fund?.availableAmount && (
                          <div className="text-sm text-muted-foreground">
                            <CurrencyFormatter amount={scholarship.fund.availableAmount} /> available
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                        >
                          <Link href={`/scholarships/${scholarship.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-colors"
                        >
                          <Link href={`/scholarships/${scholarship.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedScholarship(scholarship);
                            setDeleteDialogOpen(true);
                          }}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {scholarshipsData?.data?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
                <Award className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No scholarships found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first scholarship program"}
              </p>
              {!searchTerm && (
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/scholarships/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Scholarship
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {scholarshipsData?.pagination && scholarshipsData.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {scholarshipsData.pagination.page} of {scholarshipsData.pagination.pages} 
                ({scholarshipsData.pagination.total} total scholarships)
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
                  disabled={page >= scholarshipsData.pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scholarship</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedScholarship?.name}"? This action cannot be undone and will affect all related applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteScholarship}
              disabled={deleteScholarshipMutation.isPending}
            >
              {deleteScholarshipMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
