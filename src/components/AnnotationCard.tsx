
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import CollapsibleSection from './CollapsibleSection';
import FeedbackButtons from './FeedbackButtons';

type AnnotationCardProps = {
  question: string;
  context?: string;
  categories?: string[];
  icuTypes?: string[];
};

const AnnotationCard = ({
  question,
  context,
  categories = [],
  icuTypes = [],
}: AnnotationCardProps) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [userFeedback, setUserFeedback] = useState('');
  
  // State for vital signs
  const [bloodPressure, setBloodPressure] = useState(false);
  const [heartRate, setHeartRate] = useState(false);
  
  // State for cardiac enzymes
  const [troponin, setTroponin] = useState(false);
  const [ckMb, setCkMb] = useState(false);
  
  // State for medication records
  const [inotropeType, setInotropeType] = useState(false);
  const [dosage, setDosage] = useState(false);
  const [infusionRate, setInfusionRate] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="overflow-hidden border border-border/30 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {icuTypes.map((type, index) => (
              <Badge key={`type-${index}`} variant="secondary" className="badge badge-secondary">
                {type}
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <Badge key={`category-${index}`} variant="outline" className="badge">
                {category}
              </Badge>
            ))}
          </div>
          
          <CardTitle className="text-xl font-semibold">{question}</CardTitle>
          
          {context && (
            <p className="text-muted-foreground mt-2 text-sm">
              <span className="font-medium">Context:</span> {context}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <CollapsibleSection title="Vital signs" defaultOpen={true}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="bloodPressure" className="cursor-pointer">blood pressure</Label>
                    <Switch
                      id="bloodPressure"
                      checked={bloodPressure}
                      onCheckedChange={setBloodPressure}
                      className="switch"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="heartRate" className="cursor-pointer">heart rate</Label>
                    <Switch
                      id="heartRate"
                      checked={heartRate}
                      onCheckedChange={setHeartRate}
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
                      checked={troponin}
                      onCheckedChange={setTroponin}
                      className="switch"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ckMb" className="cursor-pointer">CK-MB</Label>
                    <Switch
                      id="ckMb"
                      checked={ckMb}
                      onCheckedChange={setCkMb}
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
                      checked={inotropeType}
                      onCheckedChange={setInotropeType}
                      className="switch"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="dosage" className="cursor-pointer">dosage</Label>
                    <Switch
                      id="dosage"
                      checked={dosage}
                      onCheckedChange={setDosage}
                      className="switch"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="infusionRate" className="cursor-pointer">infusion rate</Label>
                    <Switch
                      id="infusionRate"
                      checked={infusionRate}
                      onCheckedChange={setInfusionRate}
                      className="switch"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </div>
            
            <div className="space-y-4">
              <Card className="bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This question is designed to evaluate whether the current inotropic support is appropriate. Vital signs, such as blood pressure and heart rate, indicate the current hemodynamic stability, while trends in cardiac enzymes like troponin and CK-MB help assess the extent of myocardial injury. Finally, the medication records provide details about the current inotrope regimen. Together, these tasks allow clinicians to correlate the patient's clinical status with laboratory findings and treatment parameters, thereby informing an actionable decision about adjusting inotropic support.
                  </p>
                  
                  <div className="flex justify-end mt-4">
                    <FeedbackButtons
                      onPositive={() => setFeedback('positive')}
                      onNegative={() => setFeedback('negative')}
                      selected={feedback}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50/50 border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Tasks Complete?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Do the tasks retrieve all relevant data that you would search on an EHR system to answer the question?
                  </p>
                  
                  <div className="flex justify-end mt-4">
                    <FeedbackButtons
                      onPositive={() => {}}
                      onNegative={() => {}}
                      selected={null}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">Enter feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Enter your feedback here..."
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  className="min-h-[100px] resize-none"
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
