
import React, { createContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Hexagon, LogOut, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { connectWallet } from '@/utils/web3Utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserRole, UserRole } from '@/utils/web3Utils';

interface BlockchainModeContextType {
  isRealBlockchainMode: boolean;
  toggleBlockchainMode: () => void;
}

// Create context with default values
export const BlockchainModeContext = createContext<BlockchainModeContextType>({
  isRealBlockchainMode: true,
  toggleBlockchainMode: () => {},
});

const Header: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isRealBlockchainMode, setIsRealBlockchainMode] = useState(true);
  const location = useLocation();
  
  // Always true for blockchain mode now that demo is removed
  const toggleBlockchainMode = () => {
    setIsRealBlockchainMode(true);
  };
  
  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      const role = getUserRole(address);
      setUserRole(role);
    }
  };
  
  const handleDisconnect = () => {
    setWalletAddress(null);
    setUserRole(null);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Admin Portal', path: '/admin', requireRole: 'admin' as UserRole },
    { label: 'Teacher Portal', path: '/teacher', requireRole: 'teacher' as UserRole },
    { label: 'Student Portal', path: '/student', requireRole: 'student' as UserRole },
  ];
  
  const filteredNavItems = navItems.filter(item => {
    if (!item.requireRole) return true;
    if (!userRole) return false;
    return item.requireRole === userRole;
  });
  
  return (
    <BlockchainModeContext.Provider value={{ isRealBlockchainMode, toggleBlockchainMode }}>
      <header className="border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center">
                <Hexagon className="h-8 w-8 text-primary mr-2" />
                <span className="font-bold text-xl">GradeChain</span>
              </Link>
              
              <nav className="hidden md:flex space-x-6 ml-10">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.path) ? 'text-primary' : 'text-foreground/60'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {walletAddress ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">
                        {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                      </span>
                      <span className="md:hidden">Wallet</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {userRole && `Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDisconnect}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={handleConnect} className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Connect Wallet</span>
                </Button>
              )}
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center">
                        <Hexagon className="h-6 w-6 text-primary mr-2" />
                        <span>GradeChain</span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-6">
                    {filteredNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded ${
                          isActive(item.path) ? 'bg-muted text-primary' : 'text-foreground/60'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </BlockchainModeContext.Provider>
  );
};

export default Header;
