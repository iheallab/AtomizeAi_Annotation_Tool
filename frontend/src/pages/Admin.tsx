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
import { questionAssignmentSummaryUrl } from '@/apis/api_url';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

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

type SortField = 'question_id' | 'count' | 'user_ids';
type SortDirection = 'asc' | 'desc';

interface CategoryState {
  isExpanded: boolean;
  currentPage: number;
  sortField: SortField;
  sortDirection: SortDirection;
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

  useEffect(() => {
    const fetchAdminData = async () => {
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
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load admin dashboard data',
        });
      }
    };

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
            {title} ({questions.length})
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
            {questions.length === 0 ? (
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

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />

      <main className='flex-1 p-6'>
        <div className='max-w-7xl mx-auto space-y-6'>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

          {/* Question Assignment Summary */}
          <Card>
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
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {summary.total_questions}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Total Questions
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {summary.less_than_twice.count}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Assigned &lt; 2 Times
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold text-green-600'>
                        {summary.exactly_twice.count}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Assigned Exactly 2 Times
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
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
          <Card>
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
                  summary.less_than_twice.questions,
                  'Assigned Less Than 2 Times',
                  'text-blue-600'
                )}

                {renderCategoryTable(
                  'exactly_twice',
                  summary.exactly_twice.questions,
                  'Assigned Exactly 2 Times',
                  'text-green-600'
                )}

                {renderCategoryTable(
                  'more_than_twice',
                  summary.more_than_twice.questions,
                  'Assigned More Than 2 Times',
                  'text-orange-600'
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
