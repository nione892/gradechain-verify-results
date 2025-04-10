
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentDashboard from '@/components/StudentDashboard';
import { connectWallet } from '@/utils/web3Utils';
import { AlertCircle, Wallet, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const StudentPage: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsWalletConnected(accounts.length > 0);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setIsWalletConnected(accounts.length > 0);
      });
    }

    return () => {
      // Cleanup listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const account = await connectWallet();
      if (account) {
        setIsWalletConnected(true);
        toast({
          title: "Wallet Connected",
          description: "Your MetaMask wallet has been connected successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "There was an error connecting to your wallet.",
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {isWalletConnected ? (
          <StudentDashboard />
        ) : (
          <div className="max-w-3xl mx-auto p-6 mt-12">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 shadow-lg">
              <CardContent className="pt-6 pb-8">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="rounded-full bg-primary/10 p-4 mb-6">
                    <GraduationCap className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Student Results Dashboard</h2>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Connect your MetaMask wallet to view your academic records securely stored on the blockchain. Your records are immutable and verified by your educational institution.
                  </p>
                  <div className="flex flex-col space-y-4 w-full max-w-sm">
                    <Button 
                      onClick={handleConnectWallet}
                      disabled={connecting}
                      size="lg"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {connecting ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="h-5 w-5" />
                          <span>Connect MetaMask</span>
                        </>
                      )}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center justify-center mb-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Don't have MetaMask?</span>
                      </div>
                      <a 
                        href="https://metamask.io/download/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Download and install MetaMask
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentPage;
