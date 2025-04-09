
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Medal, GraduationCap, FileSearch, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResultCard from './ResultCard';
import { ResultData } from '@/utils/demoData';
import { getStudentResultsByWallet } from '@/utils/web3Utils';

const StudentDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadStudentResults = async () => {
      try {
        setLoading(true);
        const studentResults = await getStudentResultsByWallet();
        setResults(studentResults);
      } catch (error) {
        console.error("Error loading student results:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your academic results. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudentResults();
  }, []);

  const handleViewResult = (result: ResultData) => {
    setSelectedResult(result);
  };

  const handleCloseResult = () => {
    setSelectedResult(null);
  };

  if (selectedResult) {
    return <ResultCard result={selectedResult} onClose={handleCloseResult} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Student Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage your academic records stored on the blockchain
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
            <p>Loading your academic records...</p>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>{result.semester}, {result.academicYear}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {result.courses.length} Courses
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Medal className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">GPA: {result.gpa.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Issued: {result.issueDate}
                  </div>
                  
                  <Button 
                    onClick={() => handleViewResult(result)} 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileSearch className="h-4 w-4" />
                    <span>View Full Results</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/40">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any academic results linked to your wallet address.
              </p>
              <div className="text-sm text-muted-foreground max-w-md">
                This could be because:
                <ul className="list-disc text-left pl-6 mt-2">
                  <li>Your institution hasn't uploaded your results yet</li>
                  <li>Your results were uploaded to a different wallet address</li>
                  <li>You're connected to a different wallet than the one registered with your institution</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
