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

// Demo roll number to result ID mapping
const ROLL_NUMBER_TO_RESULT_ID: Record<string, string> = {
  '43825': 'JNU-PGDOM-43825',
  '142071': 'KSOU-MBA-142071',
  '56789': 'BHU-CSE-56789',
  'STU20210001': 'STU20210001-SEM2-123',
  'STU20210002': 'STU20210002-SEM1-456',
  'STU20210003': 'STU20210003-SEM3-789'
};

// Demo document hash mapping (in a real app, this would be in the blockchain)
const DOCUMENT_HASH_MAPPING: Record<string, { resultId: string, issuer: string, timestamp: number }> = {
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855': {
    resultId: 'STU20210001-SEM2-123',
    issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    timestamp: 1650000000000
  },
  '7c5ea36004851c664b3e3b0dae9d71b4e0069fa7a8d24c6f0d0748f5c4c947d1': {
    resultId: 'JNU-PGDOM-43825',
    issuer: '0x397a5902c9A1D8a885B909329a66AA2cc096cCee',
    timestamp: 1711641600000
  },
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2': {
    resultId: 'JNU-PGDOM-43825',
    issuer: '0x397a5902c9A1D8a885B909329a66AA2cc096cCee',
    timestamp: 1711641600000
  },
  'be3a9d254ed7b5e3666268529cf5e3158f617a8c1d96665f66a6f4a55386edd4': {
    resultId: 'BHU-CSE-56789',
    issuer: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    timestamp: 1705305600000
  },
  'f23a9d254ed7b5e3666268529cf5e3158f617a8c1d96665f66a6f4a55386edd4': {
    resultId: 'KSOU-MBA-142071',
    issuer: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    timestamp: 1713110400000
  }
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

// Upload a result to blockchain (teacher/admin function)
export const uploadResultToBlockchain = async (studentId: string, resultData: any, isRealBlockchainMode: boolean): Promise<boolean> => {
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
    
    if (isRealBlockchainMode) {
      // Use the contract in real blockchain mode
      const contractAddress = getContractAddress();
      
      if (contractAddress) {
        const contract = getContract();
        if (!contract) throw new Error('Contract not available');
        
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);
        
        console.log('Adding result to blockchain...');
        console.log('Student ID:', studentId);
        console.log('Result Hash:', resultHash);
        
        // Call the smart contract to add the result
        const tx = await connectedContract.addResult(studentId, resultHash);
        console.log('Transaction submitted:', tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        
        return true;
      } else {
        throw new Error('No contract deployed. Please deploy a contract first.');
      }
    } else {
      // Simulate blockchain interaction in testing mode
      console.log("Simulating blockchain transaction for student:", studentId);
      console.log("Result hash (simulated):", resultHash);
      
      // In testing mode, we just return success
      return true;
    }
  } catch (error) {
    console.error('Error uploading result to blockchain:', error);
    return false;
  }
};

// Upload certificate to blockchain
export const uploadCertificateToBlockchain = async (fileHash: string, studentId: string, isRealBlockchainMode: boolean): Promise<boolean> => {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const accounts = await provider.send('eth_accounts', []);
    const currentAddress = accounts[0].toLowerCase();
    
    // Check if caller is teacher or admin
    if (!TEACHER_ADDRESSES.includes(currentAddress) && !ADMIN_ADDRESSES.includes(currentAddress)) {
      throw new Error('Only teachers and admins can upload certificates');
    }
    
    if (isRealBlockchainMode) {
      // Use the contract in real blockchain mode
      const contractAddress = getContractAddress();
      
      if (contractAddress) {
        const contract = getContract();
        if (!contract) throw new Error('Contract not available');
        
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);
        
        console.log('Adding certificate to blockchain...');
        console.log('Student ID:', studentId);
        console.log('File Hash:', fileHash);
        
        // Use the fileHash as the resultHash for certificate verification
        const tx = await connectedContract.addResult(studentId, fileHash);
        console.log('Transaction submitted:', tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        
        return true;
      } else {
        throw new Error('No contract deployed. Please deploy a contract first.');
      }
    } else {
      // Simulate blockchain interaction in testing mode
      console.log("Simulating blockchain transaction for certificate:", fileHash);
      console.log("Student ID (simulated):", studentId);
      
      // In testing mode, we just return success
      return true;
    }
  } catch (error) {
    console.error('Error uploading certificate to blockchain:', error);
    return false;
  }
};

