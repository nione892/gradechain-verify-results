
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentDashboard from '@/components/StudentDashboard';

const StudentPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <StudentDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default StudentPage;
