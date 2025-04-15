
import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { deployContract, getContractAddress, saveContractAddress } from '@/utils/contractDeployer';
import { useToast } from '@/hooks/use-toast';
import { CodeIcon, Share2, CheckCircle, AlertTriangle, Shield, Upload } from 'lucide-react';
import { BlockchainModeContext } from './Header';

const ContractDeployment: React.FC = () => {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const { toast } = useToast();
  const { isRealBlockchainMode } = useContext(BlockchainModeContext);

  useEffect(() => {
    const savedAddress = getContractAddress();
    if (savedAddress) {
      setContractAddress(savedAddress);
    }
  }, []);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      if (!isRealBlockchainMode) {
        toast({
          variant: "warning",
          title: "Testing Mode Active",
          description: "Please toggle to Deploy Mode in the header to deploy real contracts to the blockchain.",
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For testing mode, we use a fake contract address
        const fakeAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        setContractAddress(fakeAddress);
        saveContractAddress(fakeAddress);
        
        toast({
          title: "Test Contract Deployed",
          description: (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-yellow-500 mr-2" />
              <span>Test contract created (no blockchain transaction)</span>
            </div>
          )
        });
      } else {
        // Real blockchain deployment
        const address = await deployContract();
        if (address) {
          setContractAddress(address);
          saveContractAddress(address);
          toast({
            title: "Contract Deployed",
            description: (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>GradeChain contract deployed successfully to the blockchain!</span>
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

  // Blockchain operation status message based on mode
  const getStatusMessage = () => {
    if (contractAddress) {
      return isRealBlockchainMode
        ? "Your contract is deployed to the blockchain and active."
        : "Using a simulated contract (Testing Mode active)";
    }
    
    return isRealBlockchainMode
      ? "Deploy your contract to the blockchain to enable verification."
      : "Create a simulated contract for testing without blockchain transactions.";
  };

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CodeIcon className="mr-2 h-5 w-5 text-primary" />
        Smart Contract Deployment
      </h2>
      
      <div className={`p-2 rounded-md mb-4 text-sm ${isRealBlockchainMode ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          <span>
            {isRealBlockchainMode 
              ? "Blockchain Deployment Mode: Transactions will be sent to the blockchain network" 
              : "Testing Mode: No actual blockchain transactions will occur"}
          </span>
        </div>
      </div>
      
      {contractAddress ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {getStatusMessage()}
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
          
          {isRealBlockchainMode ? (
            <div className="flex items-center mt-4">
              <Upload className="h-4 w-4 text-green-600 mr-2" />
              <p className="text-xs text-green-600">
                Results and certificates uploaded through this contract will be permanently stored on the blockchain.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Switch to Deploy Mode in the header to deploy a real contract and make permanent blockchain transactions.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {getStatusMessage()}
          </p>
          
          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying}
            className={isRealBlockchainMode ? "bg-primary" : "bg-yellow-600 hover:bg-yellow-700"}
          >
            {isDeploying ? 'Deploying...' : isRealBlockchainMode ? 'Deploy Smart Contract' : 'Create Test Contract'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContractDeployment;