// The main uploadResult function that handles both certificate and result uploads
export const uploadResult = async (studentId: string, resultData: any): Promise<boolean> => {
  try {
    // Get blockchain mode from window.localStorage to ensure consistent usage
    const isRealBlockchainMode = localStorage.getItem('blockchainMode') === 'true';
    
    if (resultData.type === 'certificate') {
      // If it's a certificate upload, use the certificate upload function
      return await uploadCertificateToBlockchain(
        calculateResultHash(resultData),
        studentId,
        isRealBlockchainMode
      );
    } else {
      // Otherwise it's a standard result upload
      return await uploadResultToBlockchain(
        studentId,
        resultData,
        isRealBlockchainMode
      );
    }
  } catch (error) {
    console.error('Error in uploadResult:', error);
    return false;
  }
};

// For demo and blockchain verification
export const verifyResultHash = async (resultId: string): Promise<VerificationResult> => {
  try {
    // Get blockchain mode from localStorage
    const isRealBlockchainMode = localStorage.getItem('blockchainMode') === 'true';
    const contractAddress = getContractAddress();
    
    if (contractAddress && isRealBlockchainMode) {
      // If contract is deployed and in real mode, use it to verify the result
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');
      
      console.log('Verifying result on blockchain...');
      console.log('Result ID:', resultId);
      
      // For blockchain verification, we need a bytes32 hash
      // So we first convert the resultId to a hash if needed
      const resultHash = resultId.startsWith('0x') && resultId.length === 66 
        ? resultId 
        : ethers.utils.id(resultId);
      
      console.log('Using hash for verification:', resultHash);
      
      const [isVerified, timestamp, issuer] = await contract.verifyResult(resultHash);
      console.log('Verification result:', { isVerified, timestamp: timestamp.toString(), issuer });
      
      if (isVerified) {
        return {
          isVerified: true,
          timestamp: timestamp.toNumber(),
          issuer: issuer,
          resultId: resultId,
          message: 'Result hash verified on blockchain'
        };
      } else {
        return {
          isVerified: false,
          message: 'Result hash not found on blockchain'
        };
      }
    } else if (!isRealBlockchainMode) {
      // Demo implementation - simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 1000)); // Shorter delay for better UX
      
      // In demo mode, verify based on the resultId patterns we have
      const knownResults = ['STU20210001-SEM2-123', 'JNU-PGDOM-43825', 'KSOU-MBA-142071', 'BHU-CSE-56789'];
      const isVerified = knownResults.includes(resultId);
      
      if (isVerified) {
        return {
          isVerified: true,
          timestamp: Date.now(),
          issuer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          resultId: resultId,
          message: 'Result verified in testing mode'
        };
      } else {
        return {
          isVerified: false,
          message: 'Result not found in testing mode'
        };
      }
    } else {
      return {
        isVerified: false,
        message: 'Contract not deployed. Please deploy the contract first.'
      };
    }
  } catch (error) {
    console.error('Error verifying result:', error);
    return {
      isVerified: false,
      message: 'Error during verification process: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};

// Calculate hash from result data
export const calculateResultHash = (resultData: any): string => {
  // Convert resultData to a consistent string representation
  const dataString = JSON.stringify(resultData);
  // Use keccak256 to get a proper Ethereum-compatible hash
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dataString));
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
        let fileHash;

        if (typeof e.target.result === 'string') {
          fileContent = e.target.result;
        } else {
          // Convert ArrayBuffer to string
          const uint8Array = new Uint8Array(e.target.result);
          fileContent = Array.from(uint8Array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        }

        // In testing mode, use predefined hashes for demo files
        const isRealBlockchainMode = localStorage.getItem('blockchainMode') === 'true';
        
        if (!isRealBlockchainMode) {
          // Extract roll number patterns from file name and content
          const rollPatterns = [
            // ... keep existing code (roll patterns for demo mode)
          ];
          
          // Try to match roll number patterns in file name
          for (const { pattern, hash } of rollPatterns) {
            if (pattern.test(file.name) || pattern.test(fileContent)) {
              fileHash = hash;
              await new Promise(resolve => setTimeout(resolve, 1000));
              resolve(fileHash);
              return;
            }
          }
          
          // Additional demo behavior for testing mode
          // ... keep existing code (demo behavior)
        } else {
          // In real blockchain mode, calculate an actual hash of the file content
          console.log('Calculating real document hash...');
          
          // Use keccak256 to generate a blockchain-compatible hash
          fileHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fileContent));
          console.log('Generated document hash:', fileHash);
        }
        
        resolve(fileHash);
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
    // Get blockchain mode from localStorage
    const isRealBlockchainMode = localStorage.getItem('blockchainMode') === 'true';
    
    if (isRealBlockchainMode) {
      // Get contract address
      const contractAddress = getContractAddress();
      
      if (contractAddress) {
        // If contract is deployed, use it to verify the document hash
        const contract = getContract();
        if (!contract) throw new Error('Contract not available');
        
        console.log('Verifying document hash on blockchain:', documentHash);
        
        // For documents, we already have a bytes32 hash
        const resultHash = documentHash.startsWith('0x') && documentHash.length === 66
          ? documentHash
          : '0x' + documentHash; // Add 0x prefix if not present
        
        // Call the smart contract to verify the hash
        const [isVerified, timestamp, issuer] = await contract.verifyResult(resultHash);
        console.log('Blockchain verification result:', { isVerified, timestamp: timestamp.toString(), issuer });
        
        if (isVerified) {
          // If verified, try to map the hash to a known result ID if possible
          let resultId = null;
          for (const [id, details] of Object.entries(DOCUMENT_HASH_MAPPING)) {
            if (id === documentHash || id === documentHash.replace('0x', '')) {
              resultId = details.resultId;
              break;
            }
          }
          
          return {
            isVerified: true,
            timestamp: timestamp.toNumber(),
            issuer: issuer,
            resultId: resultId,
            message: 'Certificate verified on blockchain'
          };
        } else {
          return {
            isVerified: false,
            message: 'Certificate not found on blockchain'
          };
        }
      } else {
        return {
          isVerified: false,
          message: 'Contract not deployed. Please deploy the contract first.'
        };
      }
    } else {
      // In testing mode, use our predefined mapping
      console.log('Verifying document hash in testing mode:', documentHash);
      
      // Strip 0x prefix if present to match our mapping
      const cleanHash = documentHash.startsWith('0x') ? documentHash.slice(2) : documentHash;
      
      // Look up the hash in our demo mapping
      const hashDetails = DOCUMENT_HASH_MAPPING[cleanHash];
      
      if (hashDetails) {
        return {
          isVerified: true,
          timestamp: hashDetails.timestamp,
          issuer: hashDetails.issuer,
          resultId: hashDetails.resultId,
          message: 'Certificate verified in testing mode'
        };
      } else {
        return {
          isVerified: false,
          message: 'Certificate not found in testing mode'
        };
      }
    }
  } catch (error) {
    console.error('Error verifying document hash:', error);
    return {
      isVerified: false,
      message: 'Error during verification: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};

// Process URL or QR code to extract verification hash
export const processVerificationUrl = (url: string): string | null => {
  try {
    // Check if it's already a hash
    if (url.match(/^[0-9a-fA-F]{64}$/) || url.match(/^0x[0-9a-fA-F]{64}$/)) {
      return url;
    }
    
    // Check if it's a URL with verify parameter
    const urlObj = new URL(url);
    if (urlObj.searchParams.has('verify')) {
      return urlObj.searchParams.get('verify');
    }
    
    return null;
  } catch (e) {
    // Not a valid URL, check if it contains a hash pattern
    const hashMatch = url.match(/[0-9a-fA-F]{64}/);
    if (hashMatch) {
      return hashMatch[0];
    }
    return null;
  }
};

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
