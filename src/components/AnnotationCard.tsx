
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import CollapsibleSection from './CollapsibleSection';
import FeedbackButtons from './FeedbackButtons';
import { ScrollArea } from '@/components/ui/scroll-area';

type AnnotationCardProps = {
  question: string;
  context?: string;
  categories?: string[];
  icuTypes?: string[];
  selectedTasks?: Record<string, boolean>;
  feedbackRelevance?: 'positive' | 'negative' | null;
  feedbackComplete?: 'positive' | 'negative' | null;
  feedbackQuestion?: 'positive' | 'negative' | null;
  userFeedback?: string;
  onTaskChange?: (taskKey: string, value: boolean) => void;
  onRelevanceFeedback?: (feedback: 'positive' | 'negative') => void;
  onCompleteFeedback?: (feedback: 'positive' | 'negative') => void;
  onQuestionFeedback?: (feedback: 'positive' | 'negative') => void;
  onUserFeedbackChange?: (feedback: string) => void;
};

const AnnotationCard = ({
  question,
  context,
  categories = [],
  icuTypes = [],
  selectedTasks = {},
  feedbackRelevance = null,
  feedbackComplete = null,
  feedbackQuestion = null,
  userFeedback = '',
  onTaskChange,
  onRelevanceFeedback,
  onCompleteFeedback,
  onQuestionFeedback,
  onUserFeedbackChange
}: AnnotationCardProps) => {
  // Helper function to handle switch changes
  const handleSwitchChange = (taskKey: string, value: boolean) => {
    if (onTaskChange) {
      onTaskChange(taskKey, value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="h-full flex flex-col"
    >
      <Card className="overflow-hidden border border-border/30 shadow-sm h-full flex flex-col">
        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left Column */}
            <div className="flex flex-col p-5 pb-2 space-y-4">
              {/* ICU Type and Categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground mr-1">ICU Type:</span>
                {icuTypes.map((type, index) => (
                  <Badge key={`type-${index}`} variant="secondary" className="badge badge-secondary">
                    {type}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground mr-1">Category:</span>
                {categories.map((category, index) => (
                  <Badge key={`category-${index}`} variant="outline" className="badge">
                    {category}
                  </Badge>
                ))}
              </div>
              
              {/* Question */}
              <div className="mb-2">
                <h2 className="text-xl font-semibold">{question}</h2>
                
                {context && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    <span className="font-medium">Context:</span> {context}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium">Is this question relevant?</span>
                  <FeedbackButtons
                    onPositive={() => onQuestionFeedback?.('positive')}
                    onNegative={() => onQuestionFeedback?.('negative')}
                    selected={feedbackQuestion}
                  />
                </div>
              </div>
              
              {/* Task List (Scrollable) */}
              <ScrollArea className="border rounded-md flex-1 pr-4 bg-secondary/30">
                <div className="p-4 space-y-4">
                  <CollapsibleSection title="Vital signs" defaultOpen={true}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="bloodPressure" className="cursor-pointer">blood pressure</Label>
                        <Switch
                          id="bloodPressure"
                          checked={selectedTasks.bloodPressure || false}
                          onCheckedChange={(value) => handleSwitchChange('bloodPressure', value)}
                          className="switch"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="heartRate" className="cursor-pointer">heart rate</Label>
                        <Switch
                          id="heartRate"
                          checked={selectedTasks.heartRate || false}
                          onCheckedChange={(value) => handleSwitchChange('heartRate', value)}
                          className="switch"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                  
                  <CollapsibleSection title="Cardiac enzymes" defaultOpen={true}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="troponin" className="cursor-pointer">troponin</Label>
                        <Switch
                          id="troponin"
                          checked={selectedTasks.troponin || false}
                          onCheckedChange={(value) => handleSwitchChange('troponin', value)}
                          className="switch"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="ckMb" className="cursor-pointer">CK-MB</Label>
                        <Switch
                          id="ckMb"
                          checked={selectedTasks.ckMb || false}
                          onCheckedChange={(value) => handleSwitchChange('ckMb', value)}
                          className="switch"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                  
                  <CollapsibleSection title="Medication records" defaultOpen={true}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="inotropeType" className="cursor-pointer">inotrope type</Label>
                        <Switch
                          id="inotropeType"
                          checked={selectedTasks.inotropeType || false}
                          onCheckedChange={(value) => handleSwitchChange('inotropeType', value)}
                          className="switch"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="dosage" className="cursor-pointer">dosage</Label>
                        <Switch
                          id="dosage"
                          checked={selectedTasks.dosage || false}
                          onCheckedChange={(value) => handleSwitchChange('dosage', value)}
                          className="switch"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="infusionRate" className="cursor-pointer">infusion rate</Label>
                        <Switch
                          id="infusionRate"
                          checked={selectedTasks.infusionRate || false}
                          onCheckedChange={(value) => handleSwitchChange('infusionRate', value)}
                          className="switch"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              </ScrollArea>
            </div>
            
            {/* Right Column */}
            <div className="flex flex-col p-5 pb-2 space-y-4 bg-background/50">
              {/* Reasoning Card */}
              <Card className="bg-blue-50/50 border-blue-100 flex-shrink-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This question is designed to evaluate whether the current inotropic support is appropriate. Vital signs, such as blood pressure and heart rate, indicate the current hemodynamic stability, while trends in cardiac enzymes like troponin and CK-MB help assess the extent of myocardial injury. Finally, the medication records provide details about the current inotrope regimen. Together, these tasks allow clinicians to correlate the patient's clinical status with laboratory findings and treatment parameters, thereby informing an actionable decision about adjusting inotropic support.
                  </p>
                  
                  <div className="flex justify-between mt-4 w-full">
                    <span className="text-sm font-medium">Is this reasoning valid?</span>
                    <FeedbackButtons
                      onPositive={() => onRelevanceFeedback?.('positive')}
                      onNegative={() => onRelevanceFeedback?.('negative')}
                      selected={feedbackRelevance}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Tasks Complete Card */}
              <Card className="bg-green-50/50 border-green-100 flex-shrink-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Tasks Complete?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Do the tasks retrieve all relevant data that you would search on an EHR system to answer the question?
                  </p>
                  
                  <div className="flex justify-between mt-4 w-full">
                    <span className="text-sm font-medium">Are all necessary tasks included?</span>
                    <FeedbackButtons
                      onPositive={() => onCompleteFeedback?.('positive')}
                      onNegative={() => onCompleteFeedback?.('negative')}
                      selected={feedbackComplete}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Feedback Textarea - Now on right column */}
              <div className="space-y-2 flex-shrink-0">
                <Label htmlFor="feedback" className={`${(feedbackQuestion === 'negative' || feedbackRelevance === 'negative' || feedbackComplete === 'negative') ? 'text-destructive font-semibold' : ''}`}>
                  {(feedbackQuestion === 'negative' || feedbackRelevance === 'negative' || feedbackComplete === 'negative') 
                    ? 'Please provide detailed feedback (required)' 
                    : 'Enter feedback (optional)'}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Enter your feedback here..."
                  value={userFeedback}
                  onChange={(e) => onUserFeedbackChange?.(e.target.value)}
                  className={`min-h-[100px] resize-none ${(feedbackQuestion === 'negative' || feedbackRelevance === 'negative' || feedbackComplete === 'negative') ? 'border-destructive' : ''}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnnotationCard;
