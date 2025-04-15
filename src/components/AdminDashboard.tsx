
import React, { useState } from 'react';
import { addTeacher } from '@/utils/web3Utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BadgeCheck, UserPlus, AlertTriangle, Users, User } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import ContractDeployment from './ContractDeployment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Demo teacher data
const TEACHERS = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    walletAddress: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    department: 'Computer Science',
    yearsOfExperience: 8,
    qualification: 'Ph.D in Computer Science',
    email: 'sarah.johnson@university.edu',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    walletAddress: '0x397a5902c9A1D8a885B909329a66AA2cc096cCee',
    department: 'Mathematics',
    yearsOfExperience: 12,
    qualification: 'Ph.D in Applied Mathematics',
    email: 'michael.chen@university.edu',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg'
  }
];

const AdminDashboard: React.FC = () => {
  const [teacherAddress, setTeacherAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [teachersList, setTeachersList] = useState(TEACHERS);
  const { toast } = useToast();

  const handleAddTeacher = async () => {
    if (!teacherAddress || !teacherAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address",
      });
      return;
    }

    setIsAdding(true);
    try {
      const success = await addTeacher(teacherAddress);
      if (success) {
        // Generate a random teacher name
        const firstNames = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Quinn'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
        const randomName = `Dr. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        
        // Add the new teacher to our list
        const newTeacher = {
          id: teachersList.length + 1,
          name: randomName,
          walletAddress: teacherAddress,
          department: 'New Department',
          yearsOfExperience: Math.floor(Math.random() * 10) + 1,
          qualification: 'Ph.D',
          email: `${randomName.toLowerCase().replace(' ', '.')}@university.edu`,
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 70)}.jpg`
        };
        
        setTeachersList([...teachersList, newTeacher]);
        
        toast({
          title: "Teacher Added",
          description: (
            <div className="flex items-center">
              <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
              <span>Added {teacherAddress.substring(0, 6)}...{teacherAddress.substring(teacherAddress.length - 4)} as a teacher</span>
            </div>
          ),
        });
        setTeacherAddress('');
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add Teacher",
          description: (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>There was an error adding the teacher. Please try again.</span>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage teachers and system settings for the GradeChain platform.
        </p>
      </div>

      <ContractDeployment />

      <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <UserPlus className="mr-2 h-5 w-5 text-primary" />
          Add Teacher
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add a new teacher by their Ethereum wallet address. They will be able to upload and manage student results.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Teacher wallet address (0x...)"
            value={teacherAddress}
            onChange={(e) => setTeacherAddress(e.target.value)}
            className="flex-grow"
          />
          <Button 
            onClick={handleAddTeacher} 
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add Teacher'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="mb-8">
        <TabsList className="w-full">
          <TabsTrigger value="list" className="flex items-center gap-2 flex-1">
            <Users className="h-4 w-4" />
            Teacher List
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2 flex-1">
            <User className="h-4 w-4" />
            Teacher Profiles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Registered Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of teachers with blockchain access</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachersList.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {teacher.walletAddress.substring(0, 6)}...{teacher.walletAddress.substring(teacher.walletAddress.length - 4)}
                      </TableCell>
                      <TableCell>{teacher.department}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profiles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachersList.map((teacher) => (
              <Card key={teacher.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                  <div className="absolute -bottom-12 left-6">
                    <div className="h-24 w-24 rounded-full border-4 border-background bg-background overflow-hidden">
                      <img 
                        src={teacher.avatar} 
                        alt={teacher.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16">
                  <h3 className="text-xl font-semibold">{teacher.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{teacher.department}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Experience:</span>
                      <span className="col-span-2">{teacher.yearsOfExperience} years</span>
                    </div>
                    
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Qualification:</span>
                      <span className="col-span-2">{teacher.qualification}</span>
                    </div>
                    
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="col-span-2">{teacher.email}</span>
                    </div>
                    
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span className="col-span-2 font-mono text-xs break-all">
                        {teacher.walletAddress}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="font-semibold mb-2">Demo Mode Notice</h2>
        <p className="text-sm text-muted-foreground">
          This is running in demo mode without a live blockchain connection. In a production environment, 
          teacher roles would be stored on-chain and managed by smart contracts.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
