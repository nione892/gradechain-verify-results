
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Check, GraduationCap, Calendar, User, Book, Award } from 'lucide-react';

interface VerificationSuccessProps {
  hash: string;
  studentName: string;
}

const VerificationSuccess: React.FC<VerificationSuccessProps> = ({ hash, studentName }) => {
  return (
    <Card className="mt-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-300 dark:border-green-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-green-700 dark:text-green-300">
          <Shield className="h-5 w-5 mr-2" />
          <span>Verified on Blockchain</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white dark:bg-green-900/30 p-3 rounded-lg">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-sm font-medium">Verification Hash</p>
              <p className="text-xs font-mono break-all">{hash}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-green-900/30 p-3 rounded-lg">
              <User className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Student</p>
                <p className="text-sm">{studentName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-green-900/30 p-3 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Academic Record</p>
                <p className="text-sm">Verified ✓</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationSuccess;
