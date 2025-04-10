
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VerificationForm from '@/components/VerificationForm';
import ResultCard from '@/components/ResultCard';
import { getResultById } from '@/utils/demoData';
import { Blocks, Shield, ArrowRight, CheckCircle, Database, LockKeyhole } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [verifiedResultId, setVerifiedResultId] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Start animation sequence after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleResultFound = (resultId: string) => {
    setVerifiedResultId(resultId);
  };
  
  const handleCloseResult = () => {
    setVerifiedResultId(null);
  };
  
  const result = verifiedResultId ? getResultById(verifiedResultId) : null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const featureCardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!result ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-16"
          >
            <section className="mb-12 text-center">
              <div className="max-w-3xl mx-auto">
                <motion.div 
                  className="flex justify-center mb-6" 
                  variants={itemVariants}
                >
                  <Blocks className="h-20 w-20 text-primary animate-pulse" />
                </motion.div>
                
                <motion.h1 
                  className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" 
                  variants={itemVariants}
                >
                  Blockchain Academic Result Verification
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-muted-foreground mb-10"
                  variants={itemVariants}
                >
                  GradeChain enables secure, tamper-proof verification of academic records using blockchain technology
                </motion.p>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20"
                    variants={featureCardVariants}
                    whileHover="hover"
                  >
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Immutable Records</h3>
                    <p className="text-sm text-muted-foreground">
                      Academic results stored on the blockchain cannot be altered or tampered with.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20"
                    variants={featureCardVariants}
                    whileHover="hover"
                  >
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Easy Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Instantly verify the authenticity of academic credentials without intermediaries.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20"
                    variants={featureCardVariants}
                    whileHover="hover"
                  >
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <LockKeyhole className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Secure Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Control who can access your academic records with blockchain security.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </section>
            
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <VerificationForm onResultFound={handleResultFound} />
            </motion.section>
            
            <motion.section 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: animationComplete ? 1 : 0 }}
              transition={{ delay: 1.2, duration: 0.7 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-8">
                  <Shield className="h-6 w-6 text-primary mr-2" />
                  <h2 className="text-2xl font-semibold">How It Works</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="relative p-6">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">1</div>
                    <h3 className="font-medium text-lg mb-3">Educational Institutions</h3>
                    <p className="text-muted-foreground">
                      Upload and cryptographically sign student results to the blockchain
                    </p>
                    <div className="hidden md:block absolute top-10 left-full w-16 h-1 bg-gradient-to-r from-primary to-transparent transform -translate-x-8"></div>
                  </div>
                  
                  <div className="relative p-6">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">2</div>
                    <h3 className="font-medium text-lg mb-3">Blockchain Storage</h3>
                    <p className="text-muted-foreground">
                      Result data is hashed and stored immutably on the Polygon blockchain
                    </p>
                    <div className="hidden md:block absolute top-10 left-full w-16 h-1 bg-gradient-to-r from-primary to-transparent transform -translate-x-8"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">3</div>
                    <h3 className="font-medium text-lg mb-3">Instant Verification</h3>
                    <p className="text-muted-foreground">
                      Students and employers can instantly verify results with the verification ID
                    </p>
                  </div>
                </div>
                
                <motion.div 
                  className="mt-12"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <a 
                    href="#verification-form" 
                    className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-full transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#verification-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Try Verification Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </motion.div>
              </div>
            </motion.section>
          </motion.div>
        ) : (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {result && <ResultCard result={result} onClose={handleCloseResult} />}
          </motion.section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
