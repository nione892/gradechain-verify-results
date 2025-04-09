
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { deployContract, getContractAddress, saveContractAddress } from '@/utils/contractDeployer';
import { useToast } from '@/hooks/use-toast';
import { CodeIcon, Share2, CheckCircle, AlertTriangle } from 'lucide-react';

const ContractDeployment: React.FC = () => {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedAddress = getContractAddress();
    if (savedAddress) {
      setContractAddress(savedAddress);
    }
  }, []);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const address = await deployContract();
      if (address) {
        setContractAddress(address);
        saveContractAddress(address);
        toast({
          title: "Contract Deployed",
          description: (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>GradeChain contract deployed successfully!</span>
            </div>
          )
        });
      } else {
        toast({
          variant: "destructive",
          title: "Deployment Failed",
          description: (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Failed to deploy the contract. Please try again.</span>
            </div>
          )
        });
      }
    } catch (error) {
      console.error("Error during deployment:", error);
      toast({
        variant: "destructive",
        title: "Deployment Error",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Contract address has been copied to your clipboard",
      });
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CodeIcon className="mr-2 h-5 w-5 text-primary" />
        Smart Contract Deployment
      </h2>
      
      {contractAddress ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Your GradeChain smart contract has been deployed to the following address:
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-muted p-2 rounded-md flex-1 font-mono text-sm truncate">
              {contractAddress}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(contractAddress)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            This address is being used for all blockchain interactions in the GradeChain application.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Deploy the GradeChain smart contract to the blockchain to enable result verification and teacher management.
          </p>
          
          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Smart Contract'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContractDeployment;
