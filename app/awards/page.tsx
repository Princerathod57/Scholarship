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
  Trophy,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  RefreshCw,
  Filter,
  Users,
  DollarSign,
  Star
} from "lucide-react";
import Link from "next/link";
import { 
  useGetAwards, 
  useActivateAward, 
  useSuspendAward 
} from "@/app/features";
import { DateFormatter } from "@/components/ui/date-formatter";
import { CurrencyFormatter } from "@/components/ui/currency-formatter";
import { toast } from "sonner";

export default function AwardsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "suspend">("activate");

  const searchParams = useSearchParams();
  const scholarshipIdFromUrl = searchParams.get('scholarshipId');
  const scholarshipNameFromUrl = searchParams.get('scholarshipName');

  const { data: awardsData, isLoading, error } = useGetAwards({
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    page,
    limit: 10
  });

  const activateAwardMutation = useActivateAward();
  const suspendAwardMutation = useSuspendAward();

  // Filter awards by scholarship if scholarshipId is provided
  const filteredAwards = scholarshipIdFromUrl 
    ? awardsData?.data?.filter((award: any) => award.scholarshipId === scholarshipIdFromUrl) || []
    : awardsData?.data || [];

  // Update statistics to use filtered data
  const statisticsData = {
    total: filteredAwards.length,
    active: filteredAwards.filter((award: any) => award.status === 'ACTIVE').length,
    disbursed: filteredAwards.filter((award: any) => award.status === 'DISBURSED').length,
    cancelled: filteredAwards.filter((award: any) => award.status === 'CANCELLED').length,
  };

  const handleActivateAward = async () => {
    if (!selectedAward) return;
    
    try {
      await activateAwardMutation.mutateAsync(selectedAward.id);
      setActionDialogOpen(false);
      setSelectedAward(null);
      toast.success("Award activated successfully");
    } catch (error) {
      toast.error("Failed to activate award");
    }
  };

  const handleSuspendAward = async () => {
    if (!selectedAward) return;
    
    try {
      await suspendAwardMutation.mutateAsync(selectedAward.id);
      setActionDialogOpen(false);
      setSelectedAward(null);
      toast.success("Award suspended successfully");
    } catch (error) {
      toast.error("Failed to suspend award");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      SUSPENDED: { variant: "secondary" as const, icon: Pause, color: "text-yellow-600" },
      COMPLETED: { variant: "outline" as const, icon: CheckCircle, color: "text-blue-600" },
      CANCELLED: { variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </Badge>
    );
  };

  const openActionDialog = (award: any, type: "activate" | "suspend") => {
    setSelectedAward(award);
    setActionType(type);
    setActionDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl" />
        <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-3 rounded-xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {scholarshipNameFromUrl ? `Awards: ${decodeURIComponent(scholarshipNameFromUrl)}` : 'Awards Management'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {scholarshipNameFromUrl 
                    ? `Viewing awards for ${decodeURIComponent(scholarshipNameFromUrl)} scholarship`
                    : 'Manage active scholarship awards and disbursements'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {scholarshipNameFromUrl && (
                <Link href="/awards">
                  <Button variant="outline" size="sm">
                    ← Back to All Awards
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
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Total Awards</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {statisticsData.total}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Awards</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {statisticsData.active}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Value</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  <CurrencyFormatter 
                    amount={filteredAwards.reduce((sum: number, award: any) => sum + (award.awardedAmount || 0), 0)} 
                  />
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Recipients</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {new Set(filteredAwards.map((award: any) => award.student?.id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
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
                Award Management
              </CardTitle>
              <CardDescription>
                Monitor and manage all scholarship awards
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
                placeholder="Search awards by student name or scholarship..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-yellow-400 transition-colors"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              <p className="text-muted-foreground">Failed to load awards</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Award Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disbursements</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAwards.map((award: any) => (
                  <TableRow key={award.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {award.student?.user?.name || 'Unknown Student'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {award.student?.studentId || 'No ID'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {award.student?.program?.name || 'No Program'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {award.application?.scholarship?.name || 'Unknown Scholarship'}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {award.application?.scholarship?.category?.replace('_', ' ') || 'N/A'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          <CurrencyFormatter amount={award.amount || 0} />
                        </div>
                        {award.totalDisbursed > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <CurrencyFormatter amount={award.totalDisbursed} /> disbursed
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DateFormatter date={award.awardDate} />
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(award.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {award.disbursementCount || 0} disbursements
                        </div>
                        {award.disbursementCount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Remaining: <CurrencyFormatter amount={award.amount - (award.totalDisbursed || 0)} />
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
                        >
                          <Link href={`/awards/${award.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {award.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(award, "suspend")}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {award.status === 'SUSPENDED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(award, "activate")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredAwards.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No awards found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {scholarshipNameFromUrl 
                  ? `No awards found for ${decodeURIComponent(scholarshipNameFromUrl)} scholarship`
                  : searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search terms or filters" 
                    : "No awards have been created yet"}
              </p>
            </div>
          )}

          {/* Pagination - Only show when not filtering by scholarship */}
          {!scholarshipIdFromUrl && awardsData?.pagination && awardsData.pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {awardsData.pagination.page} of {awardsData.pagination.pages} 
                ({awardsData.pagination.total} total awards)
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
                  disabled={page >= awardsData.pagination.pages}
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
              {actionType === "activate" ? "Activate" : "Suspend"} Award
            </DialogTitle>
            <DialogDescription>
              {actionType === "activate" 
                ? `Are you sure you want to activate the award for ${selectedAward?.student?.user?.name}?`
                : `Are you sure you want to suspend the award for ${selectedAward?.student?.user?.name}? This will prevent further disbursements.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "activate" ? "default" : "destructive"}
              onClick={actionType === "activate" ? handleActivateAward : handleSuspendAward}
              disabled={activateAwardMutation.isPending || suspendAwardMutation.isPending}
            >
              {(activateAwardMutation.isPending || suspendAwardMutation.isPending) 
                ? `${actionType === "activate" ? "Activating" : "Suspending"}...` 
                : actionType === "activate" ? "Activate" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
