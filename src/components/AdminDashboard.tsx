
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileDigit, Settings, Upload, Database } from 'lucide-react';
import ContractDeployment from './ContractDeployment';
import TeacherRegistration from './TeacherRegistration';
import { BlockchainModeContext } from './Header';
import AdminUpload from './AdminUpload';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deploy');
  const { isRealBlockchainMode } = React.useContext(BlockchainModeContext);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage blockchain contract, register teachers, and upload academic records
        </p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg border border-muted/50 text-muted-foreground text-sm">
        <p className="flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${isRealBlockchainMode ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
          <span className="font-medium">
            {isRealBlockchainMode ? 'Deploy Mode Active' : 'Testing Mode Active'}
          </span>
          - {isRealBlockchainMode 
              ? 'All transactions will be sent to the Sepolia testnet' 
              : 'Transactions will be simulated without blockchain interaction'}
        </p>
      </div>
      
      <Tabs defaultValue="deploy" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="deploy" className="flex items-center justify-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Contract Management</span>
            <span className="sm:hidden">Contract</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Teacher Registration</span>
            <span className="sm:hidden">Teachers</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Record Upload</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center justify-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">View Records</span>
            <span className="sm:hidden">Records</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deploy">
          <ContractDeployment />
        </TabsContent>
        
        <TabsContent value="teachers">
          <TeacherRegistration />
        </TabsContent>
        
        <TabsContent value="upload">
          <AdminUpload />
        </TabsContent>
        
        <TabsContent value="records">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center">
                <FileDigit className="h-6 w-6 mr-2 text-primary" />
                Blockchain Records
              </h2>
              <p className="text-muted-foreground">
                This feature will allow you to view all records stored on the blockchain. Coming soon in the next update.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
