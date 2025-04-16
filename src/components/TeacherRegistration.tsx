
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { registerTeacher } from '@/utils/web3Utils';
import { useToast } from '@/hooks/use-toast';
import { BlockchainModeContext } from '@/components/Header';

const TeacherRegistration: React.FC = () => {
  const [teacherAddress, setTeacherAddress] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredTeachers, setRegisteredTeachers] = useState<{ address: string; name: string }[]>([
    { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', name: 'Sarah Johnson' },
    { address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', name: 'Michael Chen' },
  ]);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherAddress || !teacherName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both wallet address and teacher name",
      });
      return;
    }
    
    setIsRegistering(true);
    
    try {
      const result = await registerTeacher(teacherAddress, teacherName);
      
      if (result.success) {
        toast({
          title: "Teacher Registered",
          description: "Teacher has been successfully registered on the blockchain",
        });
        
        // Add to the list
        setRegisteredTeachers([
          ...registeredTeachers,
          { address: teacherAddress, name: teacherName }
        ]);
        
        // Clear form
        setTeacherAddress('');
        setTeacherName('');
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.message || "Failed to register teacher",
        });
      }
    } catch (error) {
      console.error("Error registering teacher:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "An error occurred while registering the teacher",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-primary" />
            Register New Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherAddress">Teacher Wallet Address</Label>
              <Input
                id="teacherAddress"
                placeholder="0x..."
                value={teacherAddress}
                onChange={(e) => setTeacherAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherName">Teacher Name</Label>
              <Input
                id="teacherName"
                placeholder="Full name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isRegistering} className="w-full">
              {isRegistering ? 'Registering...' : 'Register Teacher'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Registered Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registeredTeachers.length > 0 ? (
            <div className="space-y-3">
              {registeredTeachers.map((teacher, index) => (
                <div key={index} className="flex items-start p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-xs font-mono break-all text-muted-foreground">
                      {teacher.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No teachers registered yet</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
        <p className="flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${isRealBlockchainMode ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
          <span>
            {isRealBlockchainMode 
              ? 'Teachers are being registered on the Sepolia testnet' 
              : 'Teachers are being registered in demo mode (no blockchain transactions)'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TeacherRegistration;
