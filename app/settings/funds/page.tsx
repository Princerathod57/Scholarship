"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { ColumnDef } from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { DateFormatter } from "@/components/ui/date-formatter";
import { CurrencyFormatter } from "@/components/ui/currency-formatter";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Settings, 
  Wallet, 
  RefreshCw, 
  Filter, 
  DollarSign,
  TrendingUp,
  Banknote,
  Calculator
} from "lucide-react";
import { toast } from "sonner";
import { useGetFunds } from "@/app/features/funds/use-get-funds";
import { useCreateFund } from "@/app/features/funds/use-create-fund";
import { useGetPrograms } from "@/app/features/programs/use-get-programs";

const fundFormSchema = z.object({
  name: z.string().min(2, "Fund name must be at least 2 characters"),
  description: z.string().optional(),
  programId: z.string().min(1, "Please select a program"),
  totalAmount: z.number().min(0.01, "Total amount must be greater than 0"),
});

interface Fund {
  id: string;
  name: string;
  description?: string;
  programId: string;
  totalAmount: number;
  availableAmount: number;
  committedAmount: number;
  disbursedAmount: number;
  createdAt: Date;
  updatedAt: Date;
  program?: {
    id: string;
    name: string;
  };
}

export default function FundsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof fundFormSchema>>({
    resolver: zodResolver(fundFormSchema),
    defaultValues: {
      name: "",
      description: "",
      programId: "",
      totalAmount: 0,
    },
  });

  if (!isAuthenticated() || !isAdmin()) {
    router.push("/dashboard");
    return null;
  }

  const { mutate: createFund } = useCreateFund();
  const { data: fundsData = { success: false, funds: [] }, isLoading } = useGetFunds();
  const { data: programsData = { success: false, programs: [] } } = useGetPrograms();
  
  const funds = (fundsData?.funds || []).map((fund: any) => ({
    ...fund,
    createdAt: new Date(fund.createdAt),
    updatedAt: new Date(fund.updatedAt),
  }));

  const programs = programsData?.programs || [];

  function onSubmit(values: z.infer<typeof fundFormSchema>) {
    createFund({
      ...values,
      totalAmount: Number(values.totalAmount),
    });
    console.log("Fund created:", values);
    setIsDialogOpen(false);
    form.reset();
  }

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  const columns: ColumnDef<Fund>[] = [
    {
      accessorKey: "name",
      header: "Fund Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.program?.name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => (
        <CurrencyFormatter amount={row.original.totalAmount} />
      ),
    },
    {
      accessorKey: "availableAmount",
      header: "Available",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <CurrencyFormatter amount={row.original.availableAmount} />
          <Badge variant={row.original.availableAmount > 0 ? "default" : "secondary"} className="w-fit text-xs">
            {row.original.availableAmount > 0 ? "Available" : "Exhausted"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "committedAmount",
      header: "Committed",
      cell: ({ row }) => (
        <CurrencyFormatter amount={row.original.committedAmount} />
      ),
    },
    {
      accessorKey: "disbursedAmount",
      header: "Disbursed",
      cell: ({ row }) => (
        <CurrencyFormatter amount={row.original.disbursedAmount} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <DateFormatter date={row.original.createdAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Fund
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Fund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Calculate statistics
  const totalFunds = funds.length;
  const totalAmount = funds.reduce((sum: number, fund: Fund) => sum + fund.totalAmount, 0);
  const totalAvailable = funds.reduce((sum: number, fund: Fund) => sum + fund.availableAmount, 0);
  const totalDisbursed = funds.reduce((sum: number, fund: Fund) => sum + fund.disbursedAmount, 0);
  const utilizationRate = totalAmount > 0 ? ((totalDisbursed / totalAmount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl" />
        <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-xl">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Fund Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage scholarship funds and track financial allocations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Fund
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Fund</DialogTitle>
                    <DialogDescription>
                      Create a new scholarship fund for a specific program
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fund Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter fund name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="programId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Program</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a program" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {programs.map((program: any) => (
                                  <SelectItem key={program.id} value={program.id}>
                                    {program.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="Enter total fund amount" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              The total amount available in this fund
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter fund description (optional)"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional description about the fund's purpose
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Fund
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
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
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Funds</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {totalFunds}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Value</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  <CurrencyFormatter amount={totalAmount} />
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Available</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  <CurrencyFormatter amount={totalAvailable} />
                </p>
              </div>
              <Banknote className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Utilization</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {utilizationRate.toFixed(1)}%
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Disbursed</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  <CurrencyFormatter amount={totalDisbursed} />
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Active Programs</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {new Set(funds.map((fund: Fund) => fund.programId)).size}
                </p>
              </div>
              <Settings className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-500" />
                Fund Management
              </CardTitle>
              <CardDescription>
                View and manage all scholarship funds
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading funds...</span>
            </div>
          ) : funds.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Funds Created</h3>
              <p className="text-muted-foreground mb-4">
                Create your first fund to start managing scholarship finances.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Fund
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={funds}
              searchColumn="name"
            />
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
