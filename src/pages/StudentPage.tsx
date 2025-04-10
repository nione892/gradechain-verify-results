
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentDashboard from '@/components/StudentDashboard';
import { connectWallet } from '@/utils/web3Utils';
import { AlertCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const StudentPage: React.FC = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

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
      setIsWalletConnected(!!account);
    } catch (error) {
      console.error("Error connecting wallet:", error);
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
          <div className="max-w-md mx-auto p-6 mt-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center p-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
                  <p className="text-muted-foreground mb-6">
                    Please connect your MetaMask wallet to view your academic records stored on the blockchain.
                  </p>
                  <Button 
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <span>Connecting...</span>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5" />
                        <span>Connect MetaMask</span>
                      </>
                    )}
                  </Button>
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
