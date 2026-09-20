"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { bankAccounts, addBankAccount, setDefaultBankAccount, deleteBankAccount } from "@/lib/mock-data";
import { ColumnDef } from "@tanstack/react-table";
import { BankAccount } from "@/types";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { DateFormatter } from "@/components/ui/date-formatter";
import { Plus, MoreHorizontal, Star, Trash, Settings, Building2, RefreshCw, Filter, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useGetBankAccounts } from "@/app/features/bank-accounts/use-get-bank-accounts";
import { useCreateBankAccount } from "@/app/features/bank-accounts/use-create-bank-account";
const bankAccountFormSchema = z.object({
  bankName: z.string().min(2, "Bank name must be at least 2 characters"),
  accountNumber: z.string().min(5, "Account number must be at least 5 characters"),
  ifsccode: z.string().min(8, "IFSC code must be at least 8 characters"),
  branchName: z.string().min(2, "Branch name must be at least 2 characters"),
  notes: z.string().optional(),
});

export default function BankAccountsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof bankAccountFormSchema>>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      ifsccode: "",
      branchName: "",
      notes: "",
    },
  });

  if (!isAuthenticated() || !isAdmin()) {
    router.push("/dashboard");
    return null;
  }

const { mutate: addBankAccount } = useCreateBankAccount();
const { data: bankAccountsData = { success: false, accounts: [] }, isLoading } = useGetBankAccounts();
const accounts = (bankAccountsData?.accounts || []).map((account: any) => ({
  ...account,
  accountName: account.bankName, // Fix for type error
  createdAt: new Date(account.createdAt),
  updatedAt: new Date(account.updatedAt)
}));
function onSubmit(values: z.infer<typeof bankAccountFormSchema>) {
  addBankAccount({
    ...values,
    isDefault: accounts.length === 0,
  });
console.log( "Bank account added:", values);
  setIsDialogOpen(false);
  form.reset();
}
  const handleSetDefault = (id: string) => {
    setDefaultBankAccount(id);
    toast.success("Default bank account updated");
  };

  const handleDelete = (id: string) => {
    try {
      deleteBankAccount(id);
      toast.success("Bank account deleted");
    } catch (error) {
      toast.error("Cannot delete default bank account");
    }
  };

  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: "bankName",
      header: "Bank Name",
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          {row.original.bankName}
          {row.original.isDefault && (
            <Badge variant="secondary">Default</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
    },
    {
      accessorKey: "ifsccode",
      header: "IFSC Code",
    },
    {
      accessorKey: "branchName",
      header: "Branch",
    },
    {
      accessorKey: "createdAt",
      header: "Added On",
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
            {!row.original.isDefault && (
              <DropdownMenuItem onClick={() => handleSetDefault(row.original.id)}>
                <Star className="mr-2 h-4 w-4" />
                Set as Default
              </DropdownMenuItem>
            )}
            {!row.original.isDefault && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl" />
        <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Bank Accounts
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage banking information for scholarship disbursements
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
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bank Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                    <DialogDescription>
                      Add a new bank account for transactions
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ifsccode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter IFSC code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter branch name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes about this account
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
                    Add Account
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Accounts</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {accounts.length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Default Account</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {accounts.find((acc: any) => acc.isDefault)?.bankName || 'None Set'}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Banks</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {new Set(accounts.map((acc: any) => acc.bankName)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                Bank Account Management
              </CardTitle>
              <CardDescription>
                Manage bank accounts for scholarship disbursements
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
         <DataTable
           columns={columns}
           data={accounts}
           searchColumn="bankName"
         />
        </CardContent>
      </Card>
    </div>
  );
}