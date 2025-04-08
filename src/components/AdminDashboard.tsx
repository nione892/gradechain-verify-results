
import React, { useState } from 'react';
import { addTeacher } from '@/utils/web3Utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BadgeCheck, UserPlus, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [teacherAddress, setTeacherAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
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
        toast({
          title: "Teacher Added",
          description: `Added ${teacherAddress.substring(0, 6)}...${teacherAddress.substring(teacherAddress.length - 4)} as a teacher`,
          icon: <BadgeCheck className="h-4 w-4 text-green-500" />,
        });
        setTeacherAddress('');
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Add Teacher",
          description: "There was an error adding the teacher. Please try again.",
          icon: <AlertTriangle className="h-4 w-4" />,
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
