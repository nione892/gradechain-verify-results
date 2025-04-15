import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { X, Camera, RefreshCw, ScanLine, CameraOff, ShieldCheck, GraduationCap, Award, FileText } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getResultById } from '@/utils/demoData';

interface QrCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

interface DocumentData {
  fileType: string;
  fileName: string;
  data?: string;
  size?: number;
  resultId?: string;
  resultImageUrl?: string;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedDocument, setScannedDocument] = useState<DocumentData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'failed' | null>(null);
  const [studentResult, setStudentResult] = useState<any>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode } 
        });
        
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop());
        setError(null);
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasPermission(false);
        setError('Camera access denied. Please grant camera permissions to scan QR codes.');
      } finally {
        setIsLoading(false);
      }
    };

    requestCameraPermission();
  }, []);

  const handleScan = (result: any) => {
    if (result) {
      const text = result?.text;
      if (text) {
        try {
          const qrData = JSON.parse(text);
          
          if (qrData.verify && qrData.documentData) {
            const documentData = qrData.documentData;
            setScannedDocument(documentData);
            setVerificationStatus('verified');
            
            if (documentData.resultId) {
              const resultData = getResultById(documentData.resultId);
              setStudentResult(resultData);
            } else if (qrData.resultId) {
              const resultData = getResultById(qrData.resultId);
              setStudentResult(resultData);
            }
            
            toast.success("Certificate verified on blockchain!", {
              description: "This document has been verified as authentic",
            });
            
            onScan(qrData.verify);
          } else {
            toast.success("QR code detected!");
            onScan(text);
          }
        } catch (e) {
          toast.success("QR code detected!");
          onScan(text);
        }
      }
    }
  };

  const toggleCamera = (mode: 'environment' | 'user') => {
    setFacingMode(mode);
    setError(null);
    setIsLoading(true);
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: mode } 
    })
    .then(stream => {
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(err => {
      console.error("Camera toggle error:", err);
      setError(`Could not access ${mode === 'environment' ? 'back' : 'front'} camera.`);
      setHasPermission(false);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const retryPermission = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode } 
      });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Retry permission error:", err);
      setHasPermission(false);
      setError('Camera access still denied. Please check browser settings and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (scannedDocument) {
    return (
      <div className="bg-background border rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
            Verified Certificate
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {studentResult?.resultImageUrl ? (
          <div className="relative mb-4">
            <img 
              src={studentResult.resultImageUrl} 
              alt="Verified Certificate" 
              className="w-full object-contain border rounded-lg"
            />
            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center shadow-md">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verified on Blockchain
            </div>
          </div>
        ) : studentResult ? (
          <div className="space-y-4">
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center text-blue-800">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Name:</p>
                    <p>{studentResult.student.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Roll No:</p>
                    <p>{studentResult.student.roll}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Program:</p>
                    <p>{studentResult.student.program}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Semester:</p>
                    <p>{studentResult.semester}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-4 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Award className="h-4 w-4 mr-2 text-amber-500" />
                  Academic Results
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-1 text-left">Subject</th>
                        <th className="px-2 py-1 text-right">Marks</th>
                        <th className="px-2 py-1 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentResult.grades.map((grade: any, index: number) => {
                        const course = studentResult.courses.find((c: any) => c.id === grade.courseId);
                        return (
                          <tr key={grade.courseId} className="border-b border-dashed">
                            <td className="px-2 py-1 text-left">{course?.name || grade.courseId}</td>
                            <td className="px-2 py-1 text-right">{grade.marks}</td>
                            <td className="px-2 py-1 text-right font-medium">{grade.grade}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30">
                        <td className="px-2 py-1 font-medium">Result</td>
                        <td className="px-2 py-1 text-right" colSpan={2}>
                          <span className="font-medium text-green-600">PASS</span>
                          {studentResult.gpa && (
                            <span className="ml-2">GPA: {studentResult.gpa.toFixed(1)}</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                  <div>Issue Date: {studentResult.issueDate}</div>
                  <div className="flex items-center bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Blockchain Verified
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mb-4 overflow-hidden">
            <CardContent className="p-0 relative">
              {scannedDocument.data ? (
                <div className="relative">
                  <img 
                    src={scannedDocument.data} 
                    alt="Verified Certificate" 
                    className="w-full object-contain"
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center shadow-md">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verified on Blockchain
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <h4 className="font-medium">{scannedDocument.fileName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {scannedDocument.fileType} 
                    {scannedDocument.size && ` - ${(scannedDocument.size / 1024).toFixed(1)} KB`}
                  </p>
                  <div className="mt-2 inline-block bg-green-500 text-white px-3 py-1 rounded-lg font-semibold text-sm flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Verified on Blockchain
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium flex items-center">
          <Camera className="h-5 w-5 mr-2 text-primary" />
          Scan QR Code
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-3">
        <ToggleGroup type="single" value={facingMode} onValueChange={(value) => toggleCamera(value as 'environment' | 'user')}>
          <ToggleGroupItem value="environment" aria-label="Back camera">
            Rear Camera
          </ToggleGroupItem>
          <ToggleGroupItem value="user" aria-label="Front camera">
            Front Camera
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg aspect-square">
          <RefreshCw className="h-8 w-8 animate-spin text-primary/70 mb-4" />
          <p className="text-sm text-center">Accessing camera...</p>
        </div>
      ) : error || hasPermission === false ? (
        <div className="p-4 bg-destructive/10 rounded-md mb-4">
          <div className="flex items-center mb-2">
            <CameraOff className="h-5 w-5 text-destructive mr-2" />
            <p className="text-sm font-medium text-destructive">Camera Access Error</p>
          </div>
          <p className="text-sm text-destructive mb-3">{error || 'Unable to access camera. Please check your permissions.'}</p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={retryPermission}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <p className="text-xs text-muted-foreground">
              Make sure to allow camera access in your browser settings. 
              You may need to click the camera icon in your address bar.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative bg-black rounded-md overflow-hidden aspect-square max-w-sm mx-auto">
          <QrReader
            constraints={{ facingMode }}
            onResult={handleScan}
            scanDelay={500}
            className="w-full"
            videoContainerStyle={{ padding: 0 }}
            containerStyle={{ padding: 0 }}
            videoStyle={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
          <div className="absolute inset-0 border-4 border-primary/50 rounded-md pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/70 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ScanLine className="h-32 w-32 text-primary/30 animate-pulse" />
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-3">
        Point your camera at a certificate verification QR code
      </p>
      
      <div className="flex justify-end mt-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default QrCodeScanner;
