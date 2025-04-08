
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Clock,
  Shield,
  Copy
} from 'lucide-react';
import { ResultData } from '@/utils/demoData';
import { useToast } from '@/components/ui/use-toast';
import { verifyResultHash } from '@/utils/web3Utils';

interface ResultCardProps {
  result: ResultData;
  onClose: () => void;
}

enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClose }) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.PENDING);
  const [isVerifying, setIsVerifying] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verify the result when the component mounts
    verifyResult();
  }, [result.id]);

  const verifyResult = async () => {
    setIsVerifying(true);
    try {
      const verificationResult = await verifyResultHash(result.id);
      
      if (verificationResult.isVerified) {
        setVerificationStatus(VerificationStatus.VERIFIED);
      } else {
        setVerificationStatus(VerificationStatus.FAILED);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus(VerificationStatus.FAILED);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard`,
      });
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  const renderVerificationBadge = () => {
    switch (verificationStatus) {
      case VerificationStatus.VERIFIED:
        return (
          <div className="verification-badge verification-badge-verified">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Verified on Blockchain</span>
          </div>
        );
      case VerificationStatus.FAILED:
        return (
          <div className="verification-badge verification-badge-failed">
            <XCircle className="h-4 w-4 mr-1" />
            <span>Verification Failed</span>
          </div>
        );
      case VerificationStatus.PENDING:
      default:
        return (
          <div className="verification-badge verification-badge-pending">
            <Clock className="h-4 w-4 mr-1 animate-pulse" />
            <span>Verification Pending</span>
          </div>
        );
    }
  };

  const getTotalCredits = () => {
    return result.courses.reduce((total, course) => total + course.credits, 0);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Result {result.id}</CardTitle>
            <p className="text-muted-foreground mt-1">
              Issued on {result.issueDate} | {result.semester}, {result.academicYear}
            </p>
          </div>
          <div>{renderVerificationBadge()}</div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Student Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {result.student.name}</p>
              <p><span className="font-medium">Roll Number:</span> {result.student.roll}</p>
              <p><span className="font-medium">Program:</span> {result.student.program}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Verification Information</h3>
            <div className="space-y-1 text-sm">
              <p className="flex items-center">
                <span className="font-medium mr-1">Verification Hash:</span>
                <span className="text-xs truncate max-w-[200px]">{result.verificationHash}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-1"
                  onClick={() => copyToClipboard(result.verificationHash, 'Verification hash')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </p>
              {result.ipfsHash && (
                <p className="flex items-center">
                  <span className="font-medium mr-1">IPFS Hash:</span>
                  <span className="text-xs truncate max-w-[200px]">{result.ipfsHash}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(result.ipfsHash!, 'IPFS hash')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </p>
              )}
              <p>
                <span className="font-medium">GPA:</span> {result.gpa.toFixed(2)} / 4.0
              </p>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium text-lg mb-4">Course Results</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Marks</TableHead>
              <TableHead className="text-right">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.courses.map((course, index) => {
              const grade = result.grades.find(g => g.courseId === course.id);
              return (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell className="text-right">{course.credits}</TableCell>
                  <TableCell className="text-right">{grade?.marks || 'N/A'}</TableCell>
                  <TableCell className="text-right font-medium">{grade?.grade || 'N/A'}</TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={2} className="text-right font-medium">Total:</TableCell>
              <TableCell className="text-right font-medium">{getTotalCredits()}</TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center mt-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <Shield className="h-4 w-4 mr-1" />
          <span>Secured by Blockchain Technology</span>
        </div>
        
        <div className="space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.open(`https://ipfs.io/ipfs/${result.ipfsHash}`, '_blank')}
            disabled={!result.ipfsHash}
          >
            <FileText className="h-4 w-4" />
            <span>View on IPFS</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <Button onClick={onClose}>Close</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResultCard;
