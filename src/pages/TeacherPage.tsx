
import React, { useState, useEffect, useContext } from 'react';
import Header, { BlockchainModeContext } from '@/components/Header';
import Footer from '@/components/Footer';
import TeacherDashboard from '@/components/TeacherDashboard';
import { getUserRole } from '@/utils/web3Utils';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const TeacherPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const navigate = useNavigate();
  const { isRealBlockchainMode } = useContext(BlockchainModeContext);
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const role = getUserRole(accounts[0]);
            setIsTeacher(role === 'teacher' || role === 'admin');
            
            if (isRealBlockchainMode && role !== 'teacher' && role !== 'admin') {
              toast({
                variant: "destructive",
                title: "Access Denied",
                description: "In blockchain deployment mode, only verified teachers can access this area."
              });
            }
          } else {
            setIsTeacher(false);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
          setIsTeacher(false);
        }
      } else {
        setIsTeacher(false);
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [navigate, isRealBlockchainMode, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="mb-6 text-muted-foreground">
              This area is restricted to teachers only. Please connect with a teacher wallet to access this dashboard.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <TeacherDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default TeacherPage;
