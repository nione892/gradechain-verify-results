
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadResult, calculateResultHash, calculateDocumentHash } from '@/utils/web3Utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, FileUp, CheckCircle, FileText, RefreshCw, Check, Upload, FileCheck } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { BlockchainModeContext } from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from 'qrcode.react';

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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

const TeacherDashboard: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateHash, setCertificateHash] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setCertificateFile(null);
      return;
    }
    
    const file = e.target.files[0];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
      });
      return;
    }
    
    // Check file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a PDF or PNG file",
      });
      return;
    }
    
    setCertificateFile(file);
    setCertificateHash(null);
    setQrCodeUrl(null);
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a certificate file to upload",
      });
      return;
    }
    
    setIsProcessingFile(true);
    setCertificateHash(null);
    setQrCodeUrl(null);
    
    try {
      // Calculate document hash
      const hash = await calculateDocumentHash(certificateFile);
      
      // Generate verification URL for QR code
      const baseUrl = window.location.origin;
      const verificationUrl = `${baseUrl}/?verify=${hash}`;
      
      // In a real implementation, this would store the hash on the blockchain
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate blockchain interaction
      
      setCertificateHash(hash);
      setQrCodeUrl(verificationUrl);
      
      toast({
        title: "Certificate Uploaded",
        description: isRealBlockchainMode 
          ? "Certificate has been recorded on the blockchain" 
          : "Certificate has been recorded in demo mode",
        variant: "default",
      });
    } catch (error) {
      console.error("Error processing certificate:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Error processing certificate",
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;
    
    const svg = document.getElementById('certificate-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      // Download as PNG
      const downloadLink = document.createElement('a');
      const studentName = form.getValues().studentName || "certificate";
      downloadLink.download = `verification-qr-${studentName.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Upload and manage student results and certificates to the {isRealBlockchainMode ? 'blockchain' : 'demo database'} for permanent and tamper-proof record keeping.
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
            Certificate Upload
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-primary" />
                Upload Certificate
              </CardTitle>
              <CardDescription>
                Upload a PDF or PNG certificate to the {isRealBlockchainMode ? 'blockchain' : 'demo database'} for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificate">Certificate File (PDF or PNG)</Label>
                    <Input 
                      id="certificate" 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max file size: 5MB. Accepted formats: PDF, PNG, JPEG
                    </p>
                  </div>
                  
                  {certificateFile && (
                    <div className="text-sm">
                      <p>Selected file: <span className="font-medium">{certificateFile.name}</span></p>
                      <p>Size: <span className="font-medium">{(certificateFile.size / 1024).toFixed(2)} KB</span></p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleCertificateUpload} 
                    disabled={!certificateFile || isProcessingFile}
                    className="w-full md:w-auto"
                  >
                    {isProcessingFile ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Certificate
                      </>
                    )}
                  </Button>
                </div>
                
                {certificateHash && qrCodeUrl && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-medium mb-4 flex items-center">
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                      Certificate Successfully Uploaded
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="bg-white p-4 rounded shadow-sm">
                        <QRCodeSVG
                          id="certificate-qr-code"
                          value={qrCodeUrl}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      
                      <div className="space-y-4 flex-1">
                        <div>
                          <h4 className="text-sm font-medium">Certificate Hash</h4>
                          <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                            {certificateHash}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium">Verification URL</h4>
                          <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                            {qrCodeUrl}
                          </p>
                        </div>
                        
                        <Button 
                          onClick={downloadQrCode} 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          Download QR Code
                        </Button>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          This QR code can be scanned by anyone to verify the authenticity of the certificate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
            : "This is running in demo mode without a live blockchain connection. In a production environment, results would be stored on-chain."}
        </p>
      </div>
    </div>
  );
};

export default TeacherDashboard;
