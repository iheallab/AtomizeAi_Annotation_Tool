import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  questionAssignmentSummaryUrl,
  annotatorProgressUrl,
  addUserUrl,
  addAssignmentUrl,
} from '@/apis/api_url';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Plus,
  UserPlus,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuestionDetail {
  question_id: number;
  user_ids: number[];
  count: number;
}

interface AssignmentCategory {
  count: number;
  questions: QuestionDetail[];
}

interface QuestionAssignmentSummary {
  total_questions: number;
  less_than_twice: AssignmentCategory;
  exactly_twice: AssignmentCategory;
  more_than_twice: AssignmentCategory;
}

interface QuestionAssignmentResponse {
  summary: QuestionAssignmentSummary;
  detailed_counts: Record<number, number>;
}

interface AnnotatorProgress {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAssigned: number;
  completed: number;
  skipped: number;
  completionRate: number;
  isFinished: boolean;
  lastActive: string;
  assignedQuestions: number[];
  completedQuestions: number[];
  skippedQuestions: number[];
}

interface AnnotatorProgressResponse {
  annotators: AnnotatorProgress[];
  summary: {
    totalAnnotators: number;
    finishedAnnotators: number;
    averageCompletion: number;
  };
}

type SortField = 'question_id' | 'count' | 'user_ids';
type SortDirection = 'asc' | 'desc';

type AnnotatorSortField =
  | 'username'
  | 'completionRate'
  | 'totalAssigned'
  | 'completed'
  | 'skipped'
  | 'lastActive'
  | 'historicalCompleted';
type AnnotatorSortDirection = 'asc' | 'desc';

interface CategoryState {
  isExpanded: boolean;
  currentPage: number;
  sortField: SortField;
  sortDirection: SortDirection;
}

interface AnnotatorState {
  isExpanded: boolean;
  currentPage: number;
  sortField: AnnotatorSortField;
  sortDirection: AnnotatorSortDirection;
}

