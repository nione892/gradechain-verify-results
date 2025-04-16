import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ShieldCheck, FileDigit, AlertTriangle, FileUp, Upload, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getResultById } from '@/utils/demoData';
import { verifyResultHash, verifyDocumentHash, processVerificationUrl } from '@/utils/web3Utils';
import { motion } from 'framer-motion';
import CertificateUploader from '@/components/CertificateUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QrCodeScanner from '@/components/QrCodeScanner';
import { BlockchainModeContext } from '@/components/Header';
import VerificationSuccess from './VerificationSuccess';

interface VerificationFormProps {
  onResultFound: (resultId: string) => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onResultFound }) => {
  const [resultId, setResultId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState<'id' | 'document' | 'qrcode'>('id');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [lastVerifiedDocumentData, setLastVerifiedDocumentData] = useState<any>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<{hash: string, studentName: string} | null>(null);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);
  
  useEffect(() => {
    const url = new URL(window.location.href);
    const verifyParam = url.searchParams.get('verify');
    
    if (verifyParam) {
      handleVerificationFromHash(verifyParam);
    }
  }, []);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchError('');
    setVerificationSuccess(null);
    
    if (!resultId.trim()) {
      setSearchError('Please enter a result ID or verification hash');
      return;
    }

    setIsSearching(true);
    
    try {
      const verificationResult = await verifyResultHash(resultId);
      
      if (verificationResult.isVerified) {
        toast({
          title: "Result Verified",
          description: isRealBlockchainMode 
            ? "Result has been verified on the blockchain" 
            : "Result has been verified in testing mode",
        });
        
        if (verificationResult.studentName) {
          setVerificationSuccess({
            hash: resultId,
            studentName: verificationResult.studentName
          });
        }
        
        if (verificationResult.resultId) {
          onResultFound(verificationResult.resultId);
        } else {
          const result = getResultById(resultId);
          if (result) {
            onResultFound(resultId);
          } else {
            toast({
              title: "Verification Successful",
              description: "The hash was verified, but no detailed record was found.",
            });
          }
        }
      } else {
        const result = getResultById(resultId);
        
        if (result) {
          toast({
            title: "Result Found",
            description: "Result found in database",
          });
          
          setLastVerifiedDocumentData(null);
          
          onResultFound(resultId);
        } else {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "No result found with this ID or hash. Please check and try again.",
          });
          setSearchError('No result found with this ID or hash. Please check and try again.');
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
      });
      setSearchError('An error occurred during verification. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocumentVerify = async (documentHash: string, documentData?: any) => {
    if (!documentHash) {
      return;
    }

    setIsSearching(true);
    
    try {
      if (documentData) {
        setLastVerifiedDocumentData(documentData);
      }
      
      const verificationResult = await verifyDocumentHash(documentHash);
      
      if (verificationResult.isVerified) {
        toast({
          title: "Certificate Verified",
          description: isRealBlockchainMode 
            ? "The certificate has been verified on the blockchain" 
            : "The certificate has been verified in testing mode",
        });
        
        const resultIdToUse = verificationResult.resultId || documentData?.resultId;
        
        if (resultIdToUse) {
          onResultFound(resultIdToUse);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: verificationResult.message || "This certificate could not be verified on the blockchain",
        });
      }
    } catch (error) {
      console.error("Document verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "An error occurred during certificate verification. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerificationFromHash = (hash: string) => {
    setResultId(hash);
    setActiveTab('id');
    
    setLastVerifiedDocumentData(null);
    
    setTimeout(() => {
      const form = document.getElementById('verification-form') as HTMLFormElement;
      if (form) {
        handleVerify(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
      }
    }, 100);
  };

  const handleQrCodeScan = async (qrData: string) => {
    setShowQrScanner(false);
    
    try {
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.verify) {
        handleVerificationFromHash(parsedData.verify);
        
        if (parsedData.documentData) {
          setLastVerifiedDocumentData(parsedData.documentData);
        }
      }
    } catch (e) {
      const verificationHash = processVerificationUrl(qrData);
      
      if (verificationHash) {
        handleVerificationFromHash(verificationHash);
      } else {
        setResultId(qrData);
        setActiveTab('id');
        
        setLastVerifiedDocumentData(null);
        
        setTimeout(() => {
          const form = document.getElementById('verification-form') as HTMLFormElement;
          if (form) {
            handleVerify(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
          }
        }, 100);
      }
    }
  };

  return (
    <motion.div 
      id="verification-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 bg-gradient-to-b from-background to-muted/30">
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center justify-center mb-6 text-primary"
          >
            <div className="relative">
              <ShieldCheck className="h-16 w-16" />
              <motion.div 
                className="absolute -right-1 -top-1 bg-secondary text-secondary-foreground rounded-full p-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              >
                <FileDigit className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Verify Academic Results</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Verify your academic results or certificates on the blockchain
            </p>
          </motion.div>
          
          {verificationSuccess ? (
            <VerificationSuccess 
              hash={verificationSuccess.hash}
              studentName={verificationSuccess.studentName}
            />
          ) : (
            showQrScanner ? (
              <QrCodeScanner 
                onScan={handleQrCodeScan} 
                onClose={() => setShowQrScanner(false)} 
              />
            ) : (
              <Tabs defaultValue="id" className="mb-4" onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="id" className="flex items-center gap-2">
                    <FileDigit className="h-4 w-4" />
                    By ID
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    By File
                  </TabsTrigger>
                  <TabsTrigger value="qrcode" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    By QR Code
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="id">
                  <form onSubmit={handleVerify} className="space-y-4">
                    <motion.div 
                      className="flex flex-col md:flex-row gap-2 relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <div className="flex-grow relative">
                        <Input
                          placeholder="Enter Result ID or Verification Hash"
                          value={resultId}
                          onChange={(e) => setResultId(e.target.value)}
                          className="w-full border-primary/20 focus:border-primary/50 pr-10 pl-4 py-6"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          <FileDigit className="h-5 w-5" />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSearching} 
                        className="min-w-[140px] relative overflow-hidden group py-6"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {isSearching ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Search className="h-4 w-4" />
                              </motion.div>
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4" />
                              <span>Verify Result</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </span>
                        {!isSearching && (
                          <motion.div 
                            className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10"
                            initial={false}
                            animate={{ scale: isSearching ? 1 : 0.6 }}
                            whileHover={{ scale: 1 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                    
                    {searchError && (
                      <motion.div 
                        className="text-destructive flex items-center gap-2 text-sm p-3 bg-destructive/10 rounded-md"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>{searchError}</span>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="text-xs text-muted-foreground pt-2 bg-muted/50 p-3 rounded-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <p className="font-medium mb-1">
                        {isRealBlockchainMode ? 'Blockchain Verification' : 'Testing Mode Verification'}
                      </p>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Enter a student ID, result ID or blockchain hash</li>
                        <li>Results will be verified against {isRealBlockchainMode ? 'Sepolia blockchain records' : 'testing database'}</li>
                        <li>QR codes can also be scanned for quick verification</li>
                      </ul>
                    </motion.div>
                  </form>
                </TabsContent>
                
                <TabsContent value="document">
                  <CertificateUploader onVerify={handleDocumentVerify} isVerifying={isSearching} />
                </TabsContent>
                
                <TabsContent value="qrcode">
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed border-primary/30">
                    <QrCode className="h-16 w-16 text-primary/70 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Scan Certificate QR Code</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Use your device's camera to scan a QR code from a certificate to verify its authenticity
                    </p>
                    <Button onClick={() => setShowQrScanner(true)}>
                      Open Camera Scanner
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )
          )}
          
          <motion.div 
            className="mt-4 border-t pt-4 border-primary/10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
              <div className={`h-2 w-2 rounded-full ${isRealBlockchainMode ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span>{isRealBlockchainMode ? 'Live Blockchain Verification' : 'Testing Mode Verification'}</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationForm;
