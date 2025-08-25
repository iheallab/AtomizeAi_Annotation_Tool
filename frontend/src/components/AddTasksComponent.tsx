import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTasksComponentProps {
  existingTopics: string[];
  onTasksChange: (tasks: string[]) => void;
  initialTasks?: string[];
}

export const AddTasksComponent: React.FC<AddTasksComponentProps> = ({
  existingTopics,
  onTasksChange,
  initialTasks = [],
}) => {
  const [tasks, setTasks] = useState<
    Array<{ topic: string; taskName: string; isNewTopic: boolean }>
  >(
    initialTasks.length > 0
      ? initialTasks.map((task) => ({
          topic: '',
          taskName: task,
          isNewTopic: false,
        }))
      : [{ topic: '', taskName: '', isNewTopic: false }]
  );
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    // Convert tasks to string array and notify parent
    const taskStrings = tasks
      .filter((task) => task.taskName.trim() !== '')
      .map((task) => task.taskName.trim());
    onTasksChange(taskStrings);
  }, [tasks, onTasksChange]);

  const addTask = () => {
    setTasks([...tasks, { topic: '', taskName: '', isNewTopic: false }]);
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const updateTask = (
    index: number,
    field: 'topic' | 'taskName' | 'isNewTopic',
    value: string | boolean
  ) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleTopicChange = (index: number, value: string) => {
    if (value === 'new') {
      updateTask(index, 'isNewTopic', true);
      updateTask(index, 'topic', '');
    } else {
      updateTask(index, 'isNewTopic', false);
      updateTask(index, 'topic', value);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800'>
        <h4 className='text-sm font-medium text-blue-900 dark:text-blue-100 mb-2'>
          Add Missing Tasks
        </h4>
        <p className='text-sm text-blue-700 dark:text-blue-300'>
          Please add the tasks that are missing from the current data elements.
        </p>
      </div>

      {tasks.map((task, index) => (
        <div
          key={index}
          className='flex items-start gap-3 p-4 border border-border rounded-lg bg-card'
        >
          <div className='flex-1 space-y-3'>
            {/* Topic Selection */}
            <div className='space-y-2'>
              <Label htmlFor={`topic-${index}`} className='text-sm font-medium'>
                Topic
              </Label>
              {task.isNewTopic ? (
                <div className='space-y-2'>
                  <Input
                    id={`new-topic-${index}`}
                    placeholder='Enter new topic name'
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className='w-full'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        updateTask(index, 'topic', newTopic);
                        updateTask(index, 'isNewTopic', false);
                        setNewTopic('');
                      }}
                      disabled={!newTopic.trim()}
                    >
                      <Plus className='w-4 h-4 mr-1' />
                      Add Topic
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => {
                        updateTask(index, 'isNewTopic', false);
                        setNewTopic('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Select
                  value={task.topic}
                  onValueChange={(value) => handleTopicChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a topic' />
                  </SelectTrigger>
                  <SelectContent>
                    {existingTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                    <SelectItem value='new'>+ Add New Topic</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Task Name */}
            <div className='space-y-2'>
              <Label htmlFor={`task-${index}`} className='text-sm font-medium'>
                Task Name
              </Label>
              <Input
                id={`task-${index}`}
                placeholder='Enter task name'
                value={task.taskName}
                onChange={(e) => updateTask(index, 'taskName', e.target.value)}
                className='w-full'
              />
            </div>

            {/* Display selected topic */}
            {task.topic && !task.isNewTopic && (
              <div className='flex items-center gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  {task.topic}
                </Badge>
              </div>
            )}
          </div>

          {/* Remove button */}
          {tasks.length > 1 && (
            <Button
              size='sm'
              variant='ghost'
              onClick={() => removeTask(index)}
              className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
            >
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>
      ))}

      {/* Add new task button */}
      <Button
        variant='outline'
        onClick={addTask}
        className='w-full border-dashed border-2 border-border hover:border-primary'
      >
        <Plus className='w-4 h-4 mr-2' />
        Add Another Task
      </Button>
    </div>
  );
};
