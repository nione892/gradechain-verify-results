import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GraduationCap, Download, Check, FileCheck, Shield } from "lucide-react";
import { getStudentResultsByWallet } from '@/utils/web3Utils';
import { getResultById } from '@/utils/demoData';
import ResultCard from './ResultCard';
import { BlockchainModeContext } from './Header';

export interface ResultData {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  grade: string;
  date: string;
  verified: boolean;
}

const StudentDashboard: React.FC = () => {
  const [studentResults, setStudentResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const resultIds = await getStudentResultsByWallet(accounts[0]);
          
          // Transform resultIds into ResultData objects
          const results: ResultData[] = resultIds.map(id => {
            const result = getResultById(id);
            return {
              id,
              studentId: result?.studentId || "S-12345",
              studentName: "Manvith", // Always set to Manvith for the demo
              course: result?.course || "Computer Science",
              grade: result?.grade || "A",
              date: result?.date || new Date().toLocaleDateString(),
              verified: true
            };
          });
          
          // If no results, add a sample result for demo
          if (results.length === 0) {
            results.push({
              id: "RESULT-1001",
              studentId: "S-12345",
              studentName: "Manvith",
              course: "Computer Science 101",
              grade: "A+",
              date: new Date().toLocaleDateString(),
              verified: true
            });
            
            results.push({
              id: "RESULT-1002",
              studentId: "S-12345",
              studentName: "Manvith",
              course: "Introduction to Blockchain",
              grade: "A",
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              verified: true
            });
          }
          
          setStudentResults(results);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-primary" />
            My Academic Results
          </CardTitle>
          <CardDescription>
            View your verified academic records stored on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList>
              <TabsTrigger value="results" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center">
                <FileCheck className="h-4 w-4 mr-2" />
                Certificates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              {loading ? (
                <p>Loading results...</p>
              ) : studentResults.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {studentResults.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <p>No results found.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="certificates">
              <div className="text-center p-4 text-muted-foreground">
                <p>No certificates available yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="bg-muted/50 p-4 rounded-lg mt-6">
        <h3 className="text-sm font-medium">
          {isRealBlockchainMode ? 'Blockchain Mode' : 'Testing Mode'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isRealBlockchainMode
            ? 'Results are being fetched from the Sepolia testnet.'
            : 'This is a demo mode. Results are simulated.'}
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
