
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, Medal, GraduationCap, FileSearch, AlertCircle, 
  TrendingUp, TrendingDown, ChevronDown, BarChart3
} from 'lucide-react';
import ResultCard from './ResultCard';
import { ResultData } from '@/utils/demoData';
import { getStudentResultsByWallet } from '@/utils/web3Utils';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { 
  Area, 
  AreaChart,
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';

const StudentDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'monthly' | 'semester' | 'yearly'>('semester');
  const { toast } = useToast();

  useEffect(() => {
    const loadStudentResults = async () => {
      try {
        setLoading(true);
        
        // Get wallet address
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        }
        
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

  // Calculate GPA trend data from results
  const getGpaChartData = () => {
    const sortedResults = [...results].sort((a, b) => 
      new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
    );
    
    return sortedResults.map(result => ({
      name: result.semester,
      gpa: result.gpa,
    }));
  };

  // Calculate course performance data
  const getCoursePerformanceData = () => {
    if (results.length === 0) return [];
    
    // Use the most recent result for the chart
    const latestResult = [...results].sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    )[0];
    
    return latestResult.courses.map(course => {
      const grade = latestResult.grades.find(g => g.courseId === course.id);
      return {
        name: course.code,
        marks: grade?.marks || 0,
        credits: course.credits
      };
    });
  };

  // Format the wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Calculate total credits
  const calculateTotalCredits = () => {
    if (results.length === 0) return 0;
    return results.reduce((total, result) => {
      return total + result.courses.reduce((sum, course) => sum + course.credits, 0);
    }, 0);
  };

  // Calculate average GPA
  const calculateAverageGPA = () => {
    if (results.length === 0) return 0;
    const totalGPA = results.reduce((sum, result) => sum + result.gpa, 0);
    return totalGPA / results.length;
  };

  // Calculate total courses
  const calculateTotalCourses = () => {
    if (results.length === 0) return 0;
    return results.reduce((total, result) => total + result.courses.length, 0);
  };

  // Get comparison with previous period
  const getComparisonData = (current: number, previous: number) => {
    const difference = current - previous;
    const percentChange = previous !== 0 ? (difference / previous) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: difference >= 0
    };
  };

  // Mock data for comparison (in a real app, this would come from the blockchain)
  const comparisonData = {
    gpa: getComparisonData(calculateAverageGPA(), 3.2),
    credits: getComparisonData(calculateTotalCredits(), 18),
    courses: getComparisonData(calculateTotalCourses(), 5),
    results: getComparisonData(results.length, 1)
  };

  if (selectedResult) {
    return <ResultCard result={selectedResult} onClose={handleCloseResult} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-bold mb-2">Academic Performance Dashboard</h1>
        <p className="text-muted-foreground">
          View and analyze your academic records stored on the blockchain
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
        <>
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={`https://avatars.dicebear.com/api/initials/${results[0]?.student.name.replace(/\s+/g, '')}.svg`} alt={results[0]?.student.name} />
                  <AvatarFallback>{results[0]?.student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{results[0]?.student.name}</h2>
                  <p className="text-muted-foreground text-sm flex items-center">
                    {formatAddress(walletAddress)}
                    <span className="inline-flex items-center ml-3 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                      Connected
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="text-muted-foreground text-sm mr-2">Sort by:</div>
              <select 
                className="bg-background border rounded-md px-3 py-1.5 text-sm"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
              >
                <option value="semester">Semester</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`flex items-center ${comparisonData.gpa.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {comparisonData.gpa.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    <span className="text-xs font-medium">{comparisonData.gpa.value}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Current GPA</h3>
                  <div className="text-2xl font-bold">{calculateAverageGPA().toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">vs. previous semester</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Book className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className={`flex items-center ${comparisonData.courses.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {comparisonData.courses.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    <span className="text-xs font-medium">{comparisonData.courses.value}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Courses</h3>
                  <div className="text-2xl font-bold">{calculateTotalCourses()}</div>
                  <p className="text-xs text-muted-foreground">vs. previous semester</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Medal className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className={`flex items-center ${comparisonData.credits.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {comparisonData.credits.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    <span className="text-xs font-medium">{comparisonData.credits.value}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Credits</h3>
                  <div className="text-2xl font-bold">{calculateTotalCredits()}</div>
                  <p className="text-xs text-muted-foreground">vs. previous semester</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileSearch className="h-5 w-5 text-green-500" />
                  </div>
                  <div className={`flex items-center ${comparisonData.results.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {comparisonData.results.isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    <span className="text-xs font-medium">{comparisonData.results.value}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Result Records</h3>
                  <div className="text-2xl font-bold">{results.length}</div>
                  <p className="text-xs text-muted-foreground">vs. previous semester</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>GPA Trend</CardTitle>
                <CardDescription>Your GPA performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={{ 
                    gpa: { color: "#8B5CF6" },
                    point: { color: "#4C1D95" }
                  }}>
                    <LineChart data={getGpaChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                      <YAxis domain={[0, 4]} className="text-xs text-muted-foreground" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="gpa" 
                        stroke="var(--color-gpa)" 
                        strokeWidth={2}
                        activeDot={{ r: 6, fill: "var(--color-point)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>
                  {results.length > 0 ? 
                    `Showing latest semester (${results[0].semester})` : 
                    'No courses data available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={{ 
                    marks: { color: "#8B5CF6" }, 
                    credits: { color: "#E5DEFF" }
                  }}>
                    <BarChart data={getCoursePerformanceData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={60} 
                        className="text-xs text-muted-foreground" 
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="marks" 
                        fill="var(--color-marks)" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          <h2 className="text-xl font-bold mb-4">Academic Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </>
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
