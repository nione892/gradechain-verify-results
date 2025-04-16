
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Blocks, LayoutDashboard, Search, GraduationCap, Info, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectWallet from './ConnectWallet';
import { getUserRole, UserRole } from '@/utils/web3Utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDeployedContractNetwork } from '@/utils/contractDeployer';

// Create a context for blockchain mode
export const BlockchainModeContext = React.createContext({
  isRealBlockchainMode: false,
  toggleBlockchainMode: () => {}
});

const Header: React.FC = () => {
  // Initialize blockchain mode from localStorage, default to false (testing mode)
  const [isRealBlockchainMode, setIsRealBlockchainMode] = useState(() => {
    const savedMode = localStorage.getItem('blockchainMode');
    return savedMode === 'true';
  });
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [networkName, setNetworkName] = useState<string>('');
  const location = useLocation();
  const { toast } = useToast();

  // Update user role when wallet changes
  useEffect(() => {
    const checkWalletAndRole = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const role = getUserRole(accounts[0]);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      }
    };

    checkWalletAndRole();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          const role = getUserRole(accounts[0]);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      });
      
      // Listen for chain/network changes
      window.ethereum.on('chainChanged', () => {
        updateNetworkInfo();
      });
    }

    return () => {
      // Cleanup listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);
  
  // Update network information when mode changes
  useEffect(() => {
    if (isRealBlockchainMode) {
      updateNetworkInfo();
    }
    
    // Save the current mode to localStorage for app-wide consistency
    localStorage.setItem('blockchainMode', isRealBlockchainMode.toString());
  }, [isRealBlockchainMode]);
  
  const updateNetworkInfo = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networks: Record<string, string> = {
          '0x1': 'Ethereum Mainnet',
          '0x5': 'Goerli Testnet',
          '0xaa36a7': 'Sepolia Testnet',
          '0x13881': 'Mumbai Testnet',
          '0x89': 'Polygon Mainnet'
        };
        
        const name = networks[chainId] || `Chain ID: ${parseInt(chainId, 16)}`;
        setNetworkName(name);
        
        // Switch to Sepolia if on another network and in deploy mode
        if (isRealBlockchainMode && chainId !== '0xaa36a7') {
          // Only prompt to switch networks if not already on Sepolia
          toast({
            title: "Network Notice",
            description: "This app is designed to work with Sepolia Testnet. Please switch networks for full functionality.",
          });
        }
      } catch (error) {
        console.error('Error getting network:', error);
      }
    } else {
      setNetworkName('');
    }
  };

  const toggleBlockchainMode = () => {
    const newMode = !isRealBlockchainMode;
    setIsRealBlockchainMode(newMode);
    
    if (newMode && window.ethereum) {
      updateNetworkInfo();
    }
    
    toast({
      title: newMode ? "Blockchain Deploy Mode" : "Local Testing Mode",
      description: newMode 
        ? (networkName 
            ? `Transactions will be sent to ${networkName}` 
            : "Transactions will be sent to the connected blockchain network")
        : "Transactions will be simulated locally without blockchain interaction",
    });
  };

  return (
    <BlockchainModeContext.Provider value={{ isRealBlockchainMode, toggleBlockchainMode }}>
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Blocks className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">GradeChain</h1>
              <p className="text-xs text-muted-foreground">Blockchain Result Verification</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center mr-4 bg-muted/50 p-2 rounded-lg shadow-sm">
              <Label htmlFor="blockchain-mode" className={`text-xs mr-2 ${isRealBlockchainMode ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {isRealBlockchainMode 
                  ? `Deploy Mode${networkName ? ` (${networkName})` : ''}` 
                  : 'Testing Mode'}
              </Label>
              <Switch
                id="blockchain-mode"
                checked={isRealBlockchainMode}
                onCheckedChange={toggleBlockchainMode}
              />
            </div>
            
            {userRole === 'admin' && (
              <Link to="/admin">
                <Button 
                  variant={location.pathname === '/admin' ? 'default' : 'ghost'}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            
            {userRole === 'teacher' && (
              <Link to="/teacher">
                <Button 
                  variant={location.pathname === '/teacher' ? 'default' : 'ghost'}
                  className="flex items-center gap-2"
                >
                  <FileCheck className="h-4 w-4" />
                  Teacher Portal
                </Button>
              </Link>
            )}
            
            {userRole === 'student' && (
              <Link to="/student">
                <Button 
                  variant={location.pathname === '/student' ? 'default' : 'ghost'}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="h-4 w-4" />
                  My Results
                </Button>
              </Link>
            )}
            
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Verify
              </Button>
            </Link>
            
            <ConnectWallet />
          </div>
        </div>
      </header>
    </BlockchainModeContext.Provider>
  );
};

export default Header;
