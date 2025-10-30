/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import {
  Question,
  TaskGroup,
  Task,
  AddedTask,
  AnnotationResponse,
  Variable,
} from '@/types';

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
  Tag,
  Send,
  Replace,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import ReasoningIcon from '@/components/icons/ReasoningIcon';
import ContextIcon from '@/components/icons/ContextIcon';
import FeedbackIcon from '@/components/icons/FeedbackIcon';
import MissingIcon from '@/components/icons/MissingIcon';
import DataElementsIcon from '@/components/icons/DataElementsIcon';
import QAIcon from '@/components/icons/QAIcon';
import { AddTask } from '@/components/AddTask';
import { userAtom } from '@/atoms/atoms';
import { useAtomValue } from 'jotai';

interface AnnotationStepProps {
  question: Question;
  onSubmit: (response: Question) => Promise<void>;
  onSkip: () => Promise<void>;
}

export const AnnotationStep: React.FC<AnnotationStepProps> = ({
  question,
  onSubmit,
  onSkip,
}) => {
  const user = useAtomValue(userAtom);
  const hardCodedUserIds = [14, 22, 26];
  const hardCodedNotEnabledUser = hardCodedUserIds.includes(user.userId);

  const questionCompleted = question?.annotated_by === -1 ? false : true;
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
  const [isSkipping, setIsSkipping] = useState(false);
  const [skipPopover, setSkipPopover] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState(
    questionCompleted ? true : false
  );
  const [showAddTask, setShowAddTask] = useState(false);
  const [addedMissingTasks, setAddedMissingTasks] = useState<AddedTask[]>(
    question.added_tasks || []
  );
  const [existingTaskIds, setExistingTaskIds] = useState<Set<string>>(
    new Set((question.added_tasks || []).map((task) => task.id))
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
    setIsValid(question.question_valid ?? question.isValid);
    setTaskGroups(JSON.parse(JSON.stringify(question.tasks)));
    setIsReasoningValid(question.reasoning_valid ?? question.isReasoningValid);
    setAreMissingValuesCorrect(question.missing_data ?? question.isCompleted);
    setFeedback(question.feedback || '');
    setTasksCompleted(questionCompleted ? true : false);
    setShowAddTask(false);
    setAddedMissingTasks(question.added_tasks || []);
    setExistingTaskIds(
      new Set((question.added_tasks || []).map((task) => task.id))
    );

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

  const disableAllTasks = () => {
    setTaskGroups((prev) =>
      prev.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) => ({
          ...task,
          valid: false,
        })),
      }))
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
      annotated_by: user.userId,
      feedback: feedback.trim(),
      model: question.model,
      batch_id: question.batch_id,
      added_tasks: addedMissingTasks,
      // areMissingValuesCorrect: areMissingValuesCorrect || false,
      // feedback: feedback.trim() || undefined,
    };

    await onSubmit(response);
    setIsSubmitting(false);
  };
  const handleSkip = async () => {
    setIsSkipping(true);
    await onSkip();
    setIsSkipping(false);
  };

  const handleAddMissingTasks = (
    variables: Variable[],
    categoryName: string
  ) => {
    const newTasks: AddedTask[] = variables.map((variable, index) => ({
      id: `missing-task-${Date.now()}-${index}`,
      name: variable.name,
      conceptId: variable.conceptId,
      category: variable.category || categoryName, // Use individual category if available, fallback to categoryName
      variable: variable.name,
      description: variable.description,
      valid: true,
    }));

    setAddedMissingTasks((prev) => [...prev, ...newTasks]);
    setShowAddTask(false);
  };

  const handleCancelAddTask = () => {
    setShowAddTask(false);
  };

  const handleRemoveAddedTask = (taskId: string) => {
    setAddedMissingTasks((prev) => prev.filter((task) => task.id !== taskId));
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
        // If user says "Yes" (true), section is complete
        if (areMissingValuesCorrect === true) {
          return true;
        }
        // If user says "No" (false), only complete if they added missing elements
        if (areMissingValuesCorrect === false) {
          return hardCodedNotEnabledUser ? true : addedMissingTasks.length > 0;
        }
        // If undefined, not complete
        return false;
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

    // Check if missing values section is properly completed
    const isMissingValuesProperlyCompleted = () => {
      // If user says "Yes" (true), section is complete
      if (areMissingValuesCorrect === true) {
        return true;
      }
      // If user says "No" (false), only complete if they added missing elements
      if (areMissingValuesCorrect === false) {
        return hardCodedNotEnabledUser ? true : addedMissingTasks.length > 0;
      }
      // If undefined, not complete
      return false;
    };

    return (
      isValid !== undefined &&
      tasksCompleted &&
      isReasoningValid !== undefined &&
      isMissingValuesProperlyCompleted() &&
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
            {question.categories
              .sort((a, b) => a.localeCompare(b))
              .map((category, index) => (
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

          <div className='relative w-full h-10'>
            {/* Centered Button */}
            <div className='absolute left-1/2 top-0 transform -translate-x-1/2'>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center text-black dark:text-white bg-white
        border border-border hover:bg-green hover:bg-muted dark:hover:bg-muted/20'
                onClick={() => setActiveAccordion('question')}
              >
                Start Annotation
              </Button>
            </div>

            {/* Right-aligned Button */}
            <div className='absolute right-0 top-0'>
              <Button
                onClick={() => setSkipPopover(true)}
                disabled={questionCompleted || isSkipping}
                className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white border border-border'
                size='sm'
              >
                {isSkipping ? 'Skipping...' : 'Skip'}
              </Button>
            </div>
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
                      disableAllTasks();
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
                          <span className='font-medium break-words max-w-[65%]'>
                            {task.name}
                          </span>
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
                    onClick={() => {
                      setAreMissingValuesCorrect(true);
                      setShowAddTask(false);
                    }}
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
                    onClick={() => {
                      setAreMissingValuesCorrect(false);
                      if (!hardCodedNotEnabledUser) {
                        setShowAddTask(true);
                      } else {
                        setShowAddTask(false);
                      }
                    }}
                  >
                    <ThumbsDown size={18} />
                    <span>No</span>
                  </Button>
                </div>
              </div>

              {/* Add Task Component */}
              {!hardCodedNotEnabledUser && showAddTask && (
                <div className='mt-6'>
                  <AddTask
                    onAddTasks={handleAddMissingTasks}
                    onCancel={handleCancelAddTask}
                  />
                </div>
              )}

              {/* Added Missing Tasks Display */}
              {/* Debug: {JSON.stringify(addedMissingTasks)} */}
              {/* Debug IDs: {addedMissingTasks.map(t => t.id).join(', ')} */}
              {!hardCodedNotEnabledUser && addedMissingTasks.length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-sm font-medium mb-2'>
                    Added Missing Data Elements:
                  </h4>

                  {/* Existing Tasks (from database) */}
                  {addedMissingTasks.filter((task) =>
                    existingTaskIds.has(task.id)
                  ).length > 0 && (
                    <div className='mb-4'>
                      <h5 className='text-xs font-medium text-muted-foreground mb-2'>
                        Previously Saved:
                      </h5>
                      <div className='space-y-2'>
                        {addedMissingTasks
                          .filter((task) => existingTaskIds.has(task.id))
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((task) => {
                            const isCustom =
                              task.conceptId &&
                              task.conceptId.startsWith('CUSTOM');
                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between p-3 border rounded-lg ${
                                  isCustom
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                }`}
                              >
                                <div className='flex-1'>
                                  <div className='text-sm font-medium'>
                                    {task.name}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    Category: {task.category} | Concept ID:{' '}
                                    {task.conceptId}
                                  </div>
                                  {task.description && (
                                    <div className='text-xs text-muted-foreground mt-1'>
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    variant='secondary'
                                    className={`text-xs ${
                                      isCustom
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : ''
                                    }`}
                                  >
                                    {isCustom ? 'Custom' : 'Added'}
                                  </Badge>
                                  <button
                                    onClick={() =>
                                      handleRemoveAddedTask(task.id)
                                    }
                                    className='text-red-500 hover:text-red-700 p-1'
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Pending Tasks (newly added, not yet saved) */}
                  {addedMissingTasks.filter(
                    (task) => !existingTaskIds.has(task.id)
                  ).length > 0 && (
                    <div>
                      <h5 className='text-xs font-medium text-muted-foreground mb-2'>
                        Pending (will be saved):
                      </h5>
                      <div className='space-y-2'>
                        {addedMissingTasks
                          .filter((task) => !existingTaskIds.has(task.id))
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((task) => {
                            const isCustom =
                              task.conceptId &&
                              task.conceptId.startsWith('CUSTOM');
                            return (
                              <div
                                key={task.id}
                                className={`flex items-center justify-between p-3 border rounded-lg ${
                                  isCustom
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                } border-dashed`}
                              >
                                <div className='flex-1'>
                                  <div className='text-sm font-medium'>
                                    {task.name}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    Category: {task.category} | Concept ID:{' '}
                                    {task.conceptId}
                                  </div>
                                  {task.description && (
                                    <div className='text-xs text-muted-foreground mt-1'>
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    variant='secondary'
                                    className={`text-xs ${
                                      isCustom
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    }`}
                                  >
                                    {isCustom ? 'Custom' : 'Pending'}
                                  </Badge>
                                  <button
                                    onClick={() =>
                                      handleRemoveAddedTask(task.id)
                                    }
                                    className='text-red-500 hover:text-red-700 p-1'
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add More Missing Data Elements Button - Always visible when "No" is selected */}
              {!hardCodedNotEnabledUser &&
                areMissingValuesCorrect === false && (
                  <div className='mt-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowAddTask(true)}
                      className='flex items-center gap-2'
                    >
                      <Plus size={16} />
                      {addedMissingTasks.length > 0
                        ? 'Add More Missing Data Elements'
                        : 'Add Missing Data Elements'}
                    </Button>
                  </div>
                )}

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
      <div className='text-center'>
        <Button
          onClick={handleSubmit}
          disabled={!isFormCompleted() || isSubmitting}
          className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-2 rounded-md'
          size='sm'
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {skipPopover && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white dark:bg-background rounded-lg shadow-lg p-6 max-w-md w-full'>
            <h3 className='text-lg font-semibold mb-4'>Skip Question</h3>
            <p className='text-sm text-muted-foreground mb-6'>
              Are you sure you want to skip this question? Once skipped, this
              question will not be reassigned to you.
            </p>
            <div className='flex justify-end gap-4'>
              <Button
                variant='outline'
                size='sm'
                className='text-black dark:text-white bg-white border border-border hover:bg-muted dark:hover:bg-muted/20'
                onClick={() => setSkipPopover(false)}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                className='bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white border border-border'
                onClick={async () => {
                  setSkipPopover(false);
                  await handleSkip();
                }}
              >
                Confirm Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
