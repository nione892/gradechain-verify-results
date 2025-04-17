
// Define the UserRole type
export type UserRole = 'admin' | 'teacher' | 'student' | null;

// Updated contract ABI based on the provided GradeChain contract
export const GRADECHAIN_CONTRACT_ABI = [
  "function addTeacher(address teacherAddress) public",
  "function removeTeacher(address teacherAddress) public",
  "function isTeacher(address teacherAddress) public view returns (bool)",
  "function addResult(string studentId, bytes32 resultHash) public",
  "function verifyResult(bytes32 resultHash) public view returns (bool, uint256, address)",
  "function uploadDocument(string documentId, bytes32 documentHash) public",
  "function verifyDocument(bytes32 documentHash) public view returns (bool, uint256, address)"
];

// Get user role based on wallet address
export const getUserRole = (address: string): UserRole => {
  // For blockchain implementation, this would query the contract
  const lastChar = address.charAt(address.length - 1).toLowerCase();
  
  if (lastChar === 'a' || lastChar === 'b' || lastChar === 'c') {
    return 'admin';
  } else if (lastChar === 'd' || lastChar === 'e' || lastChar === 'f') {
    return 'teacher';
  } else if (lastChar >= '0' && lastChar <= '9') {
    return 'student';
  }
  
  return null;
};

// Connect to wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } else {
      console.log("No Ethereum provider detected");
      return null;
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    return null;
  }
};

// Register teacher
export const registerTeacher = async (address: string, name: string) => {
  try {
    console.log(`Registering teacher: ${name} with address ${address}`);
    
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        return { success: false, message: "No wallet connected" };
      }
      
      // In a real implementation, this would call the smart contract's addTeacher function
      return { success: true, message: "Teacher registered successfully" };
    } else {
      console.log("No Ethereum provider detected");
      return { success: false, message: "No Ethereum provider detected" };
    }
  } catch (error) {
    console.error("Error registering teacher:", error);
    return { success: false, message: "Error registering teacher" };
  }
};

// Calculate result hash
export const calculateResultHash = (resultData: any): string => {
  // In a real implementation, this would use a cryptographic hash function
  const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return mockHash;
};

// Calculate document hash
export const calculateDocumentHash = async (file: File): Promise<string> => {
  // In a real implementation, this would compute the SHA-256 hash of the file
  const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return mockHash;
};

// Upload result to blockchain
export const uploadResult = async (resultId: string, resultData: any): Promise<{success: boolean; message: string}> => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        return { success: false, message: "No wallet connected" };
      }
      
      // In a real implementation, this would call the smart contract's addResult function
      console.log(`Uploading result: ${resultId} with data`, resultData);
      
      return { success: true, message: "Result uploaded to blockchain" };
    } else {
      return { success: false, message: "No Ethereum provider detected" };
    }
  } catch (error) {
    console.error("Error uploading result:", error);
    return { success: false, message: "Error uploading result" };
  }
};

// Upload document to blockchain
export const uploadDocument = async (documentId: string, documentHash: string): Promise<{success: boolean; message: string}> => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        return { success: false, message: "No wallet connected" };
      }
      
      // In a real implementation, this would call the smart contract's uploadDocument function
      console.log(`Uploading document: ${documentId} with hash ${documentHash}`);
      
      return { success: true, message: "Document uploaded to blockchain" };
    } else {
      return { success: false, message: "No Ethereum provider detected" };
    }
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false, message: "Error uploading document" };
  }
};

// Verify result hash
export const verifyResultHash = async (hash: string): Promise<{isVerified: boolean; resultId?: string; message?: string; studentName?: string}> => {
  try {
    console.log(`Verifying result hash: ${hash}`);
    
    // In a blockchain implementation, this would verify the hash on the blockchain using verifyResult
    // For now, we'll just return a basic implementation
    return { 
      isVerified: true,
      resultId: hash.substring(0, 8),
      studentName: "Student"
    };
  } catch (error) {
    console.error("Error verifying result:", error);
    return { isVerified: false, message: "Error verifying result" };
  }
};

// Verify document hash
export const verifyDocumentHash = async (hash: string): Promise<{isVerified: boolean; documentId?: string; message?: string}> => {
  try {
    console.log(`Verifying document hash: ${hash}`);
    
    // In a blockchain implementation, this would verify the document hash on the blockchain using verifyDocument
    return { 
      isVerified: true,
      documentId: "DOC-ID"
    };
  } catch (error) {
    console.error("Error verifying document:", error);
    return { isVerified: false, message: "Error verifying document" };
  }
};

// Process verification URL
export const processVerificationUrl = (url: string): string | null => {
  try {
    // Check if the URL contains a verification parameter
    if (url.includes('verify=')) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('verify');
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Get student results by wallet
export const getStudentResultsByWallet = async (address?: string): Promise<string[]> => {
  // In a real implementation, this would query the blockchain for results associated with this wallet
  console.log(`Getting results for student wallet: ${address || "current wallet"}`);
  
  // Return empty array as we don't have demo data anymore
  return [];
};

// Remove teacher
export const removeTeacher = async (address: string): Promise<{success: boolean; message: string}> => {
  try {
    console.log(`Removing teacher with address ${address}`);
    
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        return { success: false, message: "No wallet connected" };
      }
      
      // In a real implementation, this would call the smart contract's removeTeacher function
      return { success: true, message: "Teacher removed successfully" };
    } else {
      console.log("No Ethereum provider detected");
      return { success: false, message: "No Ethereum provider detected" };
    }
  } catch (error) {
    console.error("Error removing teacher:", error);
    return { success: false, message: "Error removing teacher" };
  }
};
