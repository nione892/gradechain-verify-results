
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Upload, CheckCircle, FileText, RefreshCw, GraduationCap } from 'lucide-react';
import { uploadResult, calculateResultHash, calculateDocumentHash } from '@/utils/web3Utils';
import CertificateUploadForm from './CertificateUploadForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlockchainModeContext } from './Header';
import { Textarea } from '@/components/ui/textarea';
import { QRCodeSVG } from 'qrcode.react';

const AdminUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState('results');
  const [isUploading, setIsUploading] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateHash, setCertificateHash] = useState<string | null>(null);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [grade, setGrade] = useState('');
  const [comments, setComments] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);

  const handleResultUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !studentName || !course || !grade) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill all required fields"
      });
      return;
    }
    
    setIsUploading(true);
    setResultHash(null);
    
    try {
      // Create result data object
      const resultData = {
        studentId,
        studentName,
        course,
        grade,
        comments,
        timestamp: new Date().toISOString()
      };
      
      // Calculate hash for later display
      const hash = calculateResultHash(resultData);
      
      // Upload to blockchain
      const success = await uploadResult(studentId, resultData);
      
      if (success) {
        setResultHash(hash);
        toast({
          title: "Result Uploaded",
          description: isRealBlockchainMode
            ? "Result has been recorded on the blockchain"
            : "Result has been recorded in testing mode"
        });
        
        // Clear form after successful upload
        setStudentId('');
        setStudentName('');
        setCourse('');
        setGrade('');
        setComments('');
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: isRealBlockchainMode
            ? "There was an error uploading to the blockchain. Please try again."
            : "There was an error in the upload simulation. Please try again."
        });
      }
    } catch (error) {
      console.error("Error uploading result:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during upload."
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
    setCertificateFile(file);
    setCertificateHash(null);
    setQrCodeUrl(null);
  };

  const handleCertificateUpload = async () => {
    if (!certificateFile || !studentId) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a file and enter a student ID"
      });
      return;
    }
    
    setIsUploading(true);
    setCertificateHash(null);
    setQrCodeUrl(null);
    
    try {
      // Calculate document hash
      const hash = await calculateDocumentHash(certificateFile);
      
      // Create certificate data
      const certificateData = {
        type: 'certificate',
        studentId,
        studentName,
        fileName: certificateFile.name,
        fileType: certificateFile.type,
        fileSize: certificateFile.size,
        timestamp: Date.now()
      };
      
      // Upload to blockchain
      const success = await uploadResult(studentId, certificateData);
      
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
            : "Certificate has been recorded in testing mode"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was an error uploading the certificate. Please try again."
        });
      }
    } catch (error) {
      console.error("Error processing certificate:", error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Error processing certificate file."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;
    
    const svg = document.getElementById('admin-certificate-qr-code');
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
      downloadLink.download = `verification-qr-${studentId.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Admin Upload Center</h2>
      <p className="text-muted-foreground mb-6">
        Upload official results and certificates to the {isRealBlockchainMode ? 'Sepolia blockchain' : 'testing environment'}.
      </p>
      
      <Tabs defaultValue="results" className="space-y-6" onValueChange={(value) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="results" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Results Upload
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            Certificate Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                Upload Student Result
              </CardTitle>
              <CardDescription>
                Upload a new result to the {isRealBlockchainMode ? 'Sepolia blockchain' : 'testing environment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResultUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input 
                      id="studentId" 
                      value={studentId} 
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g., STU20210001"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input 
                      id="studentName" 
                      value={studentName} 
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input 
                      id="course" 
                      value={course} 
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g., Computer Science 101"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input 
                      id="grade" 
                      value={grade} 
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g., A+, 95%, etc."
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea 
                    id="comments" 
                    value={comments} 
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Additional notes about student performance"
                    rows={3}
                  />
                </div>
                
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
                      Upload to Blockchain
                    </>
                  )}
                </Button>
              </form>
              
              {resultHash && (
                <div className="mt-6 p-4 bg-primary/10 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Result Hash (Verification ID)
                  </h3>
                  <p className="text-sm mb-2 break-all font-mono bg-background p-2 rounded">
                    {resultHash}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This hash can be used to verify the result on the blockchain.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-primary" />
                Upload Certificate
              </CardTitle>
              <CardDescription>
                Upload a certificate file to the {isRealBlockchainMode ? 'Sepolia blockchain' : 'testing environment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="certificate-student-id">Student ID</Label>
                    <Input 
                      id="certificate-student-id" 
                      value={studentId} 
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g., STU20210001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certificate-student-name">Student Name (Optional)</Label>
                    <Input 
                      id="certificate-student-name" 
                      value={studentName} 
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                </div>
                
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
                  disabled={!certificateFile || !studentId || isUploading}
                  className="w-full md:w-auto"
                >
                  {isUploading ? (
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
                
                {certificateHash && qrCodeUrl && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-medium mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Certificate Successfully Uploaded
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="bg-white p-4 rounded shadow-sm">
                        <QRCodeSVG
                          id="admin-certificate-qr-code"
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
                          This QR code can be scanned to verify the authenticity of the certificate.
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
    </div>
  );
};

export default AdminUpload;
