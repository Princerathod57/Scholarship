"use client";

import { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Building2,
  Star,
  BarChart3,
  Sparkles
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useGetPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
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

const programSchema = z.object({
  name: z.string().min(2, "Program name is required"),
  code: z.string().min(2, "Program code is required"),
  description: z.string().optional(),
  department: z.string().min(2, "Department is required"),
  level: z.enum(["UNDERGRADUATE", "GRADUATE", "DOCTORAL", "CERTIFICATE"]),
  isActive: z.boolean().optional().default(true),
});

type ProgramFormData = z.infer<typeof programSchema>;

export default function ProgramsPage() {
  const { data: programsData, isLoading, refetch } = useGetPrograms();
  const createProgram = useCreateProgram();
  const deleteProgram = useDeleteProgram();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const updateProgram = useUpdateProgram(editingProgram?.id || "");
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("ALL");

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      department: "",
      level: "UNDERGRADUATE",
      isActive: true,
    },
  });

  const handleCreateProgram = async (data: ProgramFormData) => {
    try {
      await createProgram.mutateAsync(data);
      toast({
        title: "Success",
        description: "Program created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create program",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgram = async (data: ProgramFormData) => {
    if (!editingProgram) return;
    
    try {
      await updateProgram.mutateAsync(data);
      toast({
        title: "Success",
        description: "Program updated successfully",
      });
      setEditingProgram(null);
      form.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update program",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProgram = async () => {
    if (!deletingProgramId) return;

    try {
      await deleteProgram.mutateAsync(deletingProgramId);
      toast({
        title: "Success",
        description: "Program deleted successfully",
      });
      setDeletingProgramId(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete program",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (program: any) => {
    setEditingProgram(program);
    form.reset({
      name: program.name,
      code: program.code,
      description: program.description || "",
      department: program.department,
      level: program.level,
      isActive: program.isActive,
    });
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingProgram(null);
    form.reset();
  };

  const filteredPrograms = programsData?.data?.filter((program: any) => {
    // Safety checks for undefined properties
    if (!program) return false;
    
    const matchesSearch = (program.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (program.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (program.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "ALL" || (program.level || 'UNDERGRADUATE') === filterLevel;
    return matchesSearch && matchesLevel;
  }) || [];

  const getLevelBadgeVariant = (level: string) => {
    if (!level) return "default";
    switch (level) {
      case "UNDERGRADUATE": return "default";
      case "GRADUATE": return "secondary";
      case "DOCTORAL": return "destructive";
      case "CERTIFICATE": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Modern Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-2xl" />
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Academic Programs
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage academic programs and their curriculum details
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Program
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
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Programs</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {filteredPrograms?.length || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Programs</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {filteredPrograms?.filter((p: any) => p.isActive).length || 0}
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
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Departments</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {new Set(filteredPrograms?.map((p: any) => p && p.department).filter(Boolean)).size || 0}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Graduate Programs</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {filteredPrograms?.filter((p: any) => p && ['GRADUATE', 'DOCTORAL'].includes(p.level || '')).length || 0}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-500" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search programs by name, code, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="h-12 rounded-lg border-2 border-input bg-background px-4 text-sm shadow-sm transition-colors focus:border-purple-400 min-w-[180px]"
              >
                <option value="ALL">All Levels</option>
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="GRADUATE">Graduate</option>
                <option value="DOCTORAL">Doctoral</option>
                <option value="CERTIFICATE">Certificate</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Programs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredPrograms.map((program: any) => (
              <Card key={program.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold group-hover:text-purple-600 transition-colors">
                        {program.name}
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {program.code}
                          </code>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm font-medium text-gray-600">
                            {program.department}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getLevelBadgeVariant(program.level || 'UNDERGRADUATE')} className="font-medium">
                        {program.level ? program.level.replace('_', ' ') : 'Undergraduate'}
                      </Badge>
                      {!program.isActive && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {program.description && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-500" />
                        Description
                      </div>
                      <div className="text-gray-600 line-clamp-2 leading-relaxed">
                        {program.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      {program.level ? program.level : 'UNDERGRADUATE'} Level
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(program)}
                        className="h-8 px-3 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingProgramId(program.id)}
                        className="h-8 px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Empty State */}
        {filteredPrograms.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No programs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterLevel !== "ALL" 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by creating your first academic program"}
            </p>
            {(!searchTerm && filterLevel === "ALL") && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Program
              </Button>
            )}
          </div>
        )}

        {/* Create/Edit Program Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingProgram} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                {editingProgram ? "Edit Program" : "Create New Program"}
              </DialogTitle>
              <DialogDescription>
                {editingProgram
                  ? "Update the program information below."
                  : "Add a new academic program to the system."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(editingProgram ? handleUpdateProgram : handleCreateProgram)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="CS" {...field} />
                        </FormControl>
                        <FormDescription>Short identifier for the program</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <FormControl>
                          <Input placeholder="School of Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Level *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="UNDERGRADUATE">Undergraduate</option>
                            <option value="GRADUATE">Graduate</option>
                            <option value="DOCTORAL">Doctoral</option>
                            <option value="CERTIFICATE">Certificate</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Program description..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional program description</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Program</FormLabel>
                        <FormDescription>
                          Whether this program is currently accepting students
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

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createProgram.isPending || updateProgram.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {editingProgram ? "Update" : "Create"} Program
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingProgramId} onOpenChange={() => setDeletingProgramId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Program</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this program? This action cannot be undone.
                This may affect students and scholarships associated with this program.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProgram}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
