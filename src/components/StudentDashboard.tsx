
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GraduationCap, Download, Check, FileCheck, Shield, ChevronRight, BarChart, PieChart, Calendar, User, LineChart } from "lucide-react";
import { getStudentResultsByWallet } from '@/utils/web3Utils';
import { getResultById, ResultData as FullResultData } from '@/utils/demoData';
import ResultCard from './ResultCard';
import { BlockchainModeContext } from './Header';
import { Progress } from "@/components/ui/progress";

// Define a simplified ResultData interface for use in the StudentDashboard
interface SimpleResultData {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  grade: string;
  date: string;
  verified: boolean;
}

const StudentDashboard: React.FC = () => {
  const [studentResults, setStudentResults] = useState<SimpleResultData[]>([]);
  const [selectedResult, setSelectedResult] = useState<FullResultData | null>(null);
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
          const results: SimpleResultData[] = resultIds.map(id => {
            const result = getResultById(id);
            return {
              id,
              studentId: result?.student?.id || "S-12345",
              studentName: "Manvith", // Always set to Manvith for the demo
              course: result?.courses?.[0]?.name || "Computer Science",
              grade: result?.grades?.[0]?.grade || "A",
              date: result?.issueDate || new Date().toLocaleDateString(),
              verified: true
            };
          });
          
          // If no results, add sample results for demo
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
          
          // Set the first result as selected for detailed view
          if (results.length > 0) {
            const fullResult = getResultById(results[0].id);
            if (fullResult) {
              setSelectedResult(fullResult);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);

  const handleResultSelect = (id: string) => {
    const fullResult = getResultById(id);
    if (fullResult) {
      setSelectedResult(fullResult);
    }
  };

  // Calculate GPA and other stats
  const calculateStats = () => {
    if (!selectedResult) return null;
    
    const totalCourses = selectedResult.courses.length;
    const passedCourses = selectedResult.grades.filter(g => 
      g.grade === 'A' || g.grade === 'A+' || g.grade === 'A-' || 
      g.grade === 'B' || g.grade === 'B+' || g.grade === 'B-'
    ).length;
    
    const passRate = totalCourses > 0 ? (passedCourses / totalCourses) * 100 : 0;
    
    return {
      totalCourses,
      passedCourses,
      passRate: passRate.toFixed(2),
      gpa: selectedResult.gpa.toFixed(2)
    };
  };

  const stats = calculateStats();

  // Subject performance calculation
  const getSubjectPerformance = () => {
    if (!selectedResult) return [];
    
    return selectedResult.courses.map((course, index) => {
      const grade = selectedResult.grades.find(g => g.courseId === course.id);
      const score = grade ? convertGradeToPercentage(grade.grade) : 0;
      
      return {
        name: course.name,
        score,
        color: score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
      };
    });
  };

  const convertGradeToPercentage = (grade: string) => {
    switch(grade) {
      case 'A+': return 95;
      case 'A': return 90;
      case 'A-': return 85;
      case 'B+': return 80;
      case 'B': return 75;
      case 'B-': return 70;
      case 'C+': return 65;
      case 'C': return 60;
      case 'C-': return 55;
      case 'D': return 50;
      case 'F': return 40;
      default: return 75; // Default for other grade formats
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <Card className="shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <GraduationCap className="mr-2 h-6 w-6 text-primary" />
            Manvith's Academic Dashboard
          </CardTitle>
          <CardDescription>
            View your verified academic records and performance metrics
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.gpa || '0.0'}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {selectedResult?.grades[0]?.grade || 'A'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.passRate || '91.32'}%</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="results" className="flex items-center w-1/2">
                <FileText className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center w-1/2">
                <FileCheck className="h-4 w-4 mr-2" />
                Certificates
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">My Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading results...</p>
                  ) : studentResults.length > 0 ? (
                    <div className="space-y-2">
                      {studentResults.map((result) => (
                        <div 
                          key={result.id}
                          onClick={() => handleResultSelect(result.id)}
                          className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                            selectedResult?.id === result.id 
                              ? 'bg-primary/10 border-primary/30' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div>
                            <h3 className="font-medium">{result.course}</h3>
                            <p className="text-sm text-muted-foreground">{result.date}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`font-bold mr-2 ${
                              result.grade === 'A+' || result.grade === 'A' ? 'text-green-600' :
                              result.grade === 'B+' || result.grade === 'B' ? 'text-blue-600' :
                              'text-amber-600'
                            }`}>
                              {result.grade}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <p>No results found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">My Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No certificates available yet.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Faculty Ratio Card */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Faculty To Student Ratio</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">1</div>
                  <div className="text-sm text-muted-foreground">Faculty</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Syllabus Coverage Card */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Syllabus Coverage</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <div className="absolute inset-0">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="10"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="45" 
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold">88.1%</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedResult ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Student Performance By Subject</span>
                    <Button variant="ghost" size="icon">
                      <LineChart className="h-5 w-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSubjectPerformance().map((subject, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{subject.name}</span>
                          <span>{subject.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${subject.color}`} 
                            style={{ width: `${subject.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Student Information</h3>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">Name:</span> {selectedResult.student.name}</p>
                          <p className="text-sm"><span className="font-medium">ID:</span> {selectedResult.student.id}</p>
                          <p className="text-sm"><span className="font-medium">Program:</span> {selectedResult.student.program}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Academic Information</h3>
                        <div className="space-y-1">
                          <p className="text-sm"><span className="font-medium">Semester:</span> {selectedResult.semester}</p>
                          <p className="text-sm"><span className="font-medium">Academic Year:</span> {selectedResult.academicYear}</p>
                          <p className="text-sm"><span className="font-medium">Issue Date:</span> {selectedResult.issueDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Course Grades</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Course</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Credits</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedResult.courses.map((course, index) => {
                              const grade = selectedResult.grades.find(g => g.courseId === course.id);
                              return (
                                <tr key={course.id}>
                                  <td className="px-4 py-2 text-sm text-gray-900">{course.name}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{course.code}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900">{course.credits}</td>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      grade?.grade === 'A+' || grade?.grade === 'A' ? 'bg-green-100 text-green-800' :
                                      grade?.grade === 'B+' || grade?.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                      'bg-amber-100 text-amber-800'
                                    }`}>
                                      {grade?.grade || 'N/A'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 mr-1" />
                        <span>Verified on Blockchain</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => window.open(`/student?verify=${selectedResult.verificationHash}`, '_blank')}
                      >
                        <span>Share Results</span>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <p>Select a result to view detailed information</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
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
