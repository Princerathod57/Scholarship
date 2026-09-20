"use client";

import { useState } from "react";
import { 
  Plus, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Banknote,
  Receipt,
  Sparkles
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useGetDisbursements,
  useCreateDisbursement,
  useProcessDisbursement,
  useGetAwards,
  useGetStudents,
} from "@/app/features";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CurrencyFormatter } from "@/components/ui/currency-formatter";
import { DateFormatter } from "@/components/ui/date-formatter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const disbursementSchema = z.object({
  awardId: z.string().min(1, "Award is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  method: z.enum(["BANK_TRANSFER", "CHECK", "DIRECT_DEPOSIT"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type DisbursementFormData = z.infer<typeof disbursementSchema>;

export default function DisbursementsPage() {
  const { data: disbursementsData, isLoading, refetch } = useGetDisbursements();
  const { data: awardsData } = useGetAwards();
  const createDisbursement = useCreateDisbursement();
  const processDisbursement = useProcessDisbursement();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [processingDisbursementId, setProcessingDisbursementId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const form = useForm<DisbursementFormData>({
    resolver: zodResolver(disbursementSchema),
    defaultValues: {
      awardId: "",
      amount: 0,
      scheduledDate: "",
      method: "BANK_TRANSFER",
      reference: "",
      notes: "",
    },
  });

  const handleCreateDisbursement = async (data: DisbursementFormData) => {
    try {
      await createDisbursement.mutateAsync({
        ...data,
        scheduledDate: data.scheduledDate, // Keep as string as expected by API
      });
      toast({
        title: "Success",
        description: "Disbursement created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create disbursement",
        variant: "destructive",
      });
    }
  };

  const handleProcessDisbursement = async () => {
    if (!processingDisbursementId) return;

    try {
      await processDisbursement.mutateAsync(processingDisbursementId);
      toast({
        title: "Success",
        description: "Disbursement processed successfully",
      });
      setProcessingDisbursementId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process disbursement",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const filteredDisbursements = disbursementsData?.data?.filter((disbursement: any) => {
    // Safety checks for undefined properties
    if (!disbursement) return false;
    
    const matchesSearch = 
      (disbursement.award?.student?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (disbursement.award?.student?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (disbursement.award?.scholarship?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (disbursement.reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || disbursement.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING": return "outline";
      case "PROCESSED": return "default";
      case "FAILED": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return Clock;
      case "PROCESSED": return CheckCircle;
      case "FAILED": return CreditCard;
      default: return Clock;
    }
  };

  const activeAwards = awardsData?.data?.filter((award: any) => award.status === "ACTIVE") || [];

  // Calculate statistics
  const totalDisbursements = filteredDisbursements.length;
  const pendingDisbursements = filteredDisbursements.filter((d: any) => d.status === "PENDING").length;
  const processedDisbursements = filteredDisbursements.filter((d: any) => d.status === "PROCESSED").length;
  const totalAmount = filteredDisbursements.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl" />
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Disbursements
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage scholarship payments and disbursements
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Disbursement
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
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Disbursements</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {totalDisbursements}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {pendingDisbursements}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Processed</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {processedDisbursements}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    <CurrencyFormatter amount={totalAmount} />
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-500" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, scholarship, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-green-400 transition-colors"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 rounded-lg border-2 border-input bg-background px-4 text-sm shadow-sm transition-colors focus:border-green-400 min-w-[180px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSED">Processed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Disbursements List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredDisbursements.map((disbursement: any) => {
              const StatusIcon = getStatusIcon(disbursement.status);
              return (
                <Card key={disbursement.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                        <CurrencyFormatter amount={disbursement.amount} />
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(disbursement.status || 'PENDING')} className="font-medium">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {disbursement.status || 'PENDING'}
                        </Badge>
                        {disbursement.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => setProcessingDisbursementId(disbursement.id)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {disbursement.award?.student?.firstName || ''} {disbursement.award?.student?.lastName || ''} - 
                          {disbursement.award?.scholarship?.name || 'Unknown Scholarship'}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-green-500" />
                          Scheduled Date
                        </div>
                        <div className="text-gray-600">
                          <DateFormatter date={disbursement.scheduledDate} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700 flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-green-500" />
                          Method
                        </div>
                        <div className="text-gray-600">
                          {(disbursement.method || 'BANK_TRANSFER').replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700 flex items-center gap-1">
                          <User className="h-3 w-3 text-green-500" />
                          Student Email
                        </div>
                        <div className="text-gray-600 text-xs">
                          {disbursement.award?.student?.email || 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700 flex items-center gap-1">
                          <Receipt className="h-3 w-3 text-green-500" />
                          Reference
                        </div>
                        <div className="font-mono text-xs text-gray-600">
                          {disbursement.reference || "—"}
                        </div>
                      </div>
                    </div>
                    
                    {disbursement.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-green-500" />
                          Notes
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {disbursement.notes}
                        </div>
                      </div>
                    )}
                    
                    {disbursement.processedDate && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Processed on <DateFormatter date={disbursement.processedDate} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Empty State */}
        {filteredDisbursements.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-6">
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No disbursements found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== "ALL" 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by creating your first disbursement"}
            </p>
            {(!searchTerm && filterStatus === "ALL") && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Disbursement
              </Button>
            )}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Create New Disbursement
              </DialogTitle>
              <DialogDescription>
                Create a new disbursement for an active award
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(handleCreateDisbursement)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="awardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Award *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an award" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAwards.map((award: any) => (
                              <SelectItem key={award.id} value={award.id}>
                                {award.student?.firstName || ''} {award.student?.lastName || ''} - {award.scholarship?.name || 'Unknown Scholarship'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="CHECK">Check</SelectItem>
                            <SelectItem value="DIRECT_DEPOSIT">Direct Deposit</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Transaction reference or ID" {...field} />
                      </FormControl>
                      <FormDescription>Optional reference number or transaction ID</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this disbursement"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional notes about this disbursement</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createDisbursement.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Create Disbursement
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Process Confirmation Dialog */}
        <AlertDialog open={!!processingDisbursementId} onOpenChange={() => setProcessingDisbursementId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Process Disbursement</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to process this disbursement? This action will mark it as processed and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleProcessDisbursement}
                className="bg-green-600 hover:bg-green-700"
              >
                Process Disbursement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
