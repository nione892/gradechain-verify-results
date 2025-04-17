
import React, { createContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Hexagon, LogOut, User, LogIn, GraduationCap, BookOpen } from 'lucide-react';
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { toast } from "@/components/ui/use-toast";

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
  const navigate = useNavigate();
  
  // Always true for blockchain mode
  const toggleBlockchainMode = () => {
    setIsRealBlockchainMode(true);
  };
  
  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      const role = getUserRole(address);
      setUserRole(role);
      
      // Redirect based on user role after connection
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else if (role === 'student') {
        navigate('/student');
      }
      
      toast({
        title: "Wallet Connected",
        description: `Connected as ${role || 'user'} with address ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
    }
  };
  
  const handleDisconnect = () => {
    setWalletAddress(null);
    setUserRole(null);
    navigate('/'); // Redirect to home page after disconnecting
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Check if user has access to a specific section
  const hasAccess = (requiredRole: UserRole | 'any' | 'all'): boolean => {
    if (requiredRole === 'any') return true;
    if (requiredRole === 'all') return userRole === 'admin';
    if (!userRole && requiredRole === null) return true;
    return userRole === requiredRole;
  };
  
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
              
              <div className="hidden md:flex ml-10">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link to="/" className={navigationMenuTriggerStyle()}>
                        Home
                      </Link>
                    </NavigationMenuItem>
                    
                    {/* Admin Section - Only visible to admin */}
                    {hasAccess('admin') && (
                      <NavigationMenuItem>
                        <Link to="/admin" className={navigationMenuTriggerStyle()}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Portal
                        </Link>
                      </NavigationMenuItem>
                    )}
                    
                    {/* Teacher Section - Only visible to teachers and admins */}
                    {(hasAccess('teacher') || hasAccess('admin')) && (
                      <NavigationMenuItem>
                        <Link to="/teacher" className={navigationMenuTriggerStyle()}>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Teacher Portal
                        </Link>
                      </NavigationMenuItem>
                    )}
                    
                    {/* Student Section - Visible to students and admins */}
                    {(hasAccess('student') || hasAccess('admin')) && (
                      <NavigationMenuItem>
                        <Link to="/student" className={navigationMenuTriggerStyle()}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Student Portal
                        </Link>
                      </NavigationMenuItem>
                    )}
                    
                    {/* Verification Section - Visible to all */}
                    <NavigationMenuItem>
                      <Link to="/#verification-form" 
                        className={navigationMenuTriggerStyle()}
                        onClick={(e) => {
                          if (location.pathname === '/') {
                            e.preventDefault();
                            document.querySelector('#verification-form')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        Verify Certificate
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {walletAddress ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      {userRole === 'admin' && <Shield className="h-4 w-4 mr-2" />}
                      {userRole === 'teacher' && <GraduationCap className="h-4 w-4 mr-2" />}
                      {userRole === 'student' && <User className="h-4 w-4 mr-2" />}
                      {!userRole && <User className="h-4 w-4 mr-2" />}
                      <span className="hidden md:inline">
                        {userRole && `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}: `}
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
                    {userRole === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Portal
                      </DropdownMenuItem>
                    )}
                    {(userRole === 'teacher' || userRole === 'admin') && (
                      <DropdownMenuItem onClick={() => navigate('/teacher')}>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Teacher Portal
                      </DropdownMenuItem>
                    )}
                    {(userRole === 'student' || userRole === 'admin') && (
                      <DropdownMenuItem onClick={() => navigate('/student')}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Student Portal
                      </DropdownMenuItem>
                    )}
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
                    <Link
                      to="/"
                      className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded ${
                        isActive('/') ? 'bg-muted text-primary' : 'text-foreground/60'
                      }`}
                    >
                      Home
                    </Link>
                    
                    {/* Mobile: Admin Section - Only visible to admin */}
                    {hasAccess('admin') && (
                      <Link
                        to="/admin"
                        className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded ${
                          isActive('/admin') ? 'bg-muted text-primary' : 'text-foreground/60'
                        }`}
                      >
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Admin Portal</span>
                        </div>
                      </Link>
                    )}
                    
                    {/* Mobile: Teacher Section - Only visible to teachers and admins */}
                    {(hasAccess('teacher') || hasAccess('admin')) && (
                      <Link
                        to="/teacher"
                        className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded ${
                          isActive('/teacher') ? 'bg-muted text-primary' : 'text-foreground/60'
                        }`}
                      >
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          <span>Teacher Portal</span>
                        </div>
                      </Link>
                    )}
                    
                    {/* Mobile: Student Section - Visible to students and admins */}
                    {(hasAccess('student') || hasAccess('admin')) && (
                      <Link
                        to="/student"
                        className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded ${
                          isActive('/student') ? 'bg-muted text-primary' : 'text-foreground/60'
                        }`}
                      >
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>Student Portal</span>
                        </div>
                      </Link>
                    )}
                    
                    {/* Mobile: Verification Section - Visible to all */}
                    <Link
                      to="/#verification-form"
                      className={`text-sm font-medium transition-colors hover:text-primary p-2 rounded text-foreground/60`}
                      onClick={(e) => {
                        if (location.pathname === '/') {
                          e.preventDefault();
                          document.querySelector('#verification-form')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Verify Certificate
                    </Link>
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
