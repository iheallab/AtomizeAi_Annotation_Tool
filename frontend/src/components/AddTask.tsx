import React, { useState, useEffect } from 'react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Plus, X, Check, ChevronsUpDown } from 'lucide-react';
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
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [variableSearchQuery, setVariableSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    (Variable & { category: string })[]
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [categoryVariableSearchQuery, setCategoryVariableSearchQuery] =
    useState('');
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);

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

  // Handle click outside search results and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.variable-search-container')) {
        setShowSearchResults(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSearchResults(false);
        setVariableSearchQuery('');
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [showSearchResults]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setOpenCategoryPopover(false);
    setCategoryVariableSearchQuery('');
  };

  const handleVariableSearch = (query: string) => {
    setVariableSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    // Simple debouncing - only search if query is at least 2 characters
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const results = categories.flatMap((category) =>
        category.variables
          .filter(
            (variable) =>
              variable.name.toLowerCase().includes(query.toLowerCase()) ||
              variable.conceptId.toLowerCase().includes(query.toLowerCase()) ||
              (variable.description &&
                variable.description
                  .toLowerCase()
                  .includes(query.toLowerCase()))
          )
          .map((variable) => ({
            ...variable,
            category: category.name,
          }))
      );

      setSearchResults(results);
      setShowSearchResults(true);
      setIsSearching(false);
    }, 100);
  };

  const handleVariableSelectFromSearch = (
    variable: Variable & { category: string }
  ) => {
    // Add the variable to selected variables
    const variableWithCategory = {
      ...variable,
      category: variable.category,
    };

    setSelectedVariables((prev) => {
      const isSelected = prev.some((v) => v.id === variable.id);
      if (isSelected) {
        return prev.filter((v) => v.id !== variable.id);
      } else {
        return [...prev, variableWithCategory];
      }
    });

    // Clear search
    setVariableSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleCategoryVariableSearch = (query: string) => {
    setCategoryVariableSearchQuery(query);
  };

  const getFilteredCategoryVariables = () => {
    if (!selectedCategoryData) return [];

    if (!categoryVariableSearchQuery.trim()) {
      return selectedCategoryData.variables;
    }

    return selectedCategoryData.variables.filter(
      (variable) =>
        variable.name
          .toLowerCase()
          .includes(categoryVariableSearchQuery.toLowerCase()) ||
        variable.conceptId
          .toLowerCase()
          .includes(categoryVariableSearchQuery.toLowerCase()) ||
        (variable.description &&
          variable.description
            .toLowerCase()
            .includes(categoryVariableSearchQuery.toLowerCase()))
    );
  };

  const handleRemoveAllVariables = () => {
    setSelectedVariables([]);
    setSelectedCustomVariables([]);
    setShowRemoveAllConfirm(false);
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

  const selectedCategoryName = selectedCategoryData?.name || '';

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
          {/* Variable Search */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Search Variables</label>
            <div className='relative variable-search-container'>
              <div className='relative'>
                <Input
                  placeholder='Search for variables by name, concept ID, or description...'
                  value={variableSearchQuery}
                  onChange={(e) => handleVariableSearch(e.target.value)}
                  className='w-full pr-8'
                />
                {isSearching && (
                  <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                  </div>
                )}
                {variableSearchQuery && !isSearching && (
                  <button
                    onClick={() => {
                      setVariableSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Type at least 2 characters to search. Results show variable
                name, concept ID, category, and description.
              </p>
              {showSearchResults && searchResults.length > 0 && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  <div className='p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs text-muted-foreground flex justify-between items-center'>
                    <span>
                      Found {searchResults.length} variable
                      {searchResults.length !== 1 ? 's' : ''}
                    </span>
                    {searchResults.length > 0 && (
                      <button
                        onClick={() => {
                          const unselectedResults = searchResults.filter(
                            (variable) =>
                              !selectedVariables.some(
                                (v) => v.id === variable.id
                              )
                          );
                          if (unselectedResults.length > 0) {
                            const variablesWithCategories =
                              unselectedResults.map((variable) => ({
                                ...variable,
                                category: variable.category,
                              }));
                            setSelectedVariables((prev) => [
                              ...prev,
                              ...variablesWithCategories,
                            ]);
                            setVariableSearchQuery('');
                            setSearchResults([]);
                            setShowSearchResults(false);
                          }
                        }}
                        className='text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                      >
                        Select All
                      </button>
                    )}
                  </div>
                  {searchResults.map((variable) => (
                    <div
                      key={variable.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedVariables.some((v) => v.id === variable.id)
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                      onClick={() => handleVariableSelectFromSearch(variable)}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-sm'>
                            {variable.name}
                          </h4>
                          <p className='text-xs text-muted-foreground mt-1'>
                            Concept ID: {variable.conceptId}
                          </p>
                          <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                            Category: {variable.category}
                          </p>
                          {variable.description && (
                            <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                              {variable.description}
                            </p>
                          )}
                        </div>
                        <div className='ml-2'>
                          {selectedVariables.some(
                            (v) => v.id === variable.id
                          ) ? (
                            <Check className='h-4 w-4 text-blue-600' />
                          ) : (
                            <Plus className='h-4 w-4 text-gray-400' />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showSearchResults &&
                searchResults.length === 0 &&
                variableSearchQuery.trim().length >= 2 && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3'>
                    <p className='text-sm text-muted-foreground text-center'>
                      No variables found for "{variableSearchQuery}"
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Category Selection and Custom Variable */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Category Selection */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select Category</label>
              <Popover
                open={openCategoryPopover}
                onOpenChange={setOpenCategoryPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openCategoryPopover}
                    className='w-full justify-between'
                  >
                    {selectedCategoryName || 'Choose a category...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Search categories...' />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => handleCategoryChange(category.id)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedCategory === category.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='w-full justify-between'
                      >
                        {showCustomCategoryInput
                          ? customCategoryName
                          : customVariableCategory || 'Choose a category...'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0' align='start'>
                      <Command>
                        <CommandInput placeholder='Search categories...' />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value='__custom__'
                              onSelect={() => {
                                setShowCustomCategoryInput(true);
                                setCustomVariableCategory('');
                              }}
                              className='text-blue-600 font-medium'
                            >
                              <Plus className='mr-2 h-4 w-4' />+ Add Custom
                              Category
                            </CommandItem>
                            {categories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => {
                                  setShowCustomCategoryInput(false);
                                  setCustomVariableCategory(category.name);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    customVariableCategory === category.name
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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

          {/* Remove All Confirmation Dialog */}
          <Dialog
            open={showRemoveAllConfirm}
            onOpenChange={setShowRemoveAllConfirm}
          >
            <DialogContent className='sm:max-w-[400px]'>
              <DialogHeader>
                <DialogTitle>Remove All Variables</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Are you sure you want to remove all{' '}
                  {selectedVariables.length + selectedCustomVariables.length}{' '}
                  selected variables? This action cannot be undone.
                </p>
                <div className='flex gap-2 pt-4'>
                  <Button
                    variant='destructive'
                    onClick={handleRemoveAllVariables}
                    className='flex-1'
                  >
                    Remove All
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setShowRemoveAllConfirm(false)}
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
              <div className='flex justify-between items-center'>
                <label className='text-sm font-medium'>Select Variables</label>
                {getFilteredCategoryVariables().length > 0 && (
                  <button
                    onClick={() => {
                      const unselectedVariables =
                        getFilteredCategoryVariables().filter(
                          (variable) =>
                            !selectedVariables.some((v) => v.id === variable.id)
                        );
                      if (unselectedVariables.length > 0) {
                        const variablesWithCategory = unselectedVariables.map(
                          (variable) => ({
                            ...variable,
                            category: selectedCategoryData.name,
                          })
                        );
                        setSelectedVariables((prev) => [
                          ...prev,
                          ...variablesWithCategory,
                        ]);
                      }
                    }}
                    className='text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    Select All Visible ({getFilteredCategoryVariables().length})
                  </button>
                )}
              </div>

              {/* Category Variable Search */}
              <div className='relative'>
                <Input
                  placeholder={`Search variables in ${selectedCategoryData.name}...`}
                  value={categoryVariableSearchQuery}
                  onChange={(e) => handleCategoryVariableSearch(e.target.value)}
                  className='w-full'
                />
                {categoryVariableSearchQuery && (
                  <button
                    onClick={() => setCategoryVariableSearchQuery('')}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Search for variables by name, concept ID, or description within
                this category
              </p>

              {/* Search Results Summary */}
              {categoryVariableSearchQuery && (
                <div className='text-xs text-muted-foreground'>
                  {getFilteredCategoryVariables().length > 0
                    ? `Found ${getFilteredCategoryVariables().length} variable${
                        getFilteredCategoryVariables().length !== 1 ? 's' : ''
                      } in ${selectedCategoryData.name}`
                    : `No variables found in ${selectedCategoryData.name} matching "${categoryVariableSearchQuery}"`}
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto'>
                {getFilteredCategoryVariables().length > 0 ? (
                  getFilteredCategoryVariables().map((variable) => (
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
                          <h4 className='font-medium text-sm'>
                            {variable.name}
                          </h4>
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
                  ))
                ) : categoryVariableSearchQuery ? (
                  <div className='col-span-2 p-8 text-center text-muted-foreground'>
                    <p>
                      No variables found matching "{categoryVariableSearchQuery}
                      "
                    </p>
                    <p className='text-xs mt-1'>
                      Try adjusting your search terms
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Selected Variables Display */}
          {selectedVariables.length > 0 ||
          selectedCustomVariables.length > 0 ? (
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <label className='text-sm font-medium'>
                  Selected Variables
                </label>
                <button
                  onClick={() => setShowRemoveAllConfirm(true)}
                  className={`text-xs hover:underline flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    selectedVariables.length + selectedCustomVariables.length >
                    5
                      ? 'text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                      : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                  }`}
                  title={`Remove all ${
                    selectedVariables.length + selectedCustomVariables.length
                  } selected variables`}
                >
                  <X size={12} />
                  Remove All (
                  {selectedVariables.length + selectedCustomVariables.length})
                </button>
              </div>
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
          ) : (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-muted-foreground'>
                Selected Variables
              </label>
              <p className='text-xs text-muted-foreground'>
                No variables selected yet. Use the search above or select a
                category to add variables.
              </p>
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
