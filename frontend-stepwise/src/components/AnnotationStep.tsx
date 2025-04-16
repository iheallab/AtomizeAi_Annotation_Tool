import React, { useState, useRef, useEffect } from "react";
import { Question, TaskGroup, Task, AnnotationResponse } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  ChevronDown,
  Tag,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnnotationStepProps {
  question: Question;
  onSubmit: (response: AnnotationResponse) => Promise<void>;
}

export const AnnotationStep: React.FC<AnnotationStepProps> = ({
  question,
  onSubmit,
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string>("question");
  const [isValid, setIsValid] = useState<boolean | undefined>(question.isValid);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(
    JSON.parse(JSON.stringify(question.tasks))
  );
  const [isReasoningValid, setIsReasoningValid] = useState<boolean | undefined>(
    question.isReasoningValid
  );
  const [areMissingValuesCorrect, setAreMissingValuesCorrect] = useState<
    boolean | undefined
  >(question.areMissingValuesCorrect);
  const [feedback, setFeedback] = useState<string>(question.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // References for scrolling
  const sectionRefs = {
    question: useRef<HTMLDivElement>(null),
    tasks: useRef<HTMLDivElement>(null),
    reasoning: useRef<HTMLDivElement>(null),
    missingValues: useRef<HTMLDivElement>(null),
    feedback: useRef<HTMLDivElement>(null),
  };

  // Reset state when question changes
  useEffect(() => {
    setIsValid(question.isValid);
    setTaskGroups(JSON.parse(JSON.stringify(question.tasks)));
    setIsReasoningValid(question.isReasoningValid);
    setAreMissingValuesCorrect(question.areMissingValuesCorrect);
    setFeedback(question.feedback || "");

    // Reset accordion state for completed questions or start with question section for new ones
    if (question.isCompleted) {
      setActiveAccordion("");
    } else {
      setActiveAccordion("question");
    }
  }, [question]);

  // Auto-scroll to the active section
  useEffect(() => {
    if (
      activeAccordion &&
      sectionRefs[activeAccordion as keyof typeof sectionRefs]?.current
    ) {
      setTimeout(() => {
        sectionRefs[
          activeAccordion as keyof typeof sectionRefs
        ].current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // Small delay to ensure the accordion has expanded
    }
  }, [activeAccordion]);

  const handleTaskToggle = (
    groupId: string,
    taskId: string,
    enabled: boolean
  ) => {
    setTaskGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === taskId ? { ...task, enabled } : task
              ),
            }
          : group
      )
    );
  };

  const needsFeedback =
    isValid === false ||
    isReasoningValid === false ||
    areMissingValuesCorrect === false;

  const handleAccordionChange = (value: string) => {
    // Allow reopening sections by clicking on them
    setActiveAccordion(value === activeAccordion ? "" : value);
  };

  const moveToNextSection = (currentSection: string) => {
    const sections = [
      "question",
      "tasks",
      "reasoning",
      "missingValues",
      "feedback",
    ];
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex < sections.length - 1) {
      setActiveAccordion(sections[currentIndex + 1]);
    }
  };

  const handleSubmit = async () => {
    if (
      isValid === undefined ||
      isReasoningValid === undefined ||
      areMissingValuesCorrect === undefined
    ) {
      return;
    }

    if (needsFeedback && !feedback.trim()) {
      setActiveAccordion("feedback");
      return;
    }

    setIsSubmitting(true);

    const response: AnnotationResponse = {
      questionId: question.id,
      isValid: isValid || false,
      tasks: taskGroups,
      isReasoningValid: isReasoningValid || false,
      areMissingValuesCorrect: areMissingValuesCorrect || false,
      feedback: feedback.trim() || undefined,
    };

    await onSubmit(response);
    setIsSubmitting(false);
  };

  // Check if a section is completed
  const isSectionCompleted = (section: string): boolean => {
    switch (section) {
      case "question":
        return isValid !== undefined;
      case "tasks":
        return taskGroups.some((group) => group.tasks.some((t) => t.enabled));
      case "reasoning":
        return isReasoningValid !== undefined;
      case "missingValues":
        return areMissingValuesCorrect !== undefined;
      case "feedback":
        return !needsFeedback || feedback.trim().length > 0;
      default:
        return false;
    }
  };

  const isFormCompleted = (): boolean => {
    return (
      isValid !== undefined &&
      taskGroups.some((group) => group.tasks.some((t) => t.enabled)) &&
      isReasoningValid !== undefined &&
      areMissingValuesCorrect !== undefined &&
      (!needsFeedback || feedback.trim().length > 0)
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* <div className="bg-white dark:bg-background rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"> */}
      <Accordion
        type="single"
        value={activeAccordion}
        onValueChange={handleAccordionChange}
        className="w-full"
        collapsible
      >
        {/* <AccordionItem
          value="question"
          className="border bg-card dark:border-border rounded-md mb-4 overflow-hidden shadow-sm"
          ref={sectionRefs.question}
        > */}

        <AccordionItem
          value="question"
          className="bg-secondary dark:bg-secondary-dark border border-border dark:border-border rounded-2xl mb-6 shadow-soft transition-colors"
          ref={sectionRefs.question}
        >
          <AccordionTrigger className="px-6 py-4 group text-left transition-colors">
            <div className="flex items-center w-full justify-between">
              <span className="text-lg font-medium">
                Clinical Context & Question
              </span>
              <div className="flex items-center">
                {isValid !== undefined && (
                  <span
                    className={cn(
                      "mr-3 text-sm px-2 py-1 rounded-full",
                      isValid
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    )}
                  >
                    {isValid ? "Valid" : "Invalid"}
                  </span>
                )}
                {isSectionCompleted("question") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveToNextSection("question");
                    }}
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6 dark:text-foreground">
            <div className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {question.categories.map((category, index) => (
                  <Badge
                    key={index}
                    className="bg-white dark:bg-background border border-border text-foreground flex items-center gap-1 px-2 py-1 rounded-md text-sm"
                  >
                    <Tag size={12} />
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Clinical Context */}
              <div className="bg-white dark:bg-background p-5 rounded-md mb-4 border border-border shadow-sm">
                <h4 className="text-lg font-medium mb-2">Clinical Context:</h4>
                <p className="text-foreground text-base leading-relaxed">
                  {question.context}
                </p>
              </div>

              {/* Question */}
              <h3 className="text-xl font-semibold mt-2">
                Question: {question.question}
              </h3>

              <div className="mt-4">
                <p className="mb-3 font-medium">
                  Would you ask this question about a patient you are caring for
                  in the provided context?
                </p>
                <div className="flex space-x-4">
                  {/* Valid Button */}
                  <Button
                    variant={isValid === true ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isValid === true
                        ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                        : "bg-white dark:bg-background border border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/10"
                    )}
                    onClick={() => setIsValid(true)}
                  >
                    <ThumbsUp size={18} />
                    <span>Yes, valid question</span>
                  </Button>

                  {/* Invalid Button */}
                  <Button
                    variant={isValid === false ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isValid === false
                        ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white"
                        : "bg-white dark:bg-background border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/10"
                    )}
                    onClick={() => setIsValid(false)}
                  >
                    <ThumbsDown size={18} />
                    <span>No, invalid question</span>
                  </Button>
                </div>
              </div>

              {isSectionCompleted("question") && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center mx-auto text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => moveToNextSection("question")}
                  >
                    <span>Complete and move to next section</span>
                    <CheckCircle size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="tasks"
          className="bg-secondary dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors"
          ref={sectionRefs.tasks}
        >
          <AccordionTrigger className="px-6 py-4 group text-left transition-colors">
            <div className="flex items-center w-full justify-between">
              <span className="text-lg font-medium">
                Required Data Elements
              </span>
              <div className="flex items-center">
                {taskGroups.some((group) =>
                  group.tasks.some((t) => t.enabled)
                ) && (
                  <span className="mr-3 text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {
                      taskGroups
                        .flatMap((g) => g.tasks)
                        .filter((t) => t.enabled).length
                    }{" "}
                    selected
                  </span>
                )}
                {isSectionCompleted("tasks") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveToNextSection("tasks");
                    }}
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6 dark:text-foreground">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the data elements that are necessary to answer this
                question:
              </p>

              <div className="space-y-6">
                {taskGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-background border border-border rounded-lg p-4 shadow-sm"
                  >
                    <h3 className="font-medium text-lg mb-3">{group.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 border border-border rounded-md bg-white dark:bg-background transition-colors"
                        >
                          <span className="font-medium">{task.name}</span>
                          <Switch
                            checked={task.enabled}
                            onCheckedChange={(checked) =>
                              handleTaskToggle(group.id, task.id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {isSectionCompleted("tasks") && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center mx-auto text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => moveToNextSection("tasks")}
                  >
                    <span>Complete and move to next section</span>
                    <CheckCircle size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="reasoning"
          className="bg-secondary dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors"
          ref={sectionRefs.reasoning}
        >
          <AccordionTrigger className="px-6 py-4 group text-left transition-colors">
            <div className="flex items-center w-full justify-between">
              <span className="text-lg font-medium">Reasoning</span>
              <div className="flex items-center">
                {isReasoningValid !== undefined && (
                  <span
                    className={cn(
                      "mr-3 text-sm px-2 py-1 rounded-full",
                      isReasoningValid
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    )}
                  >
                    {isReasoningValid ? "Valid" : "Invalid"}
                  </span>
                )}
                {isSectionCompleted("reasoning") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveToNextSection("reasoning");
                    }}
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6 dark:text-foreground">
            <div className="space-y-4">
              {/* Reasoning Card */}
              <div className="bg-white dark:bg-background p-4 rounded-md border border-border shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  How we came up with these values:
                </h4>
                <p className="text-foreground">{question.reasoning}</p>
              </div>

              {/* Buttons */}
              <div className="mt-4">
                <p className="mb-3 font-medium">Is this reasoning valid?</p>
                <div className="flex space-x-4">
                  {/* Valid button */}
                  <Button
                    variant={isReasoningValid === true ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isReasoningValid === true
                        ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                        : "bg-white dark:bg-background border border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/10"
                    )}
                    onClick={() => setIsReasoningValid(true)}
                  >
                    <ThumbsUp size={18} />
                    <span>Yes, valid reasoning</span>
                  </Button>

                  {/* Invalid button */}
                  <Button
                    variant={isReasoningValid === false ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isReasoningValid === false
                        ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white"
                        : "bg-white dark:bg-background border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/10"
                    )}
                    onClick={() => setIsReasoningValid(false)}
                  >
                    <ThumbsDown size={18} />
                    <span>No, invalid reasoning</span>
                  </Button>
                </div>
              </div>

              {/* Completion CTA */}
              {isSectionCompleted("reasoning") && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center mx-auto text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => moveToNextSection("reasoning")}
                  >
                    <span>Complete and move to next section</span>
                    <CheckCircle size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="missingValues"
          className="bg-secondary dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors"
          ref={sectionRefs.missingValues}
        >
          <AccordionTrigger className="px-6 py-4 group text-left transition-colors">
            <div className="flex items-center w-full justify-between">
              <span className="text-lg font-medium">Missing Values</span>
              <div className="flex items-center">
                {areMissingValuesCorrect !== undefined && (
                  <span
                    className={cn(
                      "mr-3 text-sm px-2 py-1 rounded-full",
                      areMissingValuesCorrect
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    )}
                  >
                    {areMissingValuesCorrect ? "Complete" : "Incomplete"}
                  </span>
                )}
                {isSectionCompleted("missingValues") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveToNextSection("missingValues");
                    }}
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6 dark:text-foreground">
            <div className="space-y-4">
              {/* Info Card */}
              <div className="bg-white dark:bg-background p-4 rounded-md border border-border shadow-sm">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Missing Values Assessment:
                </h4>
                <p className="text-foreground">{question.missingValues}</p>
              </div>

              {/* Buttons */}
              <div className="mt-4">
                <p className="mb-3 font-medium">
                  Are all necessary values included?
                </p>
                <div className="flex space-x-4">
                  {/* Complete */}
                  <Button
                    variant={
                      areMissingValuesCorrect === true ? "default" : "outline"
                    }
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      areMissingValuesCorrect === true
                        ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                        : "bg-white dark:bg-background border border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/10"
                    )}
                    onClick={() => setAreMissingValuesCorrect(true)}
                  >
                    <ThumbsUp size={18} />
                    <span>Yes, all values included</span>
                  </Button>

                  {/* Incomplete */}
                  <Button
                    variant={
                      areMissingValuesCorrect === false ? "default" : "outline"
                    }
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      areMissingValuesCorrect === false
                        ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white"
                        : "bg-white dark:bg-background border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/10"
                    )}
                    onClick={() => setAreMissingValuesCorrect(false)}
                  >
                    <ThumbsDown size={18} />
                    <span>No, missing important values</span>
                  </Button>
                </div>
              </div>

              {/* Completion CTA */}
              {isSectionCompleted("missingValues") && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center mx-auto text-green-600 dark:text-green-400 border-green-200 dark:border-green-900 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => moveToNextSection("missingValues")}
                  >
                    <span>Complete and move to next section</span>
                    <CheckCircle size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="feedback"
          className="bg-secondary dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors"
          ref={sectionRefs.feedback}
        >
          <AccordionTrigger className="px-6 py-4 group text-left transition-colors">
            <div className="flex items-center w-full justify-between">
              <span className="text-lg font-medium">Critical Feedback</span>
              <div className="flex items-center">
                {feedback && (
                  <span className="mr-3 text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Provided
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6 dark:text-foreground">
            <div className="space-y-4">
              <div
                className={cn(
                  "p-5 rounded-md border shadow-sm",
                  needsFeedback
                    ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                    : "bg-white dark:bg-background border-border"
                )}
              >
                <h4
                  className={cn(
                    "text-base font-medium mb-2",
                    needsFeedback
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                  )}
                >
                  {needsFeedback
                    ? "Your feedback is essential: Please explain why you marked sections as invalid"
                    : "Your expert feedback is highly valuable to us"}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {needsFeedback
                    ? "Your detailed insights will help us improve our medical data models."
                    : "Even if everything looks correct, please share any thoughts or suggestions you have."}
                </p>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    needsFeedback
                      ? "Please explain why you marked sections as invalid..."
                      : "Any insights or suggestions to improve this question..."
                  }
                  className="min-h-[120px] bg-white dark:bg-background border border-border"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Submit button */}
      <div className="mt-8 mb-12 text-center">
        <Button
          onClick={handleSubmit}
          disabled={!isFormCompleted() || isSubmitting}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-2 rounded-md"
          size="lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Annotation"}
          <Send className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
