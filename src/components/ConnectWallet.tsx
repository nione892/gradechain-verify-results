
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, GraduationCap, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserRole, UserRole } from '@/utils/web3Utils';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const roleIcons = {
  admin: <Shield className="h-4 w-4 text-primary" />,
  teacher: <GraduationCap className="h-4 w-4 text-primary" />,
  student: <User className="h-4 w-4" />
};

const ConnectWallet: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the wallet is already connected
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setUserRole(null);
        } else {
          setAccount(accounts[0]);
          const role = getUserRole(accounts[0]);
          setUserRole(role);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${shortenAddress(accounts[0])}`,
          });
        }
      });
    }
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const role = getUserRole(accounts[0]);
          setUserRole(role);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask Required",
        description: "Please install MetaMask to connect your wallet",
      });
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const role = getUserRole(accounts[0]);
      setUserRole(role);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${shortenAddress(accounts[0])}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
      });
    } finally {
      setConnecting(false);
    }
  };

  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {account ? (
        <Button variant="outline" className="flex items-center gap-2">
          {userRole && roleIcons[userRole]}
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Connected'}: </span>
          <span>{shortenAddress(account)}</span>
        </Button>
      ) : (
        <Button 
          onClick={connectWallet} 
          disabled={connecting}
          className="flex items-center gap-2"
        >
          {connecting ? (
            <>Connecting...</>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
