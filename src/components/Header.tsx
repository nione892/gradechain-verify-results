
import React from 'react';
import { Link } from 'react-router-dom';
import { Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConnectWallet from './ConnectWallet';

const Header: React.FC = () => {
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
          <Link to="/">
            <Button variant="ghost">Verify Results</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">About</Button>
          </Link>
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};

export default Header;
