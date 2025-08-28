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
  downloadAllDataUrl,
  manuallyAssignQuestionsUrl,
  getAllQuestionsUrl,
  insertQuestionsUrl,
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
  Download,
  Search,
  Filter,
  Upload,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuestionDetail {
  question_id: number;
  user_ids: number[];
  count: number;
  category: string | string[];
  icu_topic: string;
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
  | 'historicalCompleted'
  | 'status'
  | 'userId';
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
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAssigningQuestions, setIsAssigningQuestions] = useState(false);
  const [isDownloadOptionsModalOpen, setIsDownloadOptionsModalOpen] =
    useState(false);
  const [isManualAssignmentModalOpen, setIsManualAssignmentModalOpen] =
    useState(false);
  const [selectedUserForManualAssignment, setSelectedUserForManualAssignment] =
    useState<AnnotatorProgress | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [questionFilterCategory, setQuestionFilterCategory] = useState('all');
  const [isManualAssigning, setIsManualAssigning] = useState(false);
  const [isManualAssigningByIDs, setIsManualAssigningByIDs] = useState(false);
  const [questionIDsString, setQuestionIDsString] = useState('');
  const [manualAssignmentTab, setManualAssignmentTab] = useState<
    'select' | 'paste'
  >('select');
  const [questionSortField, setQuestionSortField] = useState<
    'question_id' | 'question' | 'category' | 'icu_topic'
  >('question_id');
  const [questionSortDirection, setQuestionSortDirection] = useState<
    'asc' | 'desc'
  >('asc');
  const [isAssignOptionsModalOpen, setIsAssignOptionsModalOpen] =
    useState(false);
  const [selectedUserForAssignOptions, setSelectedUserForAssignOptions] =
    useState<AnnotatorProgress | null>(null);
  const [isUploadQuestionsModalOpen, setIsUploadQuestionsModalOpen] =
    useState(false);
  const [isUploadingQuestions, setIsUploadingQuestions] = useState(false);
  const [uploadQuestionsFile, setUploadQuestionsFile] = useState<File | null>(
    null
  );
  const [uploadQuestionsBatchId, setUploadQuestionsBatchId] = useState<
    number | ''
  >('');
  const [uploadPreview, setUploadPreview] = useState<any>(null);
  const [uploadValidationErrors, setUploadValidationErrors] = useState<
    string[]
  >([]);

  // Download Options State
  const [downloadOptions, setDownloadOptions] = useState({
    includeUsers: false,
    includeQuestions: false,
    includeAnnotations: true,
    format: 'json' as 'json' | 'csv',
  });

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

  // Granular loading states
  const [isLoadingAnnotatorData, setIsLoadingAnnotatorData] = useState(false);
  const [isLoadingAssignmentData, setIsLoadingAssignmentData] = useState(false);
  const [isLoadingAnnotatorTable, setIsLoadingAnnotatorTable] = useState(false);
  const [isLoadingAssignmentTables, setIsLoadingAssignmentTables] =
    useState(false);
  const [isLoadingAnnotatorStats, setIsLoadingAnnotatorStats] = useState(false);
  const [isLoadingAssignmentStats, setIsLoadingAssignmentStats] =
    useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const fetchAdminData = async () => {
    setIsLoadingAnnotatorData(true);
    setIsLoadingAssignmentData(true);
    setIsLoadingAnnotatorTable(true);
    setIsLoadingAssignmentTables(true);
    setIsLoadingAnnotatorStats(true);
    setIsLoadingAssignmentStats(true);

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

      // Mark assignment statistics and data as loaded
      setIsLoadingAssignmentStats(false);
      setIsLoadingAssignmentData(false);
      setIsLoadingAssignmentTables(false);

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

      // Mark annotator data as loaded
      setIsLoadingAnnotatorStats(false);
      setIsLoadingAnnotatorData(false);
      setIsLoadingAnnotatorTable(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load admin dashboard data',
      });
    } finally {
      // Ensure all loading states are reset
      setIsLoadingAnnotatorData(false);
      setIsLoadingAssignmentData(false);
      setIsLoadingAnnotatorTable(false);
      setIsLoadingAssignmentTables(false);
      setIsLoadingAnnotatorStats(false);
      setIsLoadingAssignmentStats(false);
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
        case 'status':
          comparison = a.isFinished ? 1 : b.isFinished ? -1 : 0;
          break;
        case 'userId':
          comparison = a.userId - b.userId;
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

  const openDownloadOptionsModal = () => {
    setIsDownloadOptionsModalOpen(true);
  };

  const closeDownloadOptionsModal = () => {
    setIsDownloadOptionsModalOpen(false);
    // Reset options to default
    setDownloadOptions({
      includeUsers: true,
      includeQuestions: true,
      includeAnnotations: true,
      format: 'json',
    });
  };

  const handleDownloadWithOptions = async () => {
    setIsDownloadingData(true);
    closeDownloadOptionsModal();

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

      // Build query parameters based on options
      const params = new URLSearchParams();
      if (downloadOptions.includeUsers) params.append('include_users', 'true');
      if (downloadOptions.includeQuestions)
        params.append('include_questions', 'true');
      if (downloadOptions.includeAnnotations)
        params.append('include_annotations', 'true');
      params.append('format', downloadOptions.format);

      const url = `${downloadAllDataUrl}?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Get the filename from the response headers
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `data_export_${new Date().toISOString().split('T')[0]}.${
          downloadOptions.format
        }`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create a blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Success',
          description: 'Data downloaded successfully',
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.message || 'Failed to download data',
        });
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download data',
      });
    } finally {
      setIsDownloadingData(false);
    }
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

  const openManualAssignmentModal = async (annotator: AnnotatorProgress) => {
    setSelectedUserForManualAssignment(annotator);
    setIsManualAssignmentModalOpen(true);
    setSelectedQuestionIds([]);
    setQuestionSearchTerm('');
    setQuestionFilterCategory('all');

    // Fetch all questions
    await fetchAllQuestions();
  };

  const closeManualAssignmentModal = () => {
    setIsManualAssignmentModalOpen(false);
    setSelectedUserForManualAssignment(null);
    setSelectedQuestionIds([]);
    setQuestionSearchTerm('');
    setQuestionFilterCategory('all');
    setQuestionIDsString('');
    setManualAssignmentTab('select');
  };

  const fetchAllQuestions = async () => {
    setIsLoadingQuestions(true);
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

      const response = await fetch(getAllQuestionsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllQuestions(data.questions || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch questions',
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch questions',
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleManualAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one question',
      });
      return;
    }

    setIsManualAssigning(true);
    try {
      const token = user?.token;
      if (!token || !selectedUserForManualAssignment) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please log in again',
        });
        return;
      }

      const response = await fetch(
        `${manuallyAssignQuestionsUrl}?user_id=${selectedUserForManualAssignment.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question_ids: selectedQuestionIds }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `Manually assigned ${result.assigned_ids.length} questions to ${selectedUserForManualAssignment.username}`,
        });
        closeManualAssignmentModal();
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
      console.error('Error manually assigning questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign questions',
      });
    } finally {
      setIsManualAssigning(false);
    }
  };

  const handleManualAssignmentByIDs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionIDsString.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter at least one question ID',
      });
      return;
    }

    // Parse the question IDs from the string
    const questionIds = questionIDsString
      .split(/[,\s\n]+/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    if (questionIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No valid question IDs found in the input',
      });
      return;
    }

    setIsManualAssigningByIDs(true);
    try {
      const token = user?.token;
      if (!token || !selectedUserForManualAssignment) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please log in again',
        });
        return;
      }

      const response = await fetch(
        `${manuallyAssignQuestionsUrl}?user_id=${selectedUserForManualAssignment.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question_ids: questionIds }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `Manually assigned ${result.assigned_ids.length} questions to ${selectedUserForManualAssignment.username} (${questionIds.length} IDs parsed)`,
        });
        closeManualAssignmentModal();
        setQuestionIDsString('');
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
      console.error('Error manually assigning questions by IDs:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign questions',
      });
    } finally {
      setIsManualAssigningByIDs(false);
    }
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = allQuestions.filter((question) => {
    const matchesSearch =
      question.question
        .toLowerCase()
        .includes(questionSearchTerm.toLowerCase()) ||
      question.question_id.toString().includes(questionSearchTerm);
    const matchesCategory =
      questionFilterCategory === 'all' ||
      (question.category && question.category.includes(questionFilterCategory));
    return matchesSearch && matchesCategory;
  });

  const handleQuestionSort = (
    field: 'question_id' | 'question' | 'category' | 'icu_topic'
  ) => {
    if (questionSortField === field) {
      setQuestionSortDirection(
        questionSortDirection === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setQuestionSortField(field);
      setQuestionSortDirection('asc');
    }
  };

  const getQuestionSortIcon = (
    field: 'question_id' | 'question' | 'category' | 'icu_topic'
  ) => {
    if (questionSortField !== field) {
      return <ArrowUpDown className='h-4 w-4' />;
    }
    return questionSortDirection === 'asc' ? (
      <ChevronUp className='h-4 w-4' />
    ) : (
      <ChevronDown className='h-4 w-4' />
    );
  };

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    let comparison = 0;

    switch (questionSortField) {
      case 'question_id':
        comparison = a.question_id - b.question_id;
        break;
      case 'question':
        comparison = a.question.localeCompare(b.question);
        break;
      case 'category':
        const aCategory = Array.isArray(a.category)
          ? a.category.join(', ')
          : a.category || '';
        const bCategory = Array.isArray(b.category)
          ? b.category.join(', ')
          : b.category || '';
        comparison = aCategory.localeCompare(bCategory);
        break;
      case 'icu_topic':
        comparison = (a.icu_topic || '').localeCompare(b.icu_topic || '');
        break;
    }

    return questionSortDirection === 'asc' ? comparison : -comparison;
  });

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
      <div className='border rounded-lg p-4 relative'>
        {isLoadingAssignmentTables && (
          <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='text-sm font-medium'>
                Loading {title.toLowerCase()}...
              </span>
            </div>
          </div>
        )}
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

  const openAssignOptionsModal = (annotator: AnnotatorProgress) => {
    setSelectedUserForAssignOptions(annotator);
    setIsAssignOptionsModalOpen(true);
  };

  const closeAssignOptionsModal = () => {
    setIsAssignOptionsModalOpen(false);
    setSelectedUserForAssignOptions(null);
  };

  const handleAutoAssign = () => {
    if (selectedUserForAssignOptions) {
      closeAssignOptionsModal();
      openAssignQuestionsModal(selectedUserForAssignOptions);
    }
  };

  const handleManualAssign = async () => {
    if (selectedUserForAssignOptions) {
      closeAssignOptionsModal();
      await openManualAssignmentModal(selectedUserForAssignOptions);
    }
  };

  const openUploadQuestionsModal = () => {
    setIsUploadQuestionsModalOpen(true);
  };

  const closeUploadQuestionsModal = () => {
    setIsUploadQuestionsModalOpen(false);
    setUploadQuestionsFile(null);
    setUploadQuestionsBatchId('');
    setUploadPreview(null);
    setUploadValidationErrors([]);
  };

  const handleFilePreview = async () => {
    if (!uploadQuestionsFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file first',
      });
      return;
    }

    try {
      const fileContent = await uploadQuestionsFile.text();
      let questionsData;

      try {
        questionsData = JSON.parse(fileContent);
      } catch (parseError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid JSON format in the uploaded file',
        });
        return;
      }

      // Validate the structure
      const validation = validateQuestionsStructure(questionsData);
      setUploadValidationErrors(validation.errors);
      setUploadPreview(questionsData);

      if (validation.isValid) {
        toast({
          title: 'File Preview',
          description: `File structure is valid! Found ${
            questionsData.length || 0
          } questions.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'File Structure Issues',
          description: `Found ${validation.errors.length} validation errors. Check the preview below.`,
        });
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to preview file',
      });
    }
  };

  // Validation function to check file structure
  const validateQuestionsStructure = (
    data: any
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if data is an array
    if (!Array.isArray(data)) {
      errors.push('File must contain a JSON array of questions');
      return { isValid: false, errors };
    }

    // Check if questions array is not empty
    if (data.length === 0) {
      errors.push('Questions array cannot be empty');
      return { isValid: false, errors };
    }

    // Validate each question in the array
    data.forEach((question: any, index: number) => {
      const questionPrefix = `Question ${index + 1}:`;

      // Check required fields
      if (!question.question || typeof question.question !== 'string') {
        errors.push(
          `${questionPrefix} Missing or invalid "question" field (must be a string)`
        );
      }

      if (!question.context || typeof question.context !== 'string') {
        errors.push(
          `${questionPrefix} Missing or invalid "context" field (must be a string)`
        );
      }

      if (!question.category || !Array.isArray(question.category)) {
        errors.push(
          `${questionPrefix} Missing or invalid "category" field (must be an array)`
        );
      }

      if (!question.icu_topic || typeof question.icu_topic !== 'string') {
        errors.push(
          `${questionPrefix} Missing or invalid "icu_topic" field (must be a string)`
        );
      }

      if (
        !question.retrieval_tasks ||
        !Array.isArray(question.retrieval_tasks)
      ) {
        errors.push(
          `${questionPrefix} Missing or invalid "retrieval_tasks" field (must be an array)`
        );
      }

      if (!question.reasoning || typeof question.reasoning !== 'string') {
        errors.push(
          `${questionPrefix} Missing or invalid "reasoning" field (must be a string)`
        );
      }

      if (!question.model || typeof question.model !== 'string') {
        errors.push(
          `${questionPrefix} Missing or invalid "model" field (must be a string)`
        );
      }

      // Validate retrieval_tasks structure if it exists
      if (question.retrieval_tasks && Array.isArray(question.retrieval_tasks)) {
        question.retrieval_tasks.forEach((task: any, taskIndex: number) => {
          const taskPrefix = `${questionPrefix} Retrieval Task ${
            taskIndex + 1
          }:`;

          if (!task.task || typeof task.task !== 'string') {
            errors.push(
              `${taskPrefix} Missing or invalid "task" field (must be a string)`
            );
          }

          if (!task.variables || !Array.isArray(task.variables)) {
            errors.push(
              `${taskPrefix} Missing or invalid "variables" field (must be an array)`
            );
          }
        });
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleUploadQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadQuestionsFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file to upload',
      });
      return;
    }

    if (
      uploadQuestionsBatchId === '' ||
      uploadQuestionsBatchId === null ||
      uploadQuestionsBatchId === undefined
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a batch ID',
      });
      return;
    }

    setIsUploadingQuestions(true);
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

      // Read the file content
      const fileContent = await uploadQuestionsFile.text();
      let questionsData;

      try {
        questionsData = JSON.parse(fileContent);
      } catch (parseError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid JSON format in the uploaded file',
        });
        return;
      }

      // Validate the structure
      const validation = validateQuestionsStructure(questionsData);
      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Structure',
          description: `File structure validation failed:\n${validation.errors
            .slice(0, 5)
            .join('\n')}${
            validation.errors.length > 5
              ? `\n... and ${validation.errors.length - 5} more errors`
              : ''
          }`,
        });
        return;
      }

      // Create the final data structure with questions array and batch_id
      const finalData = {
        questions: questionsData,
        batch_id: uploadQuestionsBatchId,
      };

      // Send to backend
      const response = await fetch(insertQuestionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `Successfully uploaded questions. ${
            result.inserted_ids?.length || 0
          } questions inserted.`,
        });
        closeUploadQuestionsModal();
        // Refresh data to show new questions
        fetchAdminData();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.message || 'Failed to upload questions',
        });
      }
    } catch (error) {
      console.error('Error uploading questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload questions',
      });
    } finally {
      setIsUploadingQuestions(false);
    }
  };

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
              disabled={
                isLoadingAnnotatorStats ||
                isLoadingAssignmentStats ||
                isLoadingAnnotatorData ||
                isLoadingAssignmentData
              }
            >
              {isLoadingAnnotatorStats ||
              isLoadingAssignmentStats ||
              isLoadingAnnotatorData ||
              isLoadingAssignmentData ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='h-4 w-4' />
              )}
              Refresh Data
            </Button>
          </div>

          {/* Annotator Progress Tracking */}
          <Card className='relative'>
            {isLoadingAnnotatorData && (
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
                  <Button
                    onClick={openUploadQuestionsModal}
                    className='flex items-center gap-2'
                    disabled={isUploadingQuestions}
                  >
                    {isUploadingQuestions ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Upload className='h-4 w-4' />
                    )}
                    Upload Questions
                  </Button>
                  <Button
                    onClick={() => setIsDownloadOptionsModalOpen(true)}
                    variant='outline'
                    className='flex items-center gap-2'
                    disabled={isDownloadingData}
                  >
                    {isDownloadingData ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Download className='h-4 w-4' />
                    )}
                    Download Raw Data
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
                    {isLoadingAnnotatorStats && (
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
                    {isLoadingAnnotatorStats && (
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
                    {isLoadingAnnotatorStats && (
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
                <div className='border rounded-lg p-4 relative'>
                  {isLoadingAnnotatorTable && (
                    <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Loader2 className='h-6 w-6 animate-spin' />
                        <span className='text-sm font-medium'>
                          Loading annotator table...
                        </span>
                      </div>
                    </div>
                  )}
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
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('status')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    Status
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('status')}
                                    </span>
                                  </Button>
                                </TableHead>
                                <TableHead>
                                  <Button
                                    variant='ghost'
                                    onClick={() =>
                                      handleAnnotatorSort('userId')
                                    }
                                    className='h-auto p-0 font-semibold hover:bg-transparent'
                                  >
                                    User ID
                                    <span className='ml-1'>
                                      {getAnnotatorSortIcon('userId')}
                                    </span>
                                  </Button>
                                </TableHead>
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
                                {/* <TableHead>
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
                                </TableHead> */}
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
                                      {annotator.firstName} {annotator.lastName}
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
                                  {/* <TableCell>
                                    {annotator.completedQuestions.length -
                                      annotator.completed}
                                  </TableCell> */}
                                  <TableCell>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAssignOptionsModal(annotator);
                                      }}
                                      className='flex items-center gap-1'
                                      disabled={
                                        isAssigningQuestions ||
                                        isManualAssigning
                                      }
                                    >
                                      {isAssigningQuestions ||
                                      isManualAssigning ? (
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
            {isLoadingAssignmentData && (
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
                    {isLoadingAssignmentStats && (
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
                    {isLoadingAssignmentStats && (
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
                    {isLoadingAssignmentStats && (
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
                    {isLoadingAssignmentStats && (
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
            {isLoadingAssignmentTables && (
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
                          ).toLocaleString()}
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

      {/* Manual Assignment Modal */}
      <Dialog
        open={isManualAssignmentModalOpen}
        onOpenChange={setIsManualAssignmentModalOpen}
      >
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>
                Manually Assign Questions to{' '}
                {selectedUserForManualAssignment?.username}
              </span>
            </DialogTitle>
            <DialogDescription>
              Choose how to assign questions to this annotator.
            </DialogDescription>
          </DialogHeader>
          <Tabs
            value={manualAssignmentTab}
            onValueChange={(value) =>
              setManualAssignmentTab(value as 'select' | 'paste')
            }
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='select'>Select Questions</TabsTrigger>
              <TabsTrigger value='paste'>Paste Question IDs</TabsTrigger>
            </TabsList>

            <TabsContent value='select' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='questionSearch'>Search Questions</Label>
                  <Input
                    id='questionSearch'
                    placeholder='Enter question text or ID'
                    value={questionSearchTerm}
                    onChange={(e) => setQuestionSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='questionCategory'>Filter by Category</Label>
                  <Select
                    onValueChange={(value) => setQuestionFilterCategory(value)}
                    defaultValue={questionFilterCategory}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='All Categories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Categories</SelectItem>
                      <SelectItem value='endocrine'>Endocrine</SelectItem>
                      <SelectItem value='cardiovascular'>
                        Cardiovascular
                      </SelectItem>
                      <SelectItem value='respiratory'>Respiratory</SelectItem>
                      <SelectItem value='renal'>Renal</SelectItem>
                      <SelectItem value='neurological'>Neurological</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='overflow-y-auto max-h-[60vh]'>
                {isLoadingQuestions ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin mr-2' />
                    <span>Loading questions...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Select</TableHead>
                        <TableHead>
                          <Button
                            variant='ghost'
                            onClick={() => handleQuestionSort('question_id')}
                            className='h-auto p-0 font-semibold hover:bg-transparent'
                          >
                            Question ID
                            <span className='ml-1'>
                              {getQuestionSortIcon('question_id')}
                            </span>
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant='ghost'
                            onClick={() => handleQuestionSort('question')}
                            className='h-auto p-0 font-semibold hover:bg-transparent'
                          >
                            Question Text
                            <span className='ml-1'>
                              {getQuestionSortIcon('question')}
                            </span>
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant='ghost'
                            onClick={() => handleQuestionSort('category')}
                            className='h-auto p-0 font-semibold hover:bg-transparent'
                          >
                            Category
                            <span className='ml-1'>
                              {getQuestionSortIcon('category')}
                            </span>
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant='ghost'
                            onClick={() => handleQuestionSort('icu_topic')}
                            className='h-auto p-0 font-semibold hover:bg-transparent'
                          >
                            ICU Topic
                            <span className='ml-1'>
                              {getQuestionSortIcon('icu_topic')}
                            </span>
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedQuestions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className='text-center py-8'>
                            No questions found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedQuestions.map((question) => (
                          <TableRow key={question.question_id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedQuestionIds.includes(
                                  question.question_id
                                )}
                                onCheckedChange={() =>
                                  toggleQuestionSelection(question.question_id)
                                }
                              />
                            </TableCell>
                            <TableCell>{question.question_id}</TableCell>
                            <TableCell className='max-w-md'>
                              <div
                                className='line-clamp-3 text-sm cursor-help'
                                title={question.question}
                              >
                                {question.question}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-wrap gap-1'>
                                {Array.isArray(question.category) ? (
                                  question.category.map((cat, index) => (
                                    <Badge
                                      key={index}
                                      variant='secondary'
                                      className='text-xs px-2 py-1 rounded-full'
                                    >
                                      {cat}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge
                                    variant='secondary'
                                    className='text-xs px-2 py-1 rounded-full'
                                  >
                                    {question.category}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{question.icu_topic}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
              <div className='flex justify-between items-center'>
                <div className='text-sm text-muted-foreground'>
                  {selectedQuestionIds.length} question(s) selected
                </div>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={closeManualAssignmentModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      isManualAssigning || selectedQuestionIds.length === 0
                    }
                    onClick={handleManualAssignment}
                  >
                    {isManualAssigning ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4 mr-2' />
                        Assign Selected ({selectedQuestionIds.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='paste' className='space-y-4'>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='questionIDs'>Question IDs</Label>
                  <Textarea
                    id='questionIDs'
                    placeholder='Enter question IDs separated by commas, spaces, or newlines (e.g., 1, 2, 3 or 1 2 3 or 1&#10;2&#10;3)'
                    value={questionIDsString}
                    onChange={(e) => setQuestionIDsString(e.target.value)}
                    className='min-h-[200px]'
                  />
                  <p className='text-sm text-muted-foreground mt-2'>
                    You can paste question IDs in any format: comma-separated,
                    space-separated, or one per line.
                  </p>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-muted-foreground'>
                    {questionIDsString.trim()
                      ? `${
                          questionIDsString
                            .split(/[,\s\n]+/)
                            .filter((id) => id.trim()).length
                        } question ID(s) detected`
                      : 'No question IDs entered'}
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={closeManualAssignmentModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        isManualAssigningByIDs || !questionIDsString.trim()
                      }
                      onClick={handleManualAssignmentByIDs}
                    >
                      {isManualAssigningByIDs ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin mr-2' />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Plus className='h-4 w-4 mr-2' />
                          Assign by IDs
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Download Options Modal */}
      <Dialog
        open={isDownloadOptionsModalOpen}
        onOpenChange={setIsDownloadOptionsModalOpen}
      >
        <DialogContent className='max-w-md max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>Download Options</span>
            </DialogTitle>
            <DialogDescription>
              Select which data to include in your download.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Validate that at least one option is selected
              if (
                !downloadOptions.includeUsers &&
                !downloadOptions.includeQuestions &&
                !downloadOptions.includeAnnotations
              ) {
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description:
                    'Please select at least one data type to download.',
                });
                return;
              }
              handleDownloadWithOptions();
            }}
            className='space-y-6'
          >
            {/* Data Selection */}
            <div className='space-y-4'>
              <Label className='text-base font-semibold'>Data to Include</Label>
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='includeUsers'
                    checked={downloadOptions.includeUsers}
                    onCheckedChange={(checked) =>
                      setDownloadOptions({
                        ...downloadOptions,
                        includeUsers: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor='includeUsers' className='text-sm font-normal'>
                    Users ({annotatorProgress.summary.totalAnnotators} users)
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='includeQuestions'
                    checked={downloadOptions.includeQuestions}
                    onCheckedChange={(checked) =>
                      setDownloadOptions({
                        ...downloadOptions,
                        includeQuestions: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor='includeQuestions'
                    className='text-sm font-normal'
                  >
                    Questions ({summary.total_questions} questions)
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='includeAnnotations'
                    checked={downloadOptions.includeAnnotations}
                    onCheckedChange={(checked) =>
                      setDownloadOptions({
                        ...downloadOptions,
                        includeAnnotations: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor='includeAnnotations'
                    className='text-sm font-normal'
                  >
                    Annotations (all annotation data)
                  </Label>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className='space-y-2'>
              <Label htmlFor='format' className='text-base font-semibold'>
                Export Format
              </Label>
              <Select
                onValueChange={(value) =>
                  setDownloadOptions({
                    ...downloadOptions,
                    format: value as 'json' | 'csv',
                  })
                }
                defaultValue={downloadOptions.format}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a format' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='json'>JSON (Recommended)</SelectItem>
                  <SelectItem value='csv'>CSV (Summary only)</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-xs text-muted-foreground'>
                JSON includes all data. CSV provides a summary with counts only.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={closeDownloadOptionsModal}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1'
                disabled={isDownloadingData}
              >
                {isDownloadingData ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className='h-4 w-4 mr-2' />
                    Download
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Options Modal */}
      <Dialog
        open={isAssignOptionsModalOpen}
        onOpenChange={setIsAssignOptionsModalOpen}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              Assign Questions to {selectedUserForAssignOptions?.username}
            </DialogTitle>
            <DialogDescription>
              Choose how you want to assign questions to this annotator.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3'>
              <Button
                onClick={handleAutoAssign}
                className='flex items-center justify-start gap-3 p-4 h-auto'
                variant='outline'
              >
                <div className='flex items-center gap-3'>
                  <Plus className='h-5 w-5' />
                  <div className='text-left'>
                    <div className='font-semibold'>Auto Assign</div>
                    <div className='text-sm text-muted-foreground'>
                      Automatically assign 25 questions based on priority
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleManualAssign}
                className='flex items-center justify-start gap-3 p-4 h-auto'
                variant='outline'
              >
                <div className='flex items-center gap-3'>
                  <Filter className='h-5 w-5' />
                  <div className='text-left'>
                    <div className='font-semibold'>Manual Assign</div>
                    <div className='text-sm text-muted-foreground'>
                      Select specific questions to assign
                    </div>
                  </div>
                </div>
              </Button>
            </div>

            <div className='flex justify-end'>
              <Button variant='outline' onClick={closeAssignOptionsModal}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Questions Modal */}
      <Dialog
        open={isUploadQuestionsModalOpen}
        onOpenChange={setIsUploadQuestionsModalOpen}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>Upload Questions</span>
            </DialogTitle>
            <DialogDescription>
              Upload a JSON file containing questions to add to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadQuestions} className='space-y-4'>
            <div>
              <Label htmlFor='questionsFile'>Questions JSON File</Label>
              <Input
                id='questionsFile'
                type='file'
                accept='.json'
                onChange={(e) => {
                  setUploadQuestionsFile(e.target.files?.[0] || null);
                  setUploadPreview(null);
                  setUploadValidationErrors([]);
                }}
                required
              />
              <p className='text-sm text-muted-foreground mt-2'>
                Upload a JSON file containing an array of questions with the
                following structure:
                <br />
                <code className='text-xs'>
                  {`[
                      {
                        "question": "Question text",
                        "context": "Context text",
                        "category": ["category1", "category2"],
                        "icu_topic": "ICU topic",
                        "retrieval_tasks": [
                          {
                            "task": "Task description",
                            "variables": ["var1", "var2"]
                          }
                        ],
                        "reasoning": "Reasoning text",
                        "model": "Model name"
                      }
                    ]`}
                </code>
                <br />
              </p>
            </div>

            {/* Preview Button */}
            {uploadQuestionsFile && (
              <div>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleFilePreview}
                  className='w-full'
                >
                  <Search className='h-4 w-4 mr-2' />
                  Preview & Validate File Structure
                </Button>
              </div>
            )}

            {/* Validation Errors Display */}
            {uploadValidationErrors.length > 0 && (
              <div className='border border-red-200 rounded-lg p-4 bg-red-50'>
                <h4 className='font-semibold text-red-800 mb-2'>
                  Validation Errors ({uploadValidationErrors.length})
                </h4>
                <div className='max-h-40 overflow-y-auto'>
                  <ul className='text-sm text-red-700 space-y-1'>
                    {uploadValidationErrors.slice(0, 10).map((error, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-red-500 mt-1'>•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                    {uploadValidationErrors.length > 10 && (
                      <li className='text-red-600 font-medium'>
                        ... and {uploadValidationErrors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* File Preview */}
            {uploadPreview && uploadValidationErrors.length === 0 && (
              <div className='border border-green-200 rounded-lg p-4 bg-green-50'>
                <h4 className='font-semibold text-green-800 mb-2'>
                  File Preview - Valid Structure ✓
                </h4>
                <div className='text-sm text-green-700 space-y-2'>
                  <p>
                    <strong>Total Questions:</strong>{' '}
                    {uploadPreview.length || 0}
                  </p>
                  <p>
                    <strong>File Structure:</strong> Valid
                  </p>
                  <p>
                    <strong>Ready to Upload:</strong> Yes
                  </p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor='batchId'>Batch ID *</Label>
              <Input
                id='batchId'
                type='number'
                placeholder='Enter batch ID for grouping questions'
                value={uploadQuestionsBatchId}
                onChange={(e) =>
                  setUploadQuestionsBatchId(
                    e.target.value === '' ? '' : parseInt(e.target.value, 10)
                  )
                }
                required
              />
              <p className='text-sm text-muted-foreground mt-2'>
                Required: Enter a unique batch ID (number) to group these
                questions together.
              </p>
            </div>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={closeUploadQuestionsModal}
                className='flex-1'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1'
                disabled={
                  isUploadingQuestions || uploadValidationErrors.length > 0
                }
              >
                {isUploadingQuestions ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-2' />
                    Upload Questions
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
