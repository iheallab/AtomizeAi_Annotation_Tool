/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { Question, TaskGroup, Task, AnnotationResponse } from '@/types';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  ChevronDown,
  Tag,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import ReasoningIcon from '@/components/icons/ReasoningIcon';
import ContextIcon from '@/components/icons/ContextIcon';
import FeedbackIcon from '@/components/icons/FeedbackIcon';
import MissingIcon from '@/components/icons/MissingIcon';
import DataElementsIcon from '@/components/icons/DataElementsIcon';
import QAIcon from '@/components/icons/QAIcon';

interface AnnotationStepProps {
  question: Question;
  onSubmit: (response: Question) => Promise<void>;
}

export const AnnotationStep: React.FC<AnnotationStepProps> = ({
  question,
  onSubmit,
}) => {
  const questionCompleted = question.annotated_by === -1 ? false : true;
  const [activeAccordion, setActiveAccordion] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | undefined>(
    question.question_valid
  );
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(
    JSON.parse(JSON.stringify(question.tasks))
  );
  const [isReasoningValid, setIsReasoningValid] = useState<boolean | undefined>(
    question.reasoning_valid
  );
  const [areMissingValuesCorrect, setAreMissingValuesCorrect] = useState<
    boolean | undefined
  >(question.missing_data);
  const [feedback, setFeedback] = useState<string>(question.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState(
    questionCompleted ? true : false
  );
  // References for scrolling
  const sectionRefs = {
    questionContext: useRef<HTMLDivElement>(null),
    question: useRef<HTMLDivElement>(null),
    tasks: useRef<HTMLDivElement>(null),
    reasoning: useRef<HTMLDivElement>(null),
    missingValues: useRef<HTMLDivElement>(null),
    feedback: useRef<HTMLDivElement>(null),
  };

  // Reset state when question changes
  useEffect(() => {
    // console.log('question', question);
    setIsValid(question.question_valid ?? question.isValid);
    setTaskGroups(JSON.parse(JSON.stringify(question.tasks)));
    setIsReasoningValid(question.reasoning_valid ?? question.isReasoningValid);
    setAreMissingValuesCorrect(question.missing_data ?? question.isCompleted);
    setFeedback(question.feedback || '');
    setTasksCompleted(questionCompleted ? true : false);

    // Reset accordion state for completed questions or start with question section for new ones
    // if (question.annotated_by == 0) {
    setActiveAccordion('');
    // } else {
    setActiveAccordion('');
    // }
  }, [question]);

  // Your current scrolling effect:
  useEffect(() => {
    if (
      activeAccordion &&
      sectionRefs[activeAccordion as keyof typeof sectionRefs]?.current
    ) {
      setTimeout(() => {
        sectionRefs[
          activeAccordion as keyof typeof sectionRefs
        ].current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
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
                task.id === taskId ? { ...task, valid: enabled } : task
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
    setActiveAccordion(value === activeAccordion ? '' : value);
  };

  const moveToNextSection = (currentSection: string) => {
    const sections = [
      'questionContext',
      'question',
      'tasks',
      'missingValues',
      'reasoning',
      'feedback',
    ];
    const currentIndex = sections.indexOf(currentSection);

    if (currentIndex < sections.length - 1) {
      setActiveAccordion(sections[currentIndex + 1]);
    }
  };

  const handleSubmit = async () => {
    if (isValid) {
      if (
        isValid === undefined ||
        isReasoningValid === undefined ||
        areMissingValuesCorrect === undefined
      ) {
        return;
      }
    }

    if (needsFeedback && !feedback.trim()) {
      setActiveAccordion('feedback');
      return;
    }

    setIsSubmitting(true);
    //   id: string;
    // question: string;
    // context: string;
    // question_valid?: boolean;
    // tasks: TaskGroup[];
    // reasoning: string;
    // reasoning_valid?: boolean;
    // missing_data?: boolean;
    // feedback?: string;
    // categories: string[];
    // annotated_by: number;

    // {

    //   questionId: question.id,
    //   isValid: isValid || false,
    //   tasks: taskGroups,
    //   isReasoningValid: isReasoningValid || false,
    //   areMissingValuesCorrect: areMissingValuesCorrect || false,
    //   feedback: feedback.trim() || undefined,
    // }

    const response: Question = {
      id: question.id,
      _id: question._id,
      question: question.question,
      question_valid: isValid,
      context: question.context,
      tasks: taskGroups,
      missing_data: areMissingValuesCorrect,
      reasoning: question.reasoning,
      reasoning_valid: isReasoningValid,
      categories: question.categories,
      annotated_by: Number(JSON.parse(localStorage.getItem('user')).userId),
      feedback: feedback.trim(),
      // areMissingValuesCorrect: areMissingValuesCorrect || false,
      // feedback: feedback.trim() || undefined,
    };

    await onSubmit(response);
    setIsSubmitting(false);
  };

  // Check if a section is completed
  const isSectionCompleted = (section: string): boolean => {
    switch (section) {
      case 'question':
        return isValid !== undefined;
      case 'tasks':
        return tasksCompleted;
      case 'reasoning':
        return isReasoningValid !== undefined;
      case 'missingValues':
        return areMissingValuesCorrect !== undefined;
      case 'feedback':
        if (
          isValid &&
          tasksCompleted &&
          isReasoningValid &&
          areMissingValuesCorrect
        )
          return true;
        else if (needsFeedback && feedback.trim().length > 0) return true;
        else return false;
      default:
        return false;
    }
  };

  const isFormCompleted = (): boolean => {
    if (!isValid) {
      if (feedback.trim().length > 0) return true;
      else return false;
    }
    return (
      isValid !== undefined &&
      tasksCompleted &&
      isReasoningValid !== undefined &&
      areMissingValuesCorrect !== undefined &&
      (!needsFeedback || feedback.trim().length > 0)
    );
  };

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      {/* <div className="bg-white dark:bg-background rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"> */}
      <Accordion
        type='single'
        value={activeAccordion}
        onValueChange={handleAccordionChange}
        className='w-full'
        collapsible
      >
        {/* <AccordionItem
          value="question"
          className="border bg-card dark:border-border rounded-md mb-4 overflow-hidden shadow-sm"
          ref={sectionRefs.question}
        > */}

        {/* Clinical Context & Question Header */}
        <div
          ref={sectionRefs.questionContext}
          className=' bg-secondary dark:bg-secondary-dark border border-border rounded-2xl shadow-soft p-6 mb-6 space-y-4'
        >
          {/* Header with Icon */}
          <div className='flex items-center gap-3'>
            <ContextIcon className='w-9 h-9 text-muted-foreground' />
            <h2 className='text-2xl font-semibold'>
              Clinical Context & Question
            </h2>
          </div>

          {/* Tags */}
          <div className='flex flex-wrap gap-2'>
            {question.categories.map((category, index) => (
              <Badge
                key={index}
                className='bg-white dark:bg-background border border-border text-foreground flex items-center gap-1 px-2 py-1 rounded-md text-sm'
              >
                <Tag size={12} />
                {category}
              </Badge>
            ))}
          </div>

          {/* Clinical Context Card */}
          <div className='bg-white dark:bg-background p-5 rounded-md border border-border shadow-sm space-y-2'>
            <h4 className='text-lg font-medium text-muted-foreground'>
              Clinical Context:
            </h4>
            <p className='text-foreground text-base leading-relaxed'>
              {question.context}
            </p>
          </div>

          {/* Question */}
          <div className=' dark:bg-background p-2'>
            <h4 className='text-lg font-medium'>Question:</h4>
            <p className=''>{question.question}</p>
          </div>

          <div className='text-center'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center mx-auto text-black dark:text-white bg-white
             border border-border hover:bg-green hover:bg-muted dark:hover:bg-muted/20'
              onClick={() => setActiveAccordion('question')}
            >
              Start Annotation
            </Button>
          </div>
        </div>

        <AccordionItem
          value='question'
          className='bg-secondary dark:bg-secondary-dark border border-border dark:border-border rounded-2xl mb-6 shadow-soft transition-colors'
          ref={sectionRefs.question}
        >
          <AccordionTrigger className='px-6 py-4 group text-left transition-colors'>
            <div className='flex items-center w-full justify-between'>
              {/* <span className="text-lg font-medium">
                Clinical Context & Question
              </span> */}
              <div className='flex items-center gap-2'>
                <QAIcon className='w-9 h-9 text-muted-foreground' />
                <span className='text-lg font-medium'>Question Validity</span>
              </div>

              <div className='flex items-center'>
                {/* {isValid !== undefined && (
                  <span
                    className={cn(
                      'mr-3 text-sm px-2 py-1 rounded-full',
                      isValid
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    )}
                  >
                    {isValid ? 'Valid' : 'Invalid'}
                  </span>
                )} */}
                {isSectionCompleted('question') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                    onClick={(e) => {
                      e.stopPropagation();
                      // moveToNextSection('question');
                      handleAccordionChange('question');
                    }}
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-6 pb-6 dark:text-foreground'>
            <div className='space-y-4'>
              <div className='mt-4'>
                <p className='mb-3 font-medium'>
                  Would you ask this question about a patient you are caring for
                  in the provided context?
                </p>
                <div className='flex space-x-4'>
                  {/* Valid Button */}
                  <Button
                    variant={isValid === true ? 'default' : 'outline'}
                    size='sm'
                    className={cn(
                      'flex items-center space-x-2',
                      isValid === true
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                        : 'bg-white dark:bg-background border border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/10'
                    )}
                    onClick={() => {
                      setIsValid(true);
                      if (taskGroups.length === 0) {
                        setTaskGroups(
                          JSON.parse(JSON.stringify(question.tasks))
                        );
                      }
                    }}
                  >
                    <ThumbsUp size={18} />
                    <span>Yes, valid question</span>
                  </Button>

                  {/* Invalid Button */}
                  <Button
                    variant={isValid === false ? 'default' : 'outline'}
                    size='sm'
                    className={cn(
                      'flex items-center space-x-2',
                      isValid === false
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'
                        : 'bg-white dark:bg-background border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/10'
                    )}
                    onClick={() => {
                      setIsValid(false);
                      setTaskGroups([]);
                      setAreMissingValuesCorrect(undefined);
                      setIsReasoningValid(undefined);
                    }}
                  >
                    <ThumbsDown size={18} />
                    <span>No, invalid question</span>
                  </Button>
                </div>
              </div>

              {isSectionCompleted('question') && (
                <div className='mt-6 text-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center mx-auto  bg-white text-black dark:text-white border:black-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    onClick={() => {
                      if (isValid === false) {
                        moveToNextSection('reasoning');
                      } else {
                        moveToNextSection('question');
                      }
                    }}
                  >
                    <span>Complete and move to next section</span>
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value='tasks'
          className={`
            ${
              isValid === false ? 'bg-gray-300' : 'bg-secondary'
            } dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors`}
          ref={sectionRefs.tasks}
          disabled={isValid === false}
        >
          <AccordionTrigger className='px-6 py-4 group text-left transition-colors'>
            <div className='flex items-center w-full justify-between'>
              <div className='flex items-center gap-2'>
                <DataElementsIcon className='w-9 h-9 text-muted-foreground' />
                <span className='text-lg font-medium'>
                  Required Data Elements
                </span>
              </div>
              <div className='flex items-center'>
                {/* {taskGroups.some((group) =>
                  group.tasks.some((t) => t.valid)
                ) && (
                  <span className='mr-3 text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'>
                    {
                      taskGroups.flatMap((g) => g.tasks).filter((t) => t.valid)
                        .length
                    }{' '}
                    selected
                  </span>
                )} */}
                {isValid === false ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    onClick={(e) => {
                      e.stopPropagation();
                      // moveToNextSection('tasks');
                      handleAccordionChange('tasks');
                    }}
                  >
                    Not Required
                  </Button>
                ) : (
                  isSectionCompleted('tasks') && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      onClick={(e) => {
                        e.stopPropagation();
                        // moveToNextSection('tasks');
                        handleAccordionChange('tasks');
                      }}
                    >
                      <CheckCircle size={20} />
                    </Button>
                  )
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-6 pb-6 dark:text-foreground'>
            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Select the data elements (if any) that are necessary to answer
                this question:
              </p>

              {/* <div className="space-y-6"> */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {taskGroups.map((group) => (
                  <div
                    key={group.id}
                    className='bg-white dark:bg-background border border-border rounded-lg p-4 shadow-sm'
                  >
                    <h3 className='font-medium text-lg mb-3'>{group.name}</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {group.tasks.map((task) => (
                        <div
                          key={task.id}
                          className='flex items-center justify-between p-3 border border-border rounded-md bg-white dark:bg-background transition-colors'
                        >
                          <span className='font-medium'>{task.name}</span>
                          <Switch
                            checked={task.valid}
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

              <div className='mt-6 text-center'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center mx-auto text-black dark:text-white border:black-600rk:border-green-900 bg-white 
                   hover:bg-green-50 dark:hover:bg-green-900/20'
                  onClick={() => {
                    setTasksCompleted(true);
                    moveToNextSection('tasks');
                  }}
                >
                  <span>Complete and move to next section</span>
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value='missingValues'
          className={`
            ${
              isValid === false ? 'bg-gray-300' : 'bg-secondary'
            } dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors`}
          ref={sectionRefs.missingValues}
          disabled={isValid === false}
        >
          <AccordionTrigger className='px-6 py-4 group text-left transition-colors'>
            <div className='flex items-center w-full justify-between'>
              <div className='flex items-center gap-2'>
                <MissingIcon className='w-9 h-9 text-muted-foreground' />
                <span className='text-lg font-medium'>
                  Missing Data Elements
                </span>
              </div>
              <div className='flex items-center'>
                {/* {areMissingValuesCorrect !== undefined && (
                  <span
                    className={cn(
                      'mr-3 text-sm px-2 py-1 rounded-full',
                      areMissingValuesCorrect
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    )}
                  >
                    {areMissingValuesCorrect ? 'Valid' : 'Invalid'}
                  </span>
                )} */}
                {isValid === false ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    onClick={(e) => {
                      e.stopPropagation();
                      // moveToNextSection('tasks');
                      handleAccordionChange('tasks');
                    }}
                  >
                    Not Required
                  </Button>
                ) : (
                  isSectionCompleted('missingValues') && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      onClick={(e) => {
                        e.stopPropagation();
                        // moveToNextSection('missingValues');
                        handleAccordionChange('missingValues');
                      }}
                    >
                      <CheckCircle size={20} />
                    </Button>
                  )
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-6 pb-6 dark:text-foreground'>
            <div className='space-y-4'>
              {/* Info Card */}
              <div className='bg-white dark:bg-background p-4 rounded-md border border-border shadow-sm'>
                <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                  Missing Values Assessment:
                </h4>
                <p className='text-foreground'>
                  Do the tasks retrieve all relevant data that you would search
                  on an EHR system to answer the question?
                </p>
              </div>

              {/* Buttons */}
              <div className='mt-4'>
                <p className='mb-3 font-medium'>
                  Are all necessary values included?
                </p>
                <div className='flex space-x-4'>
                  {/* Complete */}
                  <Button
                    variant={
                      areMissingValuesCorrect === true ? 'default' : 'outline'
                    }
                    size='sm'
                    className={cn(
                      'flex items-center space-x-2',
                      areMissingValuesCorrect === true
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                        : 'bg-white dark:bg-background border border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/10'
                    )}
                    onClick={() => setAreMissingValuesCorrect(true)}
                  >
                    <ThumbsUp size={18} />
                    <span>Yes</span>
                  </Button>

                  {/* Incomplete */}
                  <Button
                    variant={
                      areMissingValuesCorrect === false ? 'default' : 'outline'
                    }
                    size='sm'
                    className={cn(
                      'flex items-center space-x-2',
                      areMissingValuesCorrect === false
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'
                        : 'bg-white dark:bg-background border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/10'
                    )}
                    onClick={() => setAreMissingValuesCorrect(false)}
                  >
                    <ThumbsDown size={18} />
                    <span>No</span>
                  </Button>
                </div>
              </div>

              {/* Completion CTA */}
              {isSectionCompleted('missingValues') && isValid && (
                <div className='mt-6 text-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center mx-auto  bg-white text-black dark:text-white border:black-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    onClick={() => moveToNextSection('missingValues')}
                  >
                    <span>Complete and move to next section</span>
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value='reasoning'
          className={`
            ${
              isValid === false ? 'bg-gray-300' : 'bg-secondary'
            } dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors`}
          ref={sectionRefs.reasoning}
          disabled={isValid === false}
        >
          <AccordionTrigger className='px-6 py-4 group text-left transition-colors'>
            <div className='flex items-center w-full justify-between'>
              <div className='flex items-center gap-2'>
                <ReasoningIcon className='w-9 h-9 text-muted-foreground' />
                <span className='text-lg font-medium'>Reasoning</span>
              </div>
              <div className='flex items-center'>
                {/* {isReasoningValid !== undefined && (
                  <span
                    className={cn(
                      'mr-3 text-sm px-2 py-1 rounded-full',
                      isReasoningValid
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    )}
                  >
                    {isReasoningValid ? 'Valid' : 'Invalid'}
                  </span>
                )} */}
                {isValid === false ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    onClick={(e) => {
                      e.stopPropagation();
                      // moveToNextSection('tasks');
                      handleAccordionChange('tasks');
                    }}
                  >
                    Not Required
                  </Button>
                ) : (
                  isSectionCompleted('reasoning') &&
                  isValid && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      onClick={(e) => {
                        e.stopPropagation();
                        // moveToNextSection('reasoning');
                        handleAccordionChange('reasoning');
                      }}
                    >
                      <CheckCircle size={20} />
                    </Button>
                  )
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-6 pb-6 dark:text-foreground'>
            <div className='space-y-4'>
              {/* Reasoning Card */}
              <div className='bg-white dark:bg-background p-4 rounded-md border border-border shadow-sm'>
                <h4 className='text-sm font-medium text-muted-foreground mb-2'>
                  How we came up with these values:
                </h4>
                <p className='text-foreground'>{question.reasoning}</p>
              </div>

              {/* Buttons */}
              <div className='mt-4'>
                <p className='mb-3 font-medium'>Is the Reasoning Valid?</p>
                <div className='flex space-x-4'>
                  {/* Valid button */}
                  <Button
                    variant={isReasoningValid === true ? 'default' : 'outline'}
                    size='sm'
                    className={cn(
                      'flex items-center space-x-2',
                      isReasoningValid === true
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                        : 'bg-white dark:bg-background border border-border text-foreground hover:bg-green-50 dark:hover:bg-green-900/10'
                    )}
                    onClick={() => setIsReasoningValid(true)}
                  >
                    <ThumbsUp size={18} />
                    <span>Yes, valid reasoning</span>
                  </Button>

                  {/* Invalid button */}
                  <Button
                    variant={isReasoningValid === false ? 'default' : 'outline'}
                    size='sm'
                    className={cn(
                      'flex items-center space-x-2',
                      isReasoningValid === false
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'
                        : 'bg-white dark:bg-background border border-border text-foreground hover:bg-red-50 dark:hover:bg-red-900/10'
                    )}
                    onClick={() => setIsReasoningValid(false)}
                  >
                    <ThumbsDown size={18} />
                    <span>No, invalid reasoning</span>
                  </Button>
                </div>
              </div>

              {/* Completion CTA */}
              {isSectionCompleted('reasoning') && (
                <div className='mt-6 text-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center mx-auto  bg-white text-black dark:text-white border:black-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    onClick={() => moveToNextSection('reasoning')}
                  >
                    <span>Complete and move to next section</span>
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value='feedback'
          className='bg-secondary dark:bg-secondary-dark border border-border rounded-2xl mb-6 shadow-soft transition-colors'
          ref={sectionRefs.feedback}
        >
          <AccordionTrigger className='px-6 py-4 group text-left transition-colors'>
            <div className='flex items-center w-full justify-between'>
              <div className='flex items-center gap-2'>
                <FeedbackIcon className='w-9 h-9 text-muted-foreground' />
                <span className='text-lg font-medium'>Critical Feedback</span>
              </div>
              <div className='flex items-center'>
                {isSectionCompleted('feedback') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccordionChange('feedback');
                    }}
                  >
                    <CheckCircle size={20} />
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-6 pb-6 dark:text-foreground'>
            <div className='space-y-4'>
              <div
                className={cn(
                  'p-5 rounded-md border shadow-sm',
                  needsFeedback
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                    : 'bg-white dark:bg-background border-border'
                )}
              >
                <h4
                  className={cn(
                    'text-base font-medium mb-2',
                    needsFeedback
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-foreground'
                  )}
                >
                  {needsFeedback
                    ? 'Your feedback is essential: Please explain why you marked sections as invalid'
                    : 'Your feedback is critical to improving the clinical relevance of our work'}
                </h4>
                <p className='text-sm text-muted-foreground mb-4'>
                  {needsFeedback
                    ? 'Your detailed insights will help improving the clinical relevance of our work'
                    : 'Even if everything looks correct, please share any thoughts or suggestions you have.'}
                </p>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    needsFeedback
                      ? 'Please explain why you marked sections as invalid...'
                      : 'Any insights or suggestions to improve this question...'
                  }
                  className='min-h-[120px] bg-white dark:bg-background border border-border'
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Submit button */}
      <div className='mt-8 mb-12 text-center'>
        <Button
          onClick={handleSubmit}
          disabled={!isFormCompleted() || isSubmitting}
          className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-2 rounded-md'
          size='lg'
        >
          {isSubmitting ? 'Submitting...' : 'Submit Annotation'}
          <Send className='ml-2 h-5 w-5' />
        </Button>
      </div>
    </div>
  );
};
