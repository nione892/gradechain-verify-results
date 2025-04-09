
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Blocks, LayoutDashboard, Search, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectWallet from './ConnectWallet';
import { getUserRole, UserRole } from '@/utils/web3Utils';

const Header: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const location = useLocation();

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
    }

    return () => {
      // Cleanup listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Blocks className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-primary">GradeChain</h1>
            <p className="text-xs text-muted-foreground">Blockchain Result Verification</p>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
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
                <LayoutDashboard className="h-4 w-4" />
                Teacher Dashboard
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
              Verify Results
            </Button>
          </Link>
          
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};

export default Header;
