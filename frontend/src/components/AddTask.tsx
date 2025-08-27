import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Plus, X } from 'lucide-react';
import { Category, Variable } from '@/types';
import { omopVariables } from '@/contants/omopVariables';

interface AddTaskProps {
  onAddTasks: (tasks: Variable[], categoryName: string) => void;
  onCancel: () => void;
}

export const AddTask: React.FC<AddTaskProps> = ({ onAddTasks, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedVariables, setSelectedVariables] = useState<Variable[]>([]);
  const [selectedCustomVariables, setSelectedCustomVariables] = useState<
    Variable[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomVariableModal, setShowCustomVariableModal] = useState(false);
  const [customVariableName, setCustomVariableName] = useState('');
  const [customVariableDescription, setCustomVariableDescription] =
    useState('');
  const [customVariableCategory, setCustomVariableCategory] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Sort categories alphabetically by name
        const sortedCategories = omopVariables
          .map((category) => ({
            ...category,
            // Sort variables within each category alphabetically by name
            variables: [...category.variables].sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(sortedCategories);
        setError(null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(omopVariables);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleVariableToggle = (variable: Variable) => {
    setSelectedVariables((prev) => {
      const isSelected = prev.some((v) => v.id === variable.id);
      if (isSelected) {
        return prev.filter((v) => v.id !== variable.id);
      } else {
        // Add the variable with its category
        const variableWithCategory = {
          ...variable,
          category: selectedCategoryData?.name || 'Unknown',
        };
        return [...prev, variableWithCategory];
      }
    });
  };

  const handleAddSelected = () => {
    if (selectedVariables.length > 0) {
      onAddTasks(selectedVariables, 'Mixed'); // Use 'Mixed' since variables can be from different categories
      setSelectedVariables([]);
      setSelectedCategory('');
      // Reset custom variable form
      setShowCustomVariableModal(false);
      setCustomVariableName('');
      setCustomVariableDescription('');
      setCustomVariableCategory('');
      setCustomCategoryName('');
      setShowCustomCategoryInput(false);
    }
  };

  const handleAddAllSelected = () => {
    const allVariables = [...selectedVariables, ...selectedCustomVariables];
    if (allVariables.length > 0) {
      // For custom variables, use their stored category (no prefix needed since we have visual indicators)
      const variablesWithCategories = selectedCustomVariables.map((v) => ({
        ...v,
        category: v.category,
      }));

      // Regular variables already have their categories stored
      onAddTasks([...selectedVariables, ...variablesWithCategories], 'Mixed');

      // Reset all selections
      setSelectedVariables([]);
      setSelectedCustomVariables([]);
      setSelectedCategory('');
      setShowCustomVariableModal(false);
      setCustomVariableName('');
      setCustomVariableDescription('');
      setCustomVariableCategory('');
      setCustomCategoryName('');
      setShowCustomCategoryInput(false);
    }
  };

  const handleRemoveVariable = (variableId: string) => {
    setSelectedVariables((prev) => prev.filter((v) => v.id !== variableId));
  };

  const handleRemoveCustomVariable = (variableId: string) => {
    setSelectedCustomVariables((prev) =>
      prev.filter((v) => v.id !== variableId)
    );
  };

  const handleAddCustomVariable = () => {
    const finalCategory = showCustomCategoryInput
      ? customCategoryName.trim()
      : customVariableCategory.trim();

    if (customVariableName.trim() && finalCategory) {
      const newVariable: Variable = {
        id: `custom-${Date.now()}`,
        name: customVariableName.trim(),
        conceptId: 'CUSTOM_001', // Default concept ID for custom variables
        description: customVariableDescription.trim() || undefined,
        category: finalCategory, // Store the category with the variable
      };

      // Add the custom variable to selected custom variables (separate from regular variables)
      setSelectedCustomVariables((prev) => [...prev, newVariable]);

      // Reset form
      setCustomVariableName('');
      setCustomVariableDescription('');
      setCustomVariableCategory('');
      setCustomCategoryName('');
      setShowCustomCategoryInput(false);
      setShowCustomVariableModal(false);
    }
  };

  const selectedCategoryData = categories.find(
    (cat) => cat.id === selectedCategory
  );

  if (loading) {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Add Missing Data Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center py-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                <p className='text-sm text-muted-foreground'>
                  Loading categories...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Add Missing Data Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <p className='text-red-600 mb-4'>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Add Missing Data Elements</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Select categories and variables that should be included to answer
            the question
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Category Selection and Custom Variable */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Category Selection */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select Category</label>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose a category...' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Variable Option */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Add Custom Variable</label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setShowCustomVariableModal(true)}
                className='w-full'
              >
                + Add Custom Variable
              </Button>
            </div>
          </div>

          {/* Custom Variable Modal */}
          <Dialog
            open={showCustomVariableModal}
            onOpenChange={setShowCustomVariableModal}
          >
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Add Custom Variable</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='modalVariableName'
                    className='text-sm font-medium'
                  >
                    Variable Name *
                  </Label>
                  <Input
                    id='modalVariableName'
                    value={customVariableName}
                    onChange={(e) => setCustomVariableName(e.target.value)}
                    placeholder='Enter variable name...'
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='modalVariableCategory'
                    className='text-sm font-medium'
                  >
                    Category *
                  </Label>
                  <Select
                    value={
                      showCustomCategoryInput
                        ? '__custom__'
                        : customVariableCategory
                    }
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        setShowCustomCategoryInput(true);
                        setCustomVariableCategory('');
                      } else {
                        setShowCustomCategoryInput(false);
                        setCustomVariableCategory(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Choose a category...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value='__custom__'
                        className='text-blue-600 font-medium'
                      >
                        + Add Custom Category
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Category Input */}
                {showCustomCategoryInput && (
                  <div className='space-y-2'>
                    <Label
                      htmlFor='modalCustomCategory'
                      className='text-sm font-medium'
                    >
                      Add Custom Category *
                    </Label>
                    <Input
                      id='modalCustomCategory'
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder='Enter custom category name...'
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <Label
                    htmlFor='modalVariableDescription'
                    className='text-sm font-medium'
                  >
                    Description (Optional)
                  </Label>
                  <Textarea
                    id='modalVariableDescription'
                    value={customVariableDescription}
                    onChange={(e) =>
                      setCustomVariableDescription(e.target.value)
                    }
                    placeholder='Enter variable description...'
                    className='min-h-[80px]'
                  />
                </div>

                <div className='flex gap-2 pt-4'>
                  <Button
                    onClick={handleAddCustomVariable}
                    disabled={
                      !customVariableName.trim() ||
                      (!customVariableCategory.trim() &&
                        !customCategoryName.trim())
                    }
                    className='flex-1'
                  >
                    Add Variable
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowCustomVariableModal(false);
                      setCustomVariableName('');
                      setCustomVariableDescription('');
                      setCustomVariableCategory('');
                      setCustomCategoryName('');
                      setShowCustomCategoryInput(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Variables Selection */}
          {selectedCategoryData && (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select Variables</label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto'>
                {selectedCategoryData.variables.map((variable) => (
                  <div
                    key={variable.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariables.some((v) => v.id === variable.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-border hover:border-blue-300'
                    }`}
                    onClick={() => handleVariableToggle(variable)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h4 className='font-medium text-sm'>{variable.name}</h4>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Concept ID: {variable.conceptId}
                        </p>
                        {variable.description && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {variable.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Variables Display */}
          {(selectedVariables.length > 0 ||
            selectedCustomVariables.length > 0) && (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Selected Variables</label>
              <div className='flex flex-wrap gap-2'>
                {/* Regular Variables from Dropdown */}
                {selectedVariables
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((variable) => (
                    <Badge
                      key={variable.id}
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      {variable.name}
                      <span className='text-xs text-muted-foreground'>
                        ({variable.category})
                      </span>
                      <button
                        onClick={() => handleRemoveVariable(variable.id)}
                        className='ml-1 hover:text-red-500'
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}

                {/* Custom Variables */}
                {selectedCustomVariables
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((variable) => (
                    <Badge
                      key={variable.id}
                      variant='secondary'
                      className='flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200'
                    >
                      {variable.name}
                      <span className='text-xs text-blue-500'>
                        ({variable.category})
                      </span>
                      <button
                        onClick={() => handleRemoveCustomVariable(variable.id)}
                        className='ml-1 hover:text-red-500'
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-2 pt-4'>
            {/* Add All Variables Button */}
            {(selectedVariables.length > 0 ||
              selectedCustomVariables.length > 0) && (
              <Button
                onClick={handleAddAllSelected}
                className='flex items-center gap-2'
              >
                <Plus size={16} />
                Add All Variables (
                {selectedVariables.length + selectedCustomVariables.length})
              </Button>
            )}

            <Button
              variant='outline'
              onClick={() => {
                // Reset all forms
                setShowCustomVariableModal(false);
                setCustomVariableName('');
                setCustomVariableDescription('');
                setCustomVariableCategory('');
                setSelectedVariables([]);
                setSelectedCustomVariables([]);
                onCancel();
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
