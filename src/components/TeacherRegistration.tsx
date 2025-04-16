
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { registerTeacher } from '@/utils/web3Utils';
import { BlockchainModeContext } from './Header';

const TeacherRegistration: React.FC = () => {
  const [teacherAddress, setTeacherAddress] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherAddress || !teacherName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both wallet address and name",
      });
      return;
    }
    
    setIsRegistering(true);
    
    try {
      const result = await registerTeacher(teacherAddress, teacherName);
      
      if (result.success) {
        toast({
          title: "Teacher Registered",
          description: isRealBlockchainMode 
            ? `Teacher successfully registered on the blockchain` 
            : "Teacher registered in testing mode",
        });
        
        // Reset form
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
        description: "An unexpected error occurred during registration",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Teacher Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="0x..."
              value={teacherAddress}
              onChange={(e) => setTeacherAddress(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teacher-name">Teacher Name</Label>
            <Input
              id="teacher-name"
              placeholder="Full Name"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isRegistering}
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Register Teacher
              </>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground pt-2 bg-muted/50 p-3 rounded-md">
            <p className="mb-1">
              {isRealBlockchainMode ? 'Blockchain Registration' : 'Testing Mode Registration'}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Teacher will be registered as an authorized result uploader</li>
              <li>Only the teacher's wallet address can upload their assigned results</li>
              <li>Registration requires admin privileges</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherRegistration;
