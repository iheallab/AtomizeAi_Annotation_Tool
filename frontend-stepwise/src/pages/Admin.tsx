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

interface UserStats {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAnnotations: number;
  validQuestions: number;
  invalidQuestions: number;
  skippedQuestions: number;
  lastActive: string;
}

interface AnnotationSummary {
  totalQuestions: number;
  completedQuestions: number;
  validQuestions: number;
  invalidQuestions: number;
  skippedQuestions: number;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [summary, setSummary] = useState<AnnotationSummary>({
    totalQuestions: 0,
    completedQuestions: 0,
    validQuestions: 0,
    invalidQuestions: 0,
    skippedQuestions: 0,
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

        const statsResponse = await fetch(
          'http://localhost:8080/api/admin/user-stats',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            method: 'GET',
          }
        );

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

        const data = await statsResponse.json();

        if (data.users && Array.isArray(data.users)) {
          setUserStats(
            data.users.map((stat: UserStats) => ({
              ...stat,
              lastActive: new Date(stat.lastActive).toISOString(), // Ensure proper date formatting
            }))
          );
        }

        if (data.summary) {
          setSummary(data.summary);
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

  if (!user || user.role !== 'admin') {
    return <Navigate to='/' />;
  }

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />

      <main className='flex-1 p-6'>
        <div className='max-w-7xl mx-auto space-y-6'>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>Summary of all annotation work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span>Total Progress</span>
                    <span>
                      {Math.round(
                        (summary.completedQuestions / summary.totalQuestions) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (summary.completedQuestions / summary.totalQuestions) *
                      100
                    }
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {summary.totalQuestions}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Total Questions
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {summary.completedQuestions}
                      </div>
                      <p className='text-sm text-muted-foreground'>Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {summary.validQuestions}
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        Valid Questions
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-2xl font-bold'>
                        {summary.skippedQuestions}
                      </div>
                      <p className='text-sm text-muted-foreground'>Skipped</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Annotator Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Annotator Performance</CardTitle>
              <CardDescription>Individual annotator statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Annotations</TableHead>
                    <TableHead>Valid Questions</TableHead>
                    <TableHead>Invalid Questions</TableHead>
                    <TableHead>Skipped</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map((stat) => (
                    <TableRow key={stat.userId}>
                      <TableCell>{stat.username}</TableCell>
                      <TableCell>{stat.email}</TableCell>
                      <TableCell>{stat.totalAnnotations}</TableCell>
                      <TableCell>{stat.validQuestions}</TableCell>
                      <TableCell>{stat.invalidQuestions}</TableCell>
                      <TableCell>{stat.skippedQuestions}</TableCell>
                      <TableCell>
                        {new Date(stat.lastActive).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
