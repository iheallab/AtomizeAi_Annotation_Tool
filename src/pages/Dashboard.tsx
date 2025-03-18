import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import AnnotationCard from '@/components/AnnotationCard';
import NavigationControls from '@/components/NavigationControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, List, CheckCircle2, CircleDashed, HelpCircle } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';

type AnnotationItem = {
  id: string;
  question: string;
  context?: string;
  categories?: string[];
  icuTypes?: string[];
  completed?: boolean;
  feedbackRelevance?: 'positive' | 'negative' | null;
  feedbackComplete?: 'positive' | 'negative' | null;
  userFeedback?: string;
  selectedTasks?: Record<string, boolean>;
  feedbackQuestion?: 'positive' | 'negative' | null;
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [annotationItems, setAnnotationItems] = useState<AnnotationItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  useEffect(() => {
    const data: AnnotationItem[] = [
      {
        id: "1",
        question: "Should we adjust the inotropic support for this patient?",
        context: "65-year-old male with acute myocardial infarction on inotropic support",
        categories: ["cardiovascular"],
        icuTypes: ["medical", "cardiac"],
        completed: false,
        selectedTasks: {
          bloodPressure: false,
          heartRate: false,
          troponin: false,
          ckMb: false,
          inotropeType: false,
          dosage: false,
          infusionRate: false
        },
        feedbackQuestion: null,
        feedbackRelevance: null,
        feedbackComplete: null,
        userFeedback: ''
      },
      {
        id: "2",
        question: "Is the current ventilation strategy appropriate for this ARDS patient?",
        context: "58-year-old female with COVID-19 induced ARDS on mechanical ventilation",
        categories: ["respiratory"],
        icuTypes: ["medical"],
        completed: false,
        selectedTasks: {
          bloodPressure: false,
          heartRate: false,
          troponin: false,
          ckMb: false,
          inotropeType: false,
          dosage: false,
          infusionRate: false
        },
        feedbackQuestion: null,
        feedbackRelevance: null,
        feedbackComplete: null,
        userFeedback: ''
      },
      {
        id: "3",
        question: "Should we continue renal replacement therapy for this patient?",
        context: "72-year-old male with sepsis-induced acute kidney injury on CRRT",
        categories: ["renal"],
        icuTypes: ["medical"],
        completed: false,
        selectedTasks: {
          bloodPressure: false,
          heartRate: false,
          troponin: false,
          ckMb: false,
          inotropeType: false,
          dosage: false,
          infusionRate: false
        },
        feedbackQuestion: null,
        feedbackRelevance: null,
        feedbackComplete: null,
        userFeedback: ''
      }
    ];
    
    setAnnotationItems(data);
  }, []);

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
    
    const updatedItems = [...annotationItems];
    updatedItems[currentIndex].completed = true;
    setAnnotationItems(updatedItems);
    
    setTimeout(() => {
      toast.success("Annotation submitted successfully!");
      setIsSubmitting(false);
      
      if (currentIndex < annotationItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 1500);
  };

  const handleTaskUpdate = (taskKey: string, value: boolean) => {
    const updatedItems = [...annotationItems];
    if (!updatedItems[currentIndex].selectedTasks) {
      updatedItems[currentIndex].selectedTasks = {};
    }
    updatedItems[currentIndex].selectedTasks![taskKey] = value;
    setAnnotationItems(updatedItems);
  };

  const handleFeedbackQuestion = (feedback: 'positive' | 'negative') => {
    const updatedItems = [...annotationItems];
    updatedItems[currentIndex].feedbackQuestion = feedback;
    
    if (updatedItems[currentIndex].selectedTasks) {
      const tasks = updatedItems[currentIndex].selectedTasks!;
      const allKeys = Object.keys(tasks);
      
      for (const key of allKeys) {
        tasks[key] = feedback === 'positive';
      }
    }
    
    setAnnotationItems(updatedItems);
    
    if (feedback === 'negative') {
      toast.info("Please provide detailed feedback in the feedback section below.");
    }
  };

  const handleFeedbackRelevance = (feedback: 'positive' | 'negative') => {
    const updatedItems = [...annotationItems];
    updatedItems[currentIndex].feedbackRelevance = feedback;
    setAnnotationItems(updatedItems);
    
    if (feedback === 'negative') {
      toast.info("Please provide detailed feedback in the feedback section below.");
    }
  };

  const handleFeedbackComplete = (feedback: 'positive' | 'negative') => {
    const updatedItems = [...annotationItems];
    updatedItems[currentIndex].feedbackComplete = feedback;
    setAnnotationItems(updatedItems);
    
    if (feedback === 'negative') {
      toast.info("Please provide detailed feedback in the feedback section below.");
    }
  };

  const handleUserFeedback = (feedback: string) => {
    const updatedItems = [...annotationItems];
    updatedItems[currentIndex].userFeedback = feedback;
    setAnnotationItems(updatedItems);
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const currentItem = annotationItems[currentIndex] || {
    question: "Loading...",
    context: "Please wait while we load the question",
    categories: [],
    icuTypes: [],
    feedbackQuestion: null,
    feedbackRelevance: null,
    feedbackComplete: null,
    userFeedback: '',
    selectedTasks: {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </div>
            <h1 className="text-lg font-semibold">Medical Annotation Tool</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toast.info("Need help? Contact support@example.com")}
              className="flex items-center gap-1"
            >
              <HelpCircle size={16} />
              <span className="hidden sm:inline">Need Help?</span>
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Logged in as <span className="font-medium text-foreground">{user.username}</span>
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-2 flex flex-col h-[calc(100vh-61px)]">
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnnotationCard 
            question={currentItem.question}
            context={currentItem.context}
            categories={currentItem.categories}
            icuTypes={currentItem.icuTypes}
            selectedTasks={currentItem.selectedTasks}
            feedbackRelevance={currentItem.feedbackRelevance}
            feedbackComplete={currentItem.feedbackComplete}
            userFeedback={currentItem.userFeedback}
            feedbackQuestion={currentItem.feedbackQuestion}
            onTaskChange={handleTaskUpdate}
            onRelevanceFeedback={handleFeedbackRelevance}
            onCompleteFeedback={handleFeedbackComplete}
            onUserFeedbackChange={handleUserFeedback}
            onQuestionFeedback={handleFeedbackQuestion}
            currentQuestionIndex={currentIndex + 1}
            totalQuestions={annotationItems.length}
          />
        </div>
        
        <div className="mt-2 mb-2 flex justify-center">
          <NavigationControls
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isPreviousDisabled={currentIndex === 0 || isSubmitting}
            isNextDisabled={currentIndex === annotationItems.length - 1 || isSubmitting}
            isSubmitDisabled={isSubmitting}
          />
        </div>
      </main>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <Menu size={24} />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Question Navigator</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">
                {annotationItems.filter(item => item.completed).length} of {annotationItems.length} completed
              </span>
            </div>

            <ScrollArea className="h-[50vh]">
              <ul className="space-y-2">
                {annotationItems.map((item, idx) => (
                  <li key={item.id}>
                    <Button 
                      variant={currentIndex === idx ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setDrawerOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {item.completed ? 
                          <CheckCircle2 className="h-5 w-5 text-success" /> : 
                          <CircleDashed className="h-5 w-5 text-muted-foreground" />
                        }
                        <div className="truncate">
                          <span className="text-sm">{idx + 1}. {item.question}</span>
                        </div>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Dashboard;
