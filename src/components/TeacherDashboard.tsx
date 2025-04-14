
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadResult, calculateResultHash } from '@/utils/web3Utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, FileUp, CheckCircle, FileText, FileCheck } from 'lucide-react';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import CertificateUploadForm from './CertificateUploadForm';
import { BlockchainModeContext } from './Header';

const formSchema = z.object({
  studentId: z.string().min(3, {
    message: "Student ID must be at least 3 characters.",
  }),
  studentName: z.string().min(2, {
    message: "Student name is required.",
  }),
  course: z.string().min(2, {
    message: "Course name is required.",
  }),
  grade: z.string().min(1, {
    message: "Grade is required.",
  }),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TeacherDashboard: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      studentName: "",
      course: "",
      grade: "",
      comments: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    setResultHash(null);
    
    try {
      // Calculate result hash
      const hash = calculateResultHash({
        ...data,
        timestamp: new Date().toISOString(),
      });
      
      // Upload to blockchain
      const success = await uploadResult(data.studentId, data);
      
      if (success) {
        setResultHash(hash);
        toast({
          title: "Result Uploaded",
          description: (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Student result has been recorded on the blockchain</span>
            </div>
          )
        });
        
        // Reset form
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was an error uploading the result. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error uploading result:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Upload and manage student results to the {isRealBlockchainMode ? 'blockchain' : 'demo database'} for permanent and tamper-proof record keeping.
        </p>
      </div>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="results" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Results Upload
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            Certificate Issuance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="space-y-6">
          <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileUp className="mr-2 h-5 w-5 text-primary" />
              Upload New Result
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., S12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A+, 95%, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes about student performance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="w-full md:w-auto"
                >
                  {isUploading ? 'Uploading...' : 'Upload to Blockchain'}
                </Button>
              </form>
            </Form>
            
            {resultHash && (
              <div className="mt-6 p-4 bg-primary/10 rounded-md">
                <h3 className="font-medium mb-2 flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4 text-primary" />
                  Result Hash (Verification ID)
                </h3>
                <p className="text-sm mb-2 break-all font-mono bg-background p-2 rounded">
                  {resultHash}
                </p>
                <p className="text-xs text-muted-foreground">
                  Share this verification ID with the student for result verification.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="certificates" className="space-y-6">
          <CertificateUploadForm />
        </TabsContent>
      </Tabs>

      <div className="bg-muted/50 p-6 rounded-lg mt-8">
        <h2 className="font-semibold mb-2">
          {isRealBlockchainMode 
            ? "Real Blockchain Mode Active" 
            : "Demo Mode Active"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRealBlockchainMode 
            ? "You are working with a live blockchain connection. Records are being stored on the Ethereum Sepolia testnet." 
            : "This is running in demo mode without a live blockchain connection. In a production environment, results would be stored on-chain with the full data secured through IPFS."}
        </p>
      </div>
    </div>
  );
};

export default TeacherDashboard;
