
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VerificationForm from '@/components/VerificationForm';
import ResultCard from '@/components/ResultCard';
import { getResultById } from '@/utils/demoData';
import { Blocks, Shield } from 'lucide-react';

const Index = () => {
  const [verifiedResultId, setVerifiedResultId] = useState<string | null>(null);
  
  const handleResultFound = (resultId: string) => {
    setVerifiedResultId(resultId);
  };
  
  const handleCloseResult = () => {
    setVerifiedResultId(null);
  };
  
  const result = verifiedResultId ? getResultById(verifiedResultId) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!result ? (
          <>
            <section className="mb-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                  <Blocks className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Blockchain Academic Result Verification</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  GradeChain enables secure, tamper-proof verification of academic records using blockchain technology
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Immutable Records</h3>
                    <p className="text-sm text-muted-foreground">
                      Academic results stored on the blockchain cannot be altered or tampered with.
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Easy Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Instantly verify the authenticity of academic credentials without intermediaries.
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Secure Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Control who can access your academic records with blockchain security.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="mb-12">
              <VerificationForm onResultFound={handleResultFound} />
            </section>
            
            <section className="text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-medium">How It Works</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3">1</div>
                    <h3 className="font-medium mb-2">Educational Institutions</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload and cryptographically sign student results to the blockchain
                    </p>
                  </div>
                  
                  <div className="p-4">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3">2</div>
                    <h3 className="font-medium mb-2">Blockchain Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Result data is hashed and stored immutably on the Polygon blockchain
                    </p>
                  </div>
                  
                  <div className="p-4">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3">3</div>
                    <h3 className="font-medium mb-2">Instant Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Students and employers can instantly verify results with the verification ID
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="mb-12">
            {result && <ResultCard result={result} onClose={handleCloseResult} />}
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
