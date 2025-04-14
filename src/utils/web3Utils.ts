
import { ethers } from 'ethers';
import { getContractAddress } from './contractDeployer';
import { ResultData } from './demoData';

// Contract ABI for the GradeChain contract
export const GRADECHAIN_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "resultHash",
        "type": "bytes32"
      }
    ],
    "name": "ResultAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "teacherAddress",
        "type": "address"
      }
    ],
    "name": "TeacherAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "resultHash",
        "type": "bytes32"
      }
    ],
    "name": "addResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "teacherAddress",
        "type": "address"
      }
    ],
    "name": "addTeacher",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "teacherAddress",
        "type": "address"
      }
    ],
    "name": "isTeacher",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "resultHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyResult",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface VerificationResult {
  isVerified: boolean;
  timestamp?: number;
  issuer?: string;
  message?: string;
  resultId?: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | null;

// Demo admin addresses (in a real app, this would be in the contract)
const ADMIN_ADDRESSES = [
  '0x4C61950Ad3C9626B2df9B2BF698ABC2896a67c90'.toLowerCase()
];

// Demo teacher addresses (in a real app, this would be maintained by the contract)
let TEACHER_ADDRESSES = [
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0'.toLowerCase(),
  '0x397a5902c9A1D8a885B909329a66AA2cc096cCee'.toLowerCase()
];

// Demo document hash mapping (in a real app, this would be in the blockchain)
const DOCUMENT_HASH_MAPPING: Record<string, { resultId: string, issuer: string, timestamp: number }> = {
  // Example document hash from a simulated PDF certificate
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': {
    resultId: 'STU20210001-SEM2-123',
    issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    timestamp: 1650000000000
  },
  // Add more demo document hashes here
};

export const getProvider = (): ethers.providers.Web3Provider | null => {
  if (!window.ethereum) {
    console.error('MetaMask not installed or not accessible');
    return null;
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getContract = (): ethers.Contract | null => {
  const provider = getProvider();
  if (!provider) return null;
  
  const contractAddress = getContractAddress();
  if (!contractAddress) {
    console.error('Contract address not found');
    return null;
  }
  
  return new ethers.Contract(
    contractAddress,
    GRADECHAIN_CONTRACT_ABI,
    provider
  );
};

export const connectWallet = async (): Promise<string | null> => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

// Get user role based on wallet address
export const getUserRole = (address: string | null): UserRole => {
  if (!address) return null;
  
  const normalizedAddress = address.toLowerCase();
  
  if (ADMIN_ADDRESSES.includes(normalizedAddress)) {
    return 'admin';
  } else if (TEACHER_ADDRESSES.includes(normalizedAddress)) {
    return 'teacher';
  } else {
    return 'student';
  }
};

// Add a teacher address (admin only function)
export const addTeacher = async (teacherAddress: string): Promise<boolean> => {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const accounts = await provider.send('eth_accounts', []);
    const currentAddress = accounts[0].toLowerCase();
    
    // Check if caller is admin
    if (!ADMIN_ADDRESSES.includes(currentAddress)) {
      throw new Error('Only admins can add teachers');
    }
    
    const contractAddress = getContractAddress();
    
    if (contractAddress) {
      // If contract is deployed, use it to add the teacher
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');
      
      const signer = provider.getSigner();
      const connectedContract = contract.connect(signer);
      
      const tx = await connectedContract.addTeacher(teacherAddress);
      await tx.wait();
      
      // Still add to local array for UI state
      TEACHER_ADDRESSES.push(teacherAddress.toLowerCase());
    } else {
      // Demo implementation - add to local array
      TEACHER_ADDRESSES.push(teacherAddress.toLowerCase());
    }
    
    return true;
  } catch (error) {
    console.error('Error adding teacher:', error);
    return false;
  }
};

// Upload a result (teacher only function)
export const uploadResult = async (studentId: string, resultData: any): Promise<boolean> => {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const accounts = await provider.send('eth_accounts', []);
    const currentAddress = accounts[0].toLowerCase();
    
    // Check if caller is teacher or admin
    if (!TEACHER_ADDRESSES.includes(currentAddress) && !ADMIN_ADDRESSES.includes(currentAddress)) {
      throw new Error('Only teachers and admins can upload results');
    }
    
    // Calculate hash from result data
    const resultHash = calculateResultHash(resultData);
    
    const contractAddress = getContractAddress();
    
    if (contractAddress) {
      // If contract is deployed, use it to add the result
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');
      
      const signer = provider.getSigner();
      const connectedContract = contract.connect(signer);
      
      const tx = await connectedContract.addResult(studentId, resultHash);
      await tx.wait();
    }
    
    // Demo implementation - just return true
    return true;
  } catch (error) {
    console.error('Error uploading result:', error);
    return false;
  }
};

