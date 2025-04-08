
import { ethers } from 'ethers';

// Placeholder for actual contract address and ABI
// In production, these would come from your deployed contract
const GRADECHAIN_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
const GRADECHAIN_CONTRACT_ABI = [
  // Simplified ABI for demonstration purposes
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
      }
    ],
    "stateMutability": "view",
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
  }
];

export interface VerificationResult {
  isVerified: boolean;
  timestamp?: number;
  issuer?: string;
  message?: string;
}

export type UserRole = 'admin' | 'teacher' | 'student' | null;

// Demo admin addresses (in a real app, this would be in the contract)
const ADMIN_ADDRESSES = [
  '0x4C61950Ad3C9626B2df9B2BF698ABC2896a67c90'.toLowerCase()
];

// Demo teacher addresses (in a real app, this would be maintained by the contract)
let TEACHER_ADDRESSES = [
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0'.toLowerCase()
];

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
  
  return new ethers.Contract(
    GRADECHAIN_CONTRACT_ADDRESS,
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
    
    // In a real implementation, this would call the smart contract
    // const contract = getContract();
    // const signer = provider.getSigner();
    // const connectedContract = contract.connect(signer);
    // await connectedContract.addTeacher(teacherAddress);
    
    // Demo implementation - add to local array
    TEACHER_ADDRESSES.push(teacherAddress.toLowerCase());
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
    
    // In a real implementation, this would call the smart contract
    // const contract = getContract();
    // const signer = provider.getSigner();
    // const connectedContract = contract.connect(signer);
    // await connectedContract.addResult(studentId, resultHash);
    
    // Demo implementation - just return true
    return true;
  } catch (error) {
    console.error('Error uploading result:', error);
    return false;
  }
};

// For demo purposes, this function will simulate verification
export const verifyResultHash = async (
  resultId: string
): Promise<VerificationResult> => {
  // In the actual implementation, this would call the smart contract
  // const contract = getContract();
  // if (!contract) throw new Error('Contract not available');
  // const isVerified = await contract.verifyResult(ethers.utils.id(resultId));
  
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
};

// Calculate hash from result data (simplified version)
export const calculateResultHash = (resultData: any): string => {
  // In a real implementation, this would use ethers.utils.keccak256 or similar
  // to create a proper hash of the result data
  const dataString = JSON.stringify(resultData);
  return ethers.utils.id(dataString);
};