const ITEMS_PER_PAGE = 10;

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<QuestionAssignmentSummary>({
    total_questions: 0,
    less_than_twice: { count: 0, questions: [] },
    exactly_twice: { count: 0, questions: [] },
    more_than_twice: { count: 0, questions: [] },
  });
  const [detailedCounts, setDetailedCounts] = useState<Record<number, number>>(
    {}
  );
  const [categoryStates, setCategoryStates] = useState<
    Record<string, CategoryState>
  >({
    less_than_twice: {
      isExpanded: false,
      currentPage: 1,
      sortField: 'question_id',
      sortDirection: 'asc',
    },
    exactly_twice: {
      isExpanded: false,
      currentPage: 1,
      sortField: 'question_id',
      sortDirection: 'asc',
    },
    more_than_twice: {
      isExpanded: false,
      currentPage: 1,
      sortField: 'question_id',
      sortDirection: 'asc',
    },
  });
  const [annotatorProgress, setAnnotatorProgress] =
    useState<AnnotatorProgressResponse>({
      annotators: [],
      summary: {
        totalAnnotators: 0,
        finishedAnnotators: 0,
        averageCompletion: 0,
      },
    });
  const [annotatorState, setAnnotatorState] = useState<AnnotatorState>({
    isExpanded: true,
    currentPage: 1,
    sortField: 'completionRate',
    sortDirection: 'desc',
  });
  const [selectedAnnotator, setSelectedAnnotator] =
    useState<AnnotatorProgress | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAssignQuestionsModalOpen, setIsAssignQuestionsModalOpen] =
    useState(false);
  const [selectedUserForAssignment, setSelectedUserForAssignment] =
    useState<AnnotatorProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAssigningQuestions, setIsAssigningQuestions] = useState(false);

  // Add User Form State
  const [addUserForm, setAddUserForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    specialization: '',
  });

  // Assign Questions Form State
  const [assignQuestionsForm, setAssignQuestionsForm] = useState({
    questionCount: 25,
  });

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please log in again',
        });
        return;
      }

      // Fetch question assignment summary
      const statsResponse = await fetch(questionAssignmentSummaryUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          toast({
            variant: 'destructive',
            title: 'Unauthorized',
            description: "You don't have permission to access this page",
          });
          return;
        }
        throw new Error('Failed to fetch admin data');
      }

      const data: QuestionAssignmentResponse = await statsResponse.json();

      if (data.summary) {
        setSummary(data.summary);
      }

      if (data.detailed_counts) {
        setDetailedCounts(data.detailed_counts);
      }

      // Fetch annotator progress
      const annotatorResponse = await fetch(annotatorProgressUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      if (annotatorResponse.ok) {
        const annotatorData: AnnotatorProgressResponse =
          await annotatorResponse.json();
        setAnnotatorProgress(annotatorData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load admin dashboard data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [toast]);

  const toggleCategory = (category: string) => {
    setCategoryStates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        isExpanded: !prev[category].isExpanded,
        currentPage: 1, // Reset to first page when expanding
      },
    }));
  };

  const changePage = (category: string, newPage: number) => {
    setCategoryStates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        currentPage: newPage,
      },
    }));
  };

  const handleSort = (category: string, field: SortField) => {
    setCategoryStates((prev) => {
      const currentState = prev[category];
      const newDirection =
        currentState.sortField === field && currentState.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      return {
        ...prev,
        [category]: {
          ...currentState,
          sortField: field,
          sortDirection: newDirection,
          currentPage: 1, // Reset to first page when sorting
        },
      };
    });
  };

  const sortQuestions = (
    questions: QuestionDetail[],
    sortField: SortField,
    sortDirection: SortDirection
  ) => {
    if (!questions) return [];
    return [...questions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'question_id':
          comparison = a.question_id - b.question_id;
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'user_ids':
          // Sort by the number of user IDs, then by the first user ID if counts are equal
          comparison = a.user_ids.length - b.user_ids.length;
          if (
            comparison === 0 &&
            a.user_ids.length > 0 &&
            b.user_ids.length > 0
          ) {
            comparison = a.user_ids[0] - b.user_ids[0];
          }
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const getPaginatedQuestions = (
    questions: QuestionDetail[],
    currentPage: number
  ) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return questions.slice(startIndex, endIndex);
  };

  const getTotalPages = (questions: QuestionDetail[]) => {
    return Math.ceil(questions.length / ITEMS_PER_PAGE);
  };

  const getSortIcon = (category: string, field: SortField) => {
    const state = categoryStates[category];
    if (state.sortField !== field) {
      return <ArrowUpDown className='h-4 w-4' />;
    }
    return state.sortDirection === 'asc' ? (
      <ChevronUp className='h-4 w-4' />
    ) : (
      <ChevronDown className='h-4 w-4' />
    );
  };

  const toggleAnnotatorSection = () => {
    setAnnotatorState((prev) => ({
      ...prev,
      isExpanded: !prev.isExpanded,
      currentPage: 1,
    }));
  };

  const changeAnnotatorPage = (newPage: number) => {
    setAnnotatorState((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleAnnotatorSort = (field: AnnotatorSortField) => {
    setAnnotatorState((prev) => {
      const newDirection =
        prev.sortField === field && prev.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

      return {
        ...prev,
        sortField: field,
        sortDirection: newDirection,
        currentPage: 1,
      };
    });
  };

  const sortAnnotators = (
    annotators: AnnotatorProgress[],
    sortField: AnnotatorSortField,
    sortDirection: AnnotatorSortDirection
  ) => {
    return [...annotators].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'completionRate':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'totalAssigned':
          comparison = a.totalAssigned - b.totalAssigned;
          break;
        case 'completed':
          comparison = a.completed - b.completed;
          break;
        case 'skipped':
          comparison = a.skipped - b.skipped;
          break;
        case 'lastActive':
          comparison =
            new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
        case 'historicalCompleted':
          comparison =
            a.completedQuestions.length -
            a.completed -
            (b.completedQuestions.length - b.completed);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const getAnnotatorSortIcon = (field: AnnotatorSortField) => {
    if (annotatorState.sortField !== field) {
      return <ArrowUpDown className='h-4 w-4' />;
    }
    return annotatorState.sortDirection === 'asc' ? (
      <ChevronUp className='h-4 w-4' />
    ) : (
      <ChevronDown className='h-4 w-4' />
    );
  };

  const getPaginatedAnnotators = (
    annotators: AnnotatorProgress[],
    currentPage: number
  ) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return annotators.slice(startIndex, endIndex);
  };

  const getAnnotatorTotalPages = (annotators: AnnotatorProgress[]) => {
    return Math.ceil(annotators.length / ITEMS_PER_PAGE);
  };

  const getStatusIcon = (isFinished: boolean, completionRate: number) => {
    if (isFinished) {
      return <CheckCircle className='h-4 w-4 text-green-600' />;
    } else if (completionRate > 0) {
      return <Clock className='h-4 w-4 text-yellow-600' />;
    } else {
      return <AlertCircle className='h-4 w-4 text-red-600' />;
    }
  };

  const getStatusBadge = (isFinished: boolean, completionRate: number) => {
    if (isFinished) {
      return <Badge className='bg-green-100 text-green-800'>Completed</Badge>;
    } else if (completionRate > 0) {
      return (
        <Badge className='bg-yellow-100 text-yellow-800'>In Progress</Badge>
      );
    } else {
      return <Badge className='bg-red-100 text-red-800'>Not Started</Badge>;
    }
  };

  const handleAnnotatorRowClick = (annotator: AnnotatorProgress) => {
    setSelectedAnnotator(annotator);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAnnotator(null);
  };

  const openAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setAddUserForm({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      specialization: '',
    });
  };

  const openAssignQuestionsModal = (annotator: AnnotatorProgress) => {
    setSelectedUserForAssignment(annotator);
    setIsAssignQuestionsModalOpen(true);
  };

  const closeAssignQuestionsModal = () => {
    setIsAssignQuestionsModalOpen(false);
    setSelectedUserForAssignment(null);
    setAssignQuestionsForm({ questionCount: 25 });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);

    try {
      const token = user?.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please log in again',
        });
        return;
      }

      const response = await fetch(addUserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addUserForm),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `User ${result.username} added successfully with ID: ${result.userID}`,
        });
        closeAddUserModal();
        // Refresh annotator data
        fetchAdminData();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.message || 'Failed to add user',
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add user',
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleAssignQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigningQuestions(true);

    if (!selectedUserForAssignment) return;

    try {
      const token = user?.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please log in again',
        });
        return;
      }

      const response = await fetch(
        `${addAssignmentUrl}?user_id=${selectedUserForAssignment.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ count: assignQuestionsForm.questionCount }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `Assigned ${result.assigned_ids.length} questions to ${selectedUserForAssignment.username}`,
        });
        closeAssignQuestionsModal();
        // Refresh annotator data
        fetchAdminData();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.message || 'Failed to assign questions',
        });
      }
    } catch (error) {
      console.error('Error assigning questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign questions',
      });
    } finally {
      setIsAssigningQuestions(false);
    }
  };

  const renderCategoryTable = (
    category: string,
    questions: QuestionDetail[],
    title: string,
    color: string
  ) => {
    const state = categoryStates[category];
    const sortedQuestions = sortQuestions(
      questions,
      state.sortField,
      state.sortDirection
    );
    const totalPages = getTotalPages(sortedQuestions);
    const paginatedQuestions = getPaginatedQuestions(
      sortedQuestions,
      state.currentPage
    );

    return (
      <div className='border rounded-lg p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className={`text-lg font-semibold ${color}`}>
            {title} ({questions?.length || 0})
          </h3>
          <Button
            variant='outline'
            size='sm'
            onClick={() => toggleCategory(category)}
            className='flex items-center gap-2'
          >
            {state.isExpanded ? (
              <>
                <ChevronUp className='h-4 w-4' />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className='h-4 w-4' />
                Expand
              </>
            )}
          </Button>
        </div>

        {state.isExpanded && (
          <div className='space-y-4'>
            {!questions || questions.length === 0 ? (
              <p className='text-muted-foreground text-center py-4'>
                No questions in this category
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort(category, 'question_id')}
                          className='h-auto p-0 font-semibold hover:bg-transparent'
                        >
                          Question ID
                          <span className='ml-1'>
                            {getSortIcon(category, 'question_id')}
                          </span>
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort(category, 'count')}
                          className='h-auto p-0 font-semibold hover:bg-transparent'
                        >
                          Assignment Count
                          <span className='ml-1'>
                            {getSortIcon(category, 'count')}
                          </span>
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant='ghost'
                          onClick={() => handleSort(category, 'user_ids')}
                          className='h-auto p-0 font-semibold hover:bg-transparent'
                        >
                          User IDs
                          <span className='ml-1'>
                            {getSortIcon(category, 'user_ids')}
                          </span>
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedQuestions.map((question) => (
                      <TableRow key={question.question_id}>
                        <TableCell>{question.question_id}</TableCell>
                        <TableCell>{question.count}</TableCell>
                        <TableCell>{question.user_ids.join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-between'>
                    <div className='text-sm text-muted-foreground'>
                      Showing {(state.currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                      {Math.min(
                        state.currentPage * ITEMS_PER_PAGE,
                        sortedQuestions.length
                      )}{' '}
                      of {sortedQuestions.length} questions
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          changePage(category, state.currentPage - 1)
                        }
                        disabled={state.currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className='text-sm'>
                        Page {state.currentPage} of {totalPages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          changePage(category, state.currentPage + 1)
                        }
                        disabled={state.currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to='/' />;
  }

  const questionsAssignedAtLeastTwice =
    summary.exactly_twice.count + summary.more_than_twice.count;
  const progressPercentage =
    summary.total_questions > 0
      ? (questionsAssignedAtLeastTwice / summary.total_questions) * 100
      : 0;

  const sortedAnnotators = sortAnnotators(
    annotatorProgress.annotators,
    annotatorState.sortField,
    annotatorState.sortDirection
  );
  const totalAnnotatorPages = getAnnotatorTotalPages(sortedAnnotators);
  const paginatedAnnotators = getPaginatedAnnotators(
    sortedAnnotators,
    annotatorState.currentPage
  );

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />

      <main className='flex-1 p-6'>
        <div className='max-w-7xl mx-auto space-y-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
            <Button
              onClick={fetchAdminData}
              variant='outline'
              className='flex items-center gap-2'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='h-4 w-4' />
              )}
              Refresh Data
            </Button>
          </div>

          {/* Annotator Progress Tracking */}
          <Card className='relative'>
            {isLoading && (
              <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span className='text-sm font-medium'>
                    Loading annotator data...
                  </span>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Annotator Progress Tracking</CardTitle>
              <CardDescription>
                Monitor annotator completion status and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Action Buttons */}
                <div className='flex gap-2 mb-4'>
                  <Button
                    onClick={openAddUserModal}
                    className='flex items-center gap-2'
                    disabled={isAddingUser}
                  >
                    {isAddingUser ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <UserPlus className='h-4 w-4' />
                    )}
                    Add New User
                  </Button>
                </div>
                {/* Helpful Description */}
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                  <h4 className='font-semibold text-blue-800 mb-2'>
                    How to interpret the data:
                  </h4>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>
                      • <strong>Status:</strong> "Completed" means all current
                      batch questions are finished
                    </li>
                    <li>
                      • <strong>Progress:</strong> Percentage based on current
                      batch completion only
                    </li>
                    <li>
                      • <strong>Assigned:</strong> Current batch of questions
                      assigned to the annotator
                    </li>
                    <li>
                      • <strong>Completed:</strong> Questions from current batch
                      that have been annotated
                    </li>
                    <li>
                      • <strong>History:</strong> Questions completed from
                      previous batches
                    </li>
                  </ul>
                </div>
                {/* Summary Stats */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {annotatorProgress.summary.totalAnnotators}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Total Annotators
                      </p>
                    </CardContent>
                  </Card>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-green-600'>
                        {annotatorProgress.summary.finishedAnnotators}
                      </div>
                      <p className='text-sm text-muted-foreground'>Completed</p>
                    </CardContent>
                  </Card>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {Math.round(
                          annotatorProgress.summary.averageCompletion
                        )}
                        %
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Average Completion
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Annotator Table Section */}
                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-700'>
                      Annotator Details ({annotatorProgress.annotators.length})
                    </h3>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={toggleAnnotatorSection}
                      className='flex items-center gap-2'
                    >
                      {annotatorState.isExpanded ? (
                        <>
                          <ChevronUp className='h-4 w-4' />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className='h-4 w-4' />
                          Expand
                        </>
                      )}
                    </Button>
                  </div>

                  {annotatorState.isExpanded && (
                    <div className='space-y-4'>
                      {annotatorProgress.annotators.length === 0 ? (
                        <p className='text-muted-foreground text-center py-4'>
                          No annotators found
                        </p>
                      ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('username')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Annotator
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('username')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('completionRate')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Progress
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('completionRate')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('totalAssigned')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Assigned
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('totalAssigned')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('completed')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Completed
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('completed')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('skipped')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Skipped
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('skipped')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('lastActive')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Last Active
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('lastActive')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('historicalCompleted')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    History
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon(
                                        'historicalCompleted'
                                      )}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedAnnotators.map((annotator) => (
                                <TableRow
                                  key={annotator.userId}
                                  onClick={() =>
                                    handleAnnotatorRowClick(annotator)
                                  }
                                  className='cursor-pointer hover:bg-gray-100'
                                >
                                  <TableCell>
                                    <div className='flex items-center gap-2'>
                                      {getStatusIcon(
                                        annotator.isFinished,
                                        annotator.completionRate
                                      )}
                                      {getStatusBadge(
                                        annotator.isFinished,
                                        annotator.completionRate
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{annotator.userId}</TableCell>
                                  <TableCell>
                                    <div className='font-medium'>
                                      {annotator.username}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className='space-y-1'>
                                      <div className='text-sm font-medium'>
                                        {Math.round(annotator.completionRate)}%
                                      </div>
                                      <Progress
                                        value={annotator.completionRate}
                                        className='h-2'
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {annotator.totalAssigned}
                                  </TableCell>
                                  <TableCell>{annotator.completed}</TableCell>
                                  <TableCell>{annotator.skipped}</TableCell>
                                  <TableCell>
                                    {new Date(
                                      annotator.lastActive
                                    ).getFullYear() < 2000
                                      ? 'N/A'
                                      : new Date(
                                          annotator.lastActive
                                        ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {annotator.completedQuestions.length -
                                      annotator.completed}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAssignQuestionsModal(annotator);
                                      }}
                                      className='flex items-center gap-1'
                                      disabled={isAssigningQuestions}
                                    >
                                      {isAssigningQuestions ? (
                                        <Loader2 className='h-3 w-3 animate-spin' />
                                      ) : (
                                        <Plus className='h-3 w-3' />
                                      )}
                                      Assign
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {/* Pagination */}
                          {totalAnnotatorPages > 1 && (
                            <div className='flex items-center justify-between'>
                              <div className='text-sm text-muted-foreground'>
                                Showing{' '}
                                {(annotatorState.currentPage - 1) *
                                  ITEMS_PER_PAGE +
                                  1}{' '}
                                to{' '}
                                {Math.min(
                                  annotatorState.currentPage * ITEMS_PER_PAGE,
                                  sortedAnnotators.length
                                )}{' '}
                                of {sortedAnnotators.length} annotators
                              </div>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    changeAnnotatorPage(
                                      annotatorState.currentPage - 1
                                    )
                                  }
                                  disabled={annotatorState.currentPage === 1}
                                >
                                  Previous
                                </Button>
                                <span className='text-sm'>
                                  Page {annotatorState.currentPage} of{' '}
                                  {totalAnnotatorPages}
                                </span>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    changeAnnotatorPage(
                                      annotatorState.currentPage + 1
                                    )
                                  }
                                  disabled={
                                    annotatorState.currentPage ===
                                    totalAnnotatorPages
                                  }
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Assignment Summary */}
          <Card className='relative'>
            {isLoading && (
              <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span className='text-sm font-medium'>
                    Loading assignment data...
                  </span>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Question Assignment Summary</CardTitle>
              <CardDescription>
                Overview of question assignment distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span>Assignment Coverage</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} />
                  <p className='text-sm text-muted-foreground mt-2'>
                    This percentage shows how many questions have been assigned
                    to at least 2 users. The goal is to have all questions
                    assigned at least twice to ensure proper annotation coverage
                    and validation.
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {summary.total_questions}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Total Questions
                      </p>
                    </CardContent>
                  </Card>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {summary.less_than_twice.count}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Assigned &lt; 2 Times
                      </p>
                    </CardContent>
                  </Card>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-green-600'>
                        {summary.exactly_twice.count}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Assigned Exactly 2 Times
                      </p>
                    </CardContent>
                  </Card>
                  <Card className='relative'>
                    {isLoading && (
                      <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    )}
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {summary.more_than_twice.count}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Assigned &gt; 2 Times
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Assignment Details */}
          <Card className='relative'>
            {isLoading && (
              <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                  <span className='text-sm font-medium'>
                    Loading question details...
                  </span>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Question Assignment Details</CardTitle>
              <CardDescription>
                Detailed breakdown of question assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {renderCategoryTable(
                  'less_than_twice',
                  summary?.less_than_twice?.questions,
                  'Assigned Less Than 2 Times',
                  'text-blue-600'
                )}

                {renderCategoryTable(
                  'exactly_twice',
                  summary?.exactly_twice?.questions,
                  'Assigned Exactly 2 Times',
                  'text-green-600'
                )}

                {renderCategoryTable(
                  'more_than_twice',
                  summary?.more_than_twice?.questions,
                  'Assigned More Than 2 Times',
                  'text-orange-600'
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Annotator Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>Annotator Details</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected annotator.
            </DialogDescription>
          </DialogHeader>
          {selectedAnnotator && (
            <div className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <div>
                      <span className='font-medium'>Username:</span>{' '}
                      {selectedAnnotator.username}
                    </div>
                    <div>
                      <span className='font-medium'>User ID:</span>{' '}
                      {selectedAnnotator.userId}
                    </div>
                    <div>
                      <span className='font-medium'>Email:</span>{' '}
                      {selectedAnnotator.email}
                    </div>
                    <div>
                      <span className='font-medium'>Name:</span>{' '}
                      {selectedAnnotator.firstName} {selectedAnnotator.lastName}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Current Status</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>Status:</span>
                      {getStatusIcon(
                        selectedAnnotator.isFinished,
                        selectedAnnotator.completionRate
                      )}
                      {getStatusBadge(
                        selectedAnnotator.isFinished,
                        selectedAnnotator.completionRate
                      )}
                    </div>
                    <div>
                      <span className='font-medium'>Last Active:</span>{' '}
                      {new Date(selectedAnnotator.lastActive).getFullYear() <
                      2000
                        ? 'N/A'
                        : new Date(
                            selectedAnnotator.lastActive
                          ).toLocaleDateString()}
                    </div>
                    <div>
                      <span className='font-medium'>Completion Rate:</span>{' '}
                      {Math.round(selectedAnnotator.completionRate)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Information */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {selectedAnnotator.totalAssigned}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Current Batch Assigned
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {selectedAnnotator.completed}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Current Batch Completed
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-red-600'>
                        {selectedAnnotator.skipped}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Skipped
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {selectedAnnotator.completedQuestions.length -
                          selectedAnnotator.completed}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Historical Completed
                      </div>
                    </div>
                  </div>

                  {selectedAnnotator.totalAssigned > 0 && (
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span>Current Batch Progress</span>
                        <span>
                          {Math.round(selectedAnnotator.completionRate)}%
                        </span>
                      </div>
                      <Progress
                        value={selectedAnnotator.completionRate}
                        className='h-3'
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question Details */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>
                      Current Batch Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAnnotator.assignedQuestions.length > 0 ? (
                      <div className='space-y-2'>
                        <div className='text-sm text-muted-foreground'>
                          Assigned:{' '}
                          {selectedAnnotator.assignedQuestions.join(', ')}
                        </div>
                        <div className='text-sm text-green-600'>
                          Completed:{' '}
                          {selectedAnnotator.completedQuestions
                            .filter((q) =>
                              selectedAnnotator.assignedQuestions.includes(q)
                            )
                            .join(', ')}
                        </div>
                        <div className='text-sm text-red-600'>
                          Pending:{' '}
                          {selectedAnnotator.assignedQuestions
                            .filter(
                              (q) =>
                                !selectedAnnotator.completedQuestions.includes(
                                  q
                                )
                            )
                            .join(', ')}
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No current assignments
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Skipped Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAnnotator.skippedQuestions.length > 0 ? (
                      <div className='space-y-2'>
                        <div className='text-sm text-red-600'>
                          Skipped:{' '}
                          {selectedAnnotator.skippedQuestions.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No skipped questions
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>
                      Historical Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAnnotator.completedQuestions.length >
                    selectedAnnotator.completed ? (
                      <div className='space-y-2'>
                        <div className='text-sm text-muted-foreground'>
                          Previously Completed:{' '}
                          {selectedAnnotator.completedQuestions
                            .filter(
                              (q) =>
                                !selectedAnnotator.assignedQuestions.includes(q)
                            )
                            .join(', ')}
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        No historical completions
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Statistics */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>Summary Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-4 text-center'>
                    <div>
                      <div className='text-lg font-bold'>
                        {selectedAnnotator.completedQuestions.length}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Total Completed
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold'>
                        {selectedAnnotator.totalAssigned}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Current Assigned
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold'>
                        {selectedAnnotator.completed}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Current Completed
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold'>
                        {selectedAnnotator.skipped}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Skipped
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold'>
                        {selectedAnnotator.completedQuestions.length -
                          selectedAnnotator.completed}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Historical Completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className='max-w-md max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>Add New User</span>
            </DialogTitle>
            <DialogDescription>
              Enter details to add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  value={addUserForm.username}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='password'>Password</Label>
                <Input
                  type='password'
                  id='password'
                  value={addUserForm.password}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  value={addUserForm.firstName}
                  onChange={(e) =>
                    setAddUserForm({
                      ...addUserForm,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  value={addUserForm.lastName}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='jobTitle'>Job Title</Label>
                <Input
                  id='jobTitle'
                  value={addUserForm.jobTitle}
                  onChange={(e) =>
                    setAddUserForm({ ...addUserForm, jobTitle: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor='specialization'>Specialization</Label>
                <Input
                  id='specialization'
                  value={addUserForm.specialization}
                  onChange={(e) =>
                    setAddUserForm({
                      ...addUserForm,
                      specialization: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <Button type='submit' className='w-full' disabled={isAddingUser}>
              {isAddingUser ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Add User'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Questions Modal */}
      <Dialog
        open={isAssignQuestionsModalOpen}
        onOpenChange={setIsAssignQuestionsModalOpen}
      >
        <DialogContent className='max-w-md max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>
                Assign Questions to {selectedUserForAssignment?.username}
              </span>
            </DialogTitle>
            <DialogDescription>
              Select the number of questions to assign to this annotator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignQuestions} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='questionCount'>Number of Questions</Label>
                <Input
                  type='number'
                  id='questionCount'
                  value={assignQuestionsForm.questionCount}
                  onChange={(e) =>
                    setAssignQuestionsForm({
                      ...assignQuestionsForm,
                      questionCount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min='1'
                  max='100'
                  required
                />
              </div>
            </div>
            <Button
              type='submit'
              className='w-full'
              disabled={isAssigningQuestions}
            >
              {isAssigningQuestions ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Assign Questions'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