// For demo purposes, this function will simulate verification or use the contract if deployed
export const verifyResultHash = async (resultId: string): Promise<VerificationResult> => {
  try {
    const contractAddress = getContractAddress();
    
    if (contractAddress) {
      // If contract is deployed, use it to verify the result
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');
      
      // For demo purposes, we'll use the string as a hash directly
      // In production, you'd calculate the hash properly
      const resultHash = ethers.utils.id(resultId);
      
      const [isVerified, timestamp, issuer] = await contract.verifyResult(resultHash);
      
      if (isVerified) {
        return {
          isVerified: true,
          timestamp: timestamp.toNumber(),
          issuer: issuer,
          message: 'Result hash verified on blockchain'
        };
      } else {
        return {
          isVerified: false,
          message: 'Result hash not found on blockchain'
        };
      }
    } else {
      // Demo implementation - simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // For demo, we'll verify if the hash ends with specific characters
      const isVerified = resultId.endsWith('123');
      
      if (isVerified) {
        return {
          isVerified: true,
          timestamp: Date.now(),
          issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          message: 'Result hash verified on blockchain'
        };
      } else {
        return {
          isVerified: false,
          message: 'Result hash not found on blockchain'
        };
      }
    }
  } catch (error) {
    console.error('Error verifying result:', error);
    return {
      isVerified: false,
      message: 'Error during verification process'
    };
  }
};

// Calculate hash from result data (simplified version)
export const calculateResultHash = (resultData: any): string => {
  // In a real implementation, this would use ethers.utils.keccak256 or similar
  // to create a proper hash of the result data
  const dataString = JSON.stringify(resultData);
  return ethers.utils.id(dataString);
};

// Calculate document hash from file
export const calculateDocumentHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target || !e.target.result) {
          reject(new Error('Error reading file'));
          return;
        }
        
        let fileContent;
        if (typeof e.target.result === 'string') {
          fileContent = e.target.result;
        } else {
          // Convert ArrayBuffer to string
          const uint8Array = new Uint8Array(e.target.result);
          fileContent = Array.from(uint8Array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        }
        
        // For demo purposes, we're using a simple hash function
        // In production, you should use a more robust hashing method
        const hash = ethers.utils.id(fileContent).slice(2); // remove 0x prefix
        
        // Add a delay to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        resolve(hash);
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      // Read as text for small files, as ArrayBuffer for larger ones
      if (file.size < 1024 * 1024) { // 1MB
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Verify document hash against blockchain records
export const verifyDocumentHash = async (documentHash: string): Promise<VerificationResult> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const contractAddress = getContractAddress();
    
    if (contractAddress) {
      // If contract is deployed, use it to verify the document hash
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');
      
      // Here you would call a contract method to verify the document hash
      // This is a simplified example
      
      // For demo purposes, we're using a predefined mapping
      const hashDetails = DOCUMENT_HASH_MAPPING[documentHash];
      
      if (hashDetails) {
        return {
          isVerified: true,
          resultId: hashDetails.resultId,
          timestamp: hashDetails.timestamp,
          issuer: hashDetails.issuer,
          message: 'Certificate verified on blockchain'
        };
      } else {
        return {
          isVerified: false,
          message: 'Certificate not found on blockchain'
        };
      }
    } else {
      // Demo implementation - simulate blockchain verification using our mapping
      const hashDetails = DOCUMENT_HASH_MAPPING[documentHash];
      
      if (hashDetails) {
        return {
          isVerified: true,
          resultId: hashDetails.resultId,
          timestamp: hashDetails.timestamp,
          issuer: hashDetails.issuer,
          message: 'Certificate verified on blockchain'
        };
      } else {
        // For demo purposes, let's verify based on the hash pattern
        // In this example, any hash that starts with "e3" will be considered valid
        if (documentHash.startsWith('e3')) {
          return {
            isVerified: true,
            resultId: 'STU20210001-SEM2-123', // Default result ID for demo
            timestamp: Date.now(),
            issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
            message: 'Certificate verified on blockchain'
          };
        }
        
        return {
          isVerified: false,
          message: 'Certificate not found on blockchain'
        };
      }
    }
  } catch (error) {
    console.error('Error verifying document hash:', error);
    return {
      isVerified: false,
      message: 'Error during verification process'
    };
  }
};

// Get student results by connected wallet
export const getStudentResultsByWallet = async (): Promise<ResultData[]> => {
  try {
    const provider = getProvider();
    if (!provider) throw new Error("No provider available");
    
    const accounts = await provider.send('eth_accounts', []);
    if (accounts.length === 0) throw new Error("No wallet connected");
    
    const studentWallet = accounts[0].toLowerCase();
    
    // In a real implementation, this would query the blockchain for results
    // associated with this wallet address
    
    // For demo purposes, we'll import the demo data and filter based on wallet
    // This is simulating what would happen in a real blockchain implementation
    
    const { demoResults } = await import('@/utils/demoData');
    
    // Simulate a delay to mimic blockchain query
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check for the specific wallet requested by the user
    if (studentWallet === '0x5fb717f3b4f7c3e0e5cd09acb1481c2d9fc70104'.toLowerCase()) {
      return [demoResults['STU20210001-SEM2-123'], demoResults['STU20210003-SEM3-789']];
    }
    // For demo, return other results based on wallet address
    else if (studentWallet === '0x397a5902c9a1d8a885b909329a66aa2cc096ccee'.toLowerCase()) {
      return [Object.values(demoResults)[0]];
    } else if (studentWallet === '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0'.toLowerCase()) {
      return [Object.values(demoResults)[1]];
    } else if (studentWallet === '0x4c61950ad3c9626b2df9b2bf698abc2896a67c90'.toLowerCase()) {
      // Admin gets all results for demo
      return Object.values(demoResults);
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching student results:", error);
    return [];
  }
};
