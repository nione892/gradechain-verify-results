
import React, { useState, useRef } from 'react';
import { Upload, FileUp, X, Check, Loader2, FileX, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { calculateDocumentHash } from '@/utils/web3Utils';

interface CertificateUploaderProps {
  onVerify: (documentHash: string) => void;
  isVerifying: boolean;
}

const CertificateUploader: React.FC<CertificateUploaderProps> = ({ onVerify, isVerifying }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const validateFile = (file: File): boolean => {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File is too large. Maximum size is 10MB.');
      return false;
    }
    
    // Check file type (pdf and image files)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload PDF or image files (JPEG, PNG).');
      return false;
    }
    
    setFileError(null);
    return true;
  };
  
  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    setFile(file);
    setIsCalculatingHash(true);
    
    try {
      // Calculate document hash
      const documentHash = await calculateDocumentHash(file);
      
      // Call the onVerify callback with the hash
      if (documentHash) {
        onVerify(documentHash);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setFileError('Error processing file. Please try again.');
    } finally {
      setIsCalculatingHash(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const resetFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="space-y-4"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
      />
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">
                Drag and drop your certificate here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Upload PDF, JPEG, or PNG files (max. 10MB)
              </p>
            </div>
            <Button type="button" variant="outline" className="mt-2" size="sm">
              <FileUp className="h-4 w-4 mr-2" />
              Browse files
            </Button>
          </div>
        </div>
      ) : (
        <motion.div 
          className="border rounded-lg p-6 space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 rounded-full p-2">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={resetFile}
              disabled={isCalculatingHash || isVerifying}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Verification Status:</span>
              <div className="flex items-center">
                {isCalculatingHash || isVerifying ? (
                  <div className="flex items-center text-amber-500">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isCalculatingHash ? 'Calculating Hash...' : 'Verifying...'}
                  </div>
                ) : fileError ? (
                  <div className="flex items-center text-destructive">
                    <FileX className="h-4 w-4 mr-2" />
                    Error
                  </div>
                ) : (
                  <div className="flex items-center text-primary">
                    <Check className="h-4 w-4 mr-2" />
                    Ready to verify
                  </div>
                )}
              </div>
            </div>
            
            {fileError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {fileError}
              </div>
            )}
          </div>
          
          <Button 
            type="button" 
            className="w-full"
            disabled={isCalculatingHash || isVerifying || !!fileError}
            onClick={() => file && !isCalculatingHash && processFile(file)}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying Certificate
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Verify Certificate
              </>
            )}
          </Button>
        </motion.div>
      )}
      
      <motion.div 
        className="text-xs text-muted-foreground pt-2 bg-muted/50 p-3 rounded-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium">About Certificate Verification</p>
          <ChevronDown className="h-4 w-4" />
        </div>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Upload your official academic certificate or marksheet</li>
          <li>The system will calculate a unique hash of your document</li>
          <li>The hash will be verified against blockchain records</li>
          <li>Results show instantly with blockchain verification proof</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default CertificateUploader;
