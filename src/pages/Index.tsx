
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VerificationForm from '@/components/VerificationForm';
import ResultCard from '@/components/ResultCard';
import { getResultById } from '@/utils/demoData';
import { Blocks, Shield, ArrowRight, CheckCircle, Database, LockKeyhole, GraduationCap, Award, Building, Users, BookOpen, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

  // Trusted institutions
  const institutions = [
    { name: "University of Technology", icon: Building },
    { name: "Global Education Alliance", icon: Landmark },
    { name: "Institute of Advanced Studies", icon: BookOpen },
    { name: "Academy of Sciences", icon: GraduationCap },
  ];

  // Statistics
  const stats = [
    { value: "25,000+", label: "Academic Records", icon: Database },
    { value: "15+", label: "Partner Institutions", icon: Building },
    { value: "99.9%", label: "Verification Accuracy", icon: CheckCircle },
    { value: "100%", label: "Tamper-Proof", icon: Shield },
  ];

  // Benefits
  const benefits = [
    {
      title: "For Students",
      description: "Securely share verified credentials with employers and institutions worldwide.",
      icon: GraduationCap,
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      title: "For Universities",
      description: "Eliminate certificate fraud and reduce administrative verification workload.",
      icon: Building,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "For Employers",
      description: "Instantly verify candidate credentials without contacting institutions.",
      icon: Users,
      color: "from-purple-500/20 to-purple-600/20"
    },
  ];

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
                  <div className="relative">
                    <Blocks className="h-20 w-20 text-primary" />
                    <motion.div 
                      className="absolute -right-2 -top-2 bg-secondary text-secondary-foreground rounded-full p-2"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        repeatType: "reverse" 
                      }}
                    >
                      <GraduationCap className="h-6 w-6" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" 
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
            
            {/* Statistics Section */}
            <motion.section 
              className="py-16 bg-muted/30 rounded-3xl mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: animationComplete ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Powering Academic Trust</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Our blockchain infrastructure brings transparency and trust to academic credentials
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="text-center"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-md">
                        <stat.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-3xl font-bold mb-1 text-primary">{stat.value}</h3>
                      <p className="text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
            
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <VerificationForm onResultFound={handleResultFound} />
            </motion.section>
            
            {/* Benefits Section */}
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: animationComplete ? 1 : 0 }}
              transition={{ delay: 1.0, duration: 0.7 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Who Benefits from GradeChain?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our blockchain solution creates value for the entire educational ecosystem
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className={`p-6 rounded-xl bg-gradient-to-br ${benefit.color} border border-primary/10`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.2 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="bg-background/90 w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto shadow-md">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-center">{benefit.title}</h3>
                    <p className="text-muted-foreground text-center">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
            
            {/* Trusted By Section */}
            <motion.section 
              className="mb-16 bg-muted/20 py-12 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: animationComplete ? 1 : 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-2">Trusted By Leading Institutions</h2>
                <p className="text-muted-foreground">
                  Universities and educational organizations that rely on GradeChain
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 px-4">
                {institutions.map((institution, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center bg-background px-6 py-4 rounded-xl shadow-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <institution.icon className="h-6 w-6 text-primary mr-3" />
                    <span className="font-medium">{institution.name}</span>
                  </motion.div>
                ))}
              </div>
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
            
            {/* CTA Section */}
            <motion.section 
              className="mb-12 bg-gradient-to-r from-primary/10 to-secondary/10 p-10 rounded-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <div className="max-w-3xl mx-auto text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-4">Ready to Transform Academic Verification?</h2>
                <p className="text-lg mb-8">
                  Join leading institutions in bringing trust and transparency to academic credentials with blockchain technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="px-8">
                    Request a Demo
                  </Button>
                  <Button variant="outline" size="lg" className="px-8">
                    Learn More
                  </Button>
                </div>
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
