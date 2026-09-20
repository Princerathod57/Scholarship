"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Settings2, Hash, Target, Activity, Clock, Star, MoreHorizontal, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";

import {
  useGetSeries,
  useCreateSeries,
  useUpdateSeries,
  useDeleteSeries,
  useGenerateSeriesId
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { DateFormatter } from "@/components/ui/date-formatter";
import { useToast } from "@/hooks/use-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const seriesSchema = z.object({
  name: z.string().min(2, "Series name is required"),
  prefix: z.string()
    .min(2, "Prefix must be at least 2 characters")
    .regex(/^[A-Z0-9-]+$/, "Prefix must contain only uppercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  format: z.string().optional().default("{prefix}-{year}-{number:3}"),
  lastNumber: z.number().min(0).optional()
});

type SeriesFormData = z.infer<typeof seriesSchema>;

interface Series {
  id: string;
  name: string;
  prefix: string;
  description?: string;
  isDefault: boolean;
  format: string;
  lastNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function SeriesManagementPage() {
  const { data: seriesData, isLoading, refetch } = useGetSeries();
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();
  const generateId = useGenerateSeriesId();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [deletingSeriesId, setDeletingSeriesId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      name: "",
      prefix: "",
      description: "",
      isDefault: false,
      format: "{prefix}-{year}-{number:3}",
    },
  });

  const handleCreateSeries = async (data: SeriesFormData) => {
    try {
      await createSeries.mutateAsync(data);
      toast({
        title: "Success",
        description: "Series created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create series",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSeries = async (data: SeriesFormData) => {
    if (!editingSeries) return;
    
    try {
      await updateSeries.mutateAsync({
        id: editingSeries.id,
        data: data,
      });
      toast({
        title: "Success",
        description: "Series updated successfully",
      });
      setEditingSeries(null);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update series",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSeries = async () => {
    if (!deletingSeriesId) return;

    try {
      await deleteSeries.mutateAsync(deletingSeriesId);
      toast({
        title: "Success",
        description: "Series deleted successfully",
      });
      setDeletingSeriesId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete series",
        variant: "destructive",
      });
    }
  };

  const handleGenerateId = async (seriesId: string) => {
    setGeneratingId(seriesId);
    try {
      const result = await generateId.mutateAsync(seriesId);
      toast({
        title: "ID Generated",
        description: `Generated ID: ${result.generatedId}`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate ID",
        variant: "destructive",
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const openEditDialog = (series: any) => {
    setEditingSeries(series);
    form.reset({
      name: series.name,
      prefix: series.prefix,
      description: series.description || "",
      isDefault: series.isDefault,
      format: series.format || "{prefix}-{year}-{number:3}",
      lastNumber: series.lastNumber,
    });
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingSeries(null);
    form.reset();
  };

  // Prepare data for table
  const series = (seriesData?.data || []).map((s: any) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  }));

  // Table columns definition
  const columns: ColumnDef<Series>[] = [
    {
      accessorKey: "name",
      header: "Series Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name}
          {row.original.isDefault && (
            <Badge variant="secondary" className="ml-2">Default</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "prefix",
      header: "Prefix",
      cell: ({ row }) => (
        <code className="font-mono text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
          {row.original.prefix}
        </code>
      ),
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => (
        <code className="font-mono text-xs text-muted-foreground">
          {row.original.format}
        </code>
      ),
    },
    {
      accessorKey: "lastNumber",
      header: "Last Number",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.original.lastNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.original.description || "-"}
        </div>
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
            <DropdownMenuItem onClick={() => handleGenerateId(row.original.id)}>
              <Hash className="mr-2 h-4 w-4" />
              Generate ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Series
            </DropdownMenuItem>
            {!row.original.isDefault && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeletingSeriesId(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Series
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Settings2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Series Management
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Manage ID generation series for applications, awards, and disbursements
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Series</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {isLoading ? "-" : seriesData?.data?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-green-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Series</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {isLoading ? "-" : seriesData?.data?.filter((s: any) => s.lastNumber >= 0).length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Default Series</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {isLoading ? "-" : seriesData?.data?.filter((s: any) => s.isDefault).length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Used Series</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {isLoading ? "-" : seriesData?.data?.filter((s: any) => s.lastNumber > 0).length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Series
              </Button>
            </div>
          </div>

          {/* Series Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : (
              seriesData?.data?.map((series: any) => (
                <Card key={series.id} className="relative border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {series.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {series.isDefault && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                            Default
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateId(series.id)}
                            disabled={generatingId === series.id}
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                          >
                            <Hash className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(series)}
                            className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSeriesId(series.id)}
                            disabled={series.lastNumber > 0}
                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Prefix: <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded font-mono text-sm">{series.prefix}</code>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {series.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {series.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Format:</span>
                        <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded font-mono text-xs">
                          {series.format}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Last Number:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {series.lastNumber}
                        </span>
                      </div>
                    </div>
                    {series.lastNumber > 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          Next ID Preview:
                        </div>
                        <code className="text-sm font-mono text-blue-700 dark:text-blue-300">
                          {series.format
                            ?.replace("{prefix}", series.prefix)
                            .replace("{year}", new Date().getFullYear().toString())
                            .replace("{number:3}", (series.lastNumber + 1).toString().padStart(3, '0'))
                            .replace("{number}", (series.lastNumber + 1).toString())}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Data Table */}
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm mt-8">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-500" />
                    Series Management Table
                  </CardTitle>
                  <CardDescription>
                    View and manage all ID generation series
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
                  <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading series...</span>
                </div>
              ) : series.length === 0 ? (
                <div className="text-center py-8">
                  <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Series Created</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first series to start generating unique IDs.
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Series
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={series}
                  searchColumn="name"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingSeries} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {editingSeries ? "Edit Series" : "Create New Series"}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {editingSeries 
                ? "Update the series configuration"
                : "Add a new series for generating unique IDs"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(editingSeries ? handleUpdateSeries : handleCreateSeries)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Series Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Application Series" 
                        {...field} 
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Prefix</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., APP, AWD, DISB" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 font-mono"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Only uppercase letters, numbers, and hyphens allowed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Format</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="{prefix}-{year}-{number:3}" 
                        {...field} 
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 font-mono"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Use placeholders: {"{prefix}"}, {"{year}"}, {"{number}"}, {"{number:3}"}
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this series"
                        className="resize-none border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editingSeries && (
                <FormField
                  control={form.control}
                  name="lastNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Last Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        The last generated number for this series
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="space-y-0.5">
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Default Series</FormLabel>
                      <FormDescription className="text-slate-500">
                        Make this the default series for its type
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDialog}
                  className="border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSeries.isPending || updateSeries.isPending}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {editingSeries ? "Update" : "Create"} Series
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSeriesId} onOpenChange={() => setDeletingSeriesId(null)}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Delete Series
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this series? This action cannot be undone.
              You can only delete series that haven't been used to generate any IDs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSeries}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
