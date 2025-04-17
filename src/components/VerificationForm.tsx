import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ShieldCheck, FileDigit, AlertTriangle, FileUp, Upload, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { verifyResultHash } from '@/utils/web3Utils';
import CertificateUploader from './CertificateUploader';
import QrCodeScanner from './QrCodeScanner';
import { processVerificationUrl } from '@/utils/web3Utils';

interface VerificationFormProps {
  onResultFound: (resultId: string) => void;
}

// Define the DocumentData interface to fix type errors
interface DocumentData {
  resultId?: string;
  verificationHash?: string;
  verify?: string;
  documentData?: any;
  [key: string]: any;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onResultFound }) => {
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  useEffect(() => {
    // Check if the URL contains a verification parameter
    const url = window.location.href;
    const hashToVerify = processVerificationUrl(url);
    
    if (hashToVerify) {
      setVerificationId(hashToVerify);
      handleVerify(hashToVerify);
    }
  }, []);
  
  const handleVerify = async (id: string = verificationId) => {
    if (!id.trim()) {
      setError('Please enter a verification ID');
      return;
    }
    
    setError(null);
    setIsVerifying(true);
    
    try {
      const result = await verifyResultHash(id);
      
      if (result.isVerified && result.resultId) {
        setShowSuccess(true);
        setSuccessMessage(`Certificate verified successfully for ${result.studentName || 'student'}`);
        setTimeout(() => {
          onResultFound(result.resultId);
        }, 1500);
      } else {
        setError(result.message || 'Unable to verify certificate. Please check the ID and try again.');
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleVerificationFromHash = async (hash: string, documentData?: any) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // If using QR code, parse the data
      let parsedData: DocumentData = {};
      let hashToVerify = hash;
      
      if (typeof hash === 'string' && hash.startsWith('{')) {
        try {
          parsedData = JSON.parse(hash) as DocumentData;
          hashToVerify = parsedData.verify || '';
        } catch (e) {
          console.error("Error parsing JSON from QR code:", e);
        }
      }
      
      // If we have a verification hash, use it
      if (hashToVerify) {
        handleVerify(hashToVerify);
      } else if (parsedData.verificationHash) {
        handleVerify(parsedData.verificationHash);
      } else {
        setError('Invalid QR code data. No verification hash found.');
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("QR verification error:", error);
      setError('Error processing QR code data');
      setIsVerifying(false);
    }
  };
  
  const handleQrCodeScan = (data: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // Parse the QR code data
      let parsedData: DocumentData = {};
      let hashToVerify = data;
      
      if (data.startsWith('{')) {
        try {
          parsedData = JSON.parse(data) as DocumentData;
          hashToVerify = parsedData.verify || '';
        } catch (e) {
          console.error("Error parsing JSON from QR code:", e);
        }
      }
      
      // If we have a verification hash, use it
      if (hashToVerify) {
        handleVerify(hashToVerify);
      } else if (parsedData.verificationHash) {
        handleVerify(parsedData.verificationHash);
      } else {
        setError('Invalid QR code data. No verification hash found.');
      }
    } catch (error) {
      console.error("QR verification error:", error);
      setError('Error processing QR code data');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseQrScanner = () => {
    setShowQrScanner(false);
  };
  
  return (
    <div id="verification-form" className="bg-card p-6 rounded-xl border shadow-sm max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold flex items-center justify-center mb-2">
          <ShieldCheck className="mr-2 h-6 w-6 text-primary" />
          Certificate Verification Portal
        </h2>
        <p className="text-muted-foreground">
          Verify the authenticity of academic certificates and results
        </p>
      </div>
      
      <Tabs defaultValue="id" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="id">Verification ID</TabsTrigger>
          <TabsTrigger value="upload">Upload Certificate</TabsTrigger>
          <TabsTrigger value="qrcode">Scan QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="id" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="verificationId"
              placeholder="Enter certificate verification ID"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleVerify()}
              disabled={isVerifying || !verificationId}
              className="whitespace-nowrap"
            >
              {isVerifying ? (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FileDigit className="mr-2 h-4 w-4 animate-pulse" />
                  Verifying...
                </motion.div>
              ) : (
                <motion.div 
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Verify Certificate
                </motion.div>
              )}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Enter the unique verification ID or hash from the certificate</p>
          </div>
        </TabsContent>
        
        <TabsContent value="upload">
          <CertificateUploader 
            onVerify={handleVerificationFromHash} 
            isVerifying={isVerifying} 
          />
        </TabsContent>
        
        <TabsContent value="qrcode" className="flex justify-center">
          <div className="max-w-md w-full">
            <QrCodeScanner 
              onScan={handleQrCodeScan} 
              onClose={handleCloseQrScanner}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <motion.div 
          className="mt-4 bg-destructive/10 text-destructive p-3 rounded-md flex items-start"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}
      
      {showSuccess && (
        <motion.div 
          className="mt-4 bg-green-100 text-green-800 p-3 rounded-md flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShieldCheck className="h-5 w-5 mr-2" />
          <p>{successMessage}</p>
        </motion.div>
      )}
      
      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-muted-foreground mb-2">Need to issue a new certificate?</p>
        <Button variant="outline" onClick={() => window.location.href = '/teacher'}>
          Go to Certificate Issuance
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
