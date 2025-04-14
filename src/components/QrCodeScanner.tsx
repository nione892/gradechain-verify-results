
import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { X, Camera, RefreshCw, ScanLine, CameraOff } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";

interface QrCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Request camera permission on component mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode } 
        });
        
        // If we got a stream, we have permission
        setHasPermission(true);
        // Clean up stream tracks
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
        toast.success("QR code detected!");
        onScan(text);
      }
    }
  };

  // Handle camera toggle while resetting any errors
  const toggleCamera = (mode: 'environment' | 'user') => {
    setFacingMode(mode);
    setError(null);
    // Re-request permission with new camera
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
            // We're not using the onError prop since it's causing TypeScript errors
            // Instead, we're handling errors through our useEffect and state management
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
