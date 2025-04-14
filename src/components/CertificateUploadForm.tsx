
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { BookCheck, Upload, Download, FileText, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { uploadResult, calculateResultHash } from '@/utils/web3Utils';
import { BlockchainModeContext } from './Header';

const formSchema = z.object({
  studentId: z.string().min(3, {
    message: "Student ID must be at least 3 characters.",
  }),
  studentName: z.string().min(2, {
    message: "Student name is required.",
  }),
  courseName: z.string().min(2, {
    message: "Course name is required.",
  }),
  issueDate: z.string().min(1, {
    message: "Issue date is required",
  }),
  grade: z.string().min(1, {
    message: "Grade is required.",
  }),
  certificateDetails: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CertificateUploadForm: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [certificateHash, setCertificateHash] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      studentName: "",
      courseName: "",
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      grade: "",
      certificateDetails: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    setCertificateHash(null);
    setQrCodeUrl(null);
    
    try {
      // Calculate certificate hash
      const certificateData = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      
      const hash = calculateResultHash(certificateData);
      
      // Upload to blockchain or simulate in demo mode
      const success = await uploadResult(data.studentId, certificateData);
      
      if (success) {
        setCertificateHash(hash);
        
        // Generate verification URL for QR code
        const baseUrl = window.location.origin;
        const verificationUrl = `${baseUrl}/?verify=${hash}`;
        setQrCodeUrl(verificationUrl);
        
        toast({
          title: "Certificate Uploaded",
          description: isRealBlockchainMode 
            ? "Certificate has been recorded on the blockchain" 
            : "Certificate has been recorded (demo mode)",
          variant: "default",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was an error uploading the certificate. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsUploading(false);
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
      downloadLink.download = `certificate-verification-${form.getValues().studentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookCheck className="h-5 w-5 mr-2 text-primary" />
            Issue Certificate
          </CardTitle>
          <CardDescription>
            Upload a new certificate to the {isRealBlockchainMode ? 'blockchain' : 'demo database'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <Input placeholder="e.g., STU20210001" {...field} />
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
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bachelor of Computer Science" {...field} />
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
                      <FormLabel>Grade/Result</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., First Class, 85%, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="certificateDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional information about the certificate" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include any special achievements, honors, or notes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full md:w-auto"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Certificate
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {certificateHash && qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Certificate Uploaded Successfully
            </CardTitle>
            <CardDescription>
              {isRealBlockchainMode 
                ? "The certificate has been recorded on the blockchain" 
                : "The certificate has been recorded in demo mode"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-6">
            <div className="bg-white p-4 rounded shadow-sm max-w-[200px]">
              <QRCodeSVG
                id="certificate-qr-code"
                value={qrCodeUrl}
                size={200}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: '/placeholder.svg',
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-sm font-medium">Certificate Hash (Verification ID)</h3>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {certificateHash}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Verification URL</h3>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                  {qrCodeUrl}
                </p>
              </div>
              
              <div className="pt-2">
                <Button onClick={downloadQrCode} variant="outline" size="sm" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This QR code can be scanned to verify the certificate's authenticity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificateUploadForm;
