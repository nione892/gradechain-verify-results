
import React from 'react';
import { Blocks, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Blocks className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              GradeChain © {new Date().getFullYear()}
            </p>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-destructive" />
            <span>on Polygon</span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-muted-foreground">
              Powered by Ethereum, IPFS, and Web3 Technologies
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
