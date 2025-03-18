
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/sonner";
import AnnotationCard from '@/components/AnnotationCard';
import NavigationControls from '@/components/NavigationControls';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample data - in a real app, this would come from an API
  const annotationItems = [
    {
      question: "Should we adjust the inotropic support for this patient?",
      context: "65-year-old male with acute myocardial infarction on inotropic support",
      categories: ["cardiovascular"],
      icuTypes: ["medical", "cardiac"]
    },
    {
      question: "Is the current ventilation strategy appropriate for this ARDS patient?",
      context: "58-year-old female with COVID-19 induced ARDS on mechanical ventilation",
      categories: ["respiratory"],
      icuTypes: ["medical"]
    },
    {
      question: "Should we continue renal replacement therapy for this patient?",
      context: "72-year-old male with sepsis-induced acute kidney injury on CRRT",
      categories: ["renal"],
      icuTypes: ["medical"]
    }
  ];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < annotationItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Annotation submitted successfully!");
      setIsSubmitting(false);
      
      // Move to next item if available
      if (currentIndex < annotationItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <h1 className="text-lg font-semibold">Medical Annotation Tool</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Logged in as <span className="font-medium text-foreground">{user.username}</span>
            </span>
            <Button variant="destructive" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <motion.h2 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Annotation Task
              </motion.h2>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {currentIndex + 1} of {annotationItems.length}
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="outline" size="sm" onClick={() => toast.info("Need help? Contact support@example.com")}>
                Need Help?
              </Button>
            </motion.div>
          </div>
          
          <AnnotationCard 
            question={annotationItems[currentIndex].question}
            context={annotationItems[currentIndex].context}
            categories={annotationItems[currentIndex].categories}
            icuTypes={annotationItems[currentIndex].icuTypes}
          />
          
          <div className="mt-8 flex justify-center">
            <NavigationControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isPreviousDisabled={currentIndex === 0 || isSubmitting}
              isNextDisabled={currentIndex === annotationItems.length - 1 || isSubmitting}
              isSubmitDisabled={isSubmitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
