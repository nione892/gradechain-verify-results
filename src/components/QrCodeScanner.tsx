
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { X, Camera, RefreshCw, ScanLine } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface QrCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const handleScan = (result: any) => {
    if (result) {
      const text = result?.text;
      if (text) {
        onScan(text);
      }
    }
  };

  const handleError = (err: any) => {
    console.error('QR Code Scanner Error:', err);
    setError('Error accessing camera. Please ensure you have granted camera permissions.');
  };

  const toggleCamera = (mode: 'environment' | 'user') => {
    setFacingMode(mode);
  };

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
      
      {error ? (
        <div className="p-4 bg-destructive/10 rounded-md mb-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : (
        <div className="relative bg-black rounded-md overflow-hidden aspect-square max-w-sm mx-auto">
          <QrReader
            constraints={{ facingMode }}
            onResult={handleScan}
            onError={handleError}
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
