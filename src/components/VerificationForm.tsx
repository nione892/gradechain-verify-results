
import React, { useState } from 'react';
import { Search, CircleAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getResultById } from '@/utils/demoData';
import { verifyResultHash } from '@/utils/web3Utils';
import { motion } from 'framer-motion';

interface VerificationFormProps {
  onResultFound: (resultId: string) => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ onResultFound }) => {
  const [resultId, setResultId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const { toast } = useToast();

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearchError('');
    
    if (!resultId.trim()) {
      setSearchError('Please enter a result ID or verification hash');
      return;
    }

    setIsSearching(true);
    
    try {
      // First, check if we have this result in our demo data
      const result = getResultById(resultId);
      
      if (result) {
        // Verify the result on the blockchain
        const verificationResult = await verifyResultHash(resultId);
        
        if (verificationResult.isVerified) {
          toast({
            title: "Result Found",
            description: "Result has been verified on the blockchain",
          });
          onResultFound(resultId);
        } else {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: verificationResult.message || "This result could not be verified on the blockchain",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Result Not Found",
          description: "No result found with this ID. Please check and try again.",
        });
        setSearchError('No result found with this ID. Please check and try again.');
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
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Verify Academic Results</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Enter your result ID or verification hash to verify your academic results on the blockchain
            </p>
          </motion.div>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <motion.div 
              className="flex flex-col md:flex-row gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="flex-grow">
                <Input
                  placeholder="Enter Result ID or Verification Hash"
                  value={resultId}
                  onChange={(e) => setResultId(e.target.value)}
                  className="w-full border-primary/20 focus:border-primary/50"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSearching} 
                className="min-w-[120px] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSearching ? (
                    <>Verifying...</>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Verify</span>
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
                className="text-destructive flex items-center gap-2 text-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <CircleAlert className="h-4 w-4" />
                <span>{searchError}</span>
              </motion.div>
            )}
            
            <motion.div 
              className="text-xs text-muted-foreground pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <p>Example IDs for testing:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>STU20210001-SEM2-123 (will verify)</li>
                <li>STU20210002-SEM1-456 (won't verify)</li>
                <li>STU20210003-SEM3-789 (won't verify)</li>
              </ul>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationForm;
