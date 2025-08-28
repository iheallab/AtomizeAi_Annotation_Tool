# Batch ID Migration: String to Integer

## Overview

This document describes the migration of the `batch_id` field from string to integer type across the entire application.

## Changes Made

### Backend Changes

1. **Models Updated:**

   - `backend/models/dataModel.go`: Changed `BatchID` field from `string` to `int` in `Question` struct
   - `backend/models/annotationModel.go`: Changed `BatchID` field from `string` to `int` in `Annotation` struct

2. **Controllers Updated:**
   - `backend/controllers/dataUpload.go`: Updated request struct to expect `BatchID` as `int`

### Frontend Changes

1. **Types Updated:**

   - `frontend/src/types/index.ts`: Changed `batch_id` field from `string` to `number` in `Question` interface

2. **Components Updated:**
   - `frontend/src/context/QuestionContext.tsx`: Updated type definitions to use `number` for `batch_id`
   - `frontend/src/pages/Admin.tsx`: Updated upload functionality to handle integer batch IDs

## Migration Process

### Prerequisites

- Ensure you have a backup of your database
- Stop the application before running migration

### Running the Migration

1. **Compile the migration script:**

   ```bash
   cd backend/scripts
   go build migrate_batch_id.go
   ```

2. **Run the migration:**

   ```bash
   ./migrate_batch_id
   ```

3. **Verify the migration:**
   - Check that all documents have integer `batch_id` values
   - Restart the application and test functionality

### What the Migration Does

The migration script:

1. Connects to the database
2. Finds all documents with string `batch_id` values
3. Converts string values to integers where possible
4. Logs any conversion errors
5. Updates the documents in place

### Collections Affected

- `questions`
- `annotations`
- `annotations_dev`

## Breaking Changes

### API Changes

- The `/insert_questions` endpoint now expects `batch_id` as an integer instead of a string
- All responses containing `batch_id` will now return integers

### Frontend Changes

- Upload forms now require numeric input for batch ID
- TypeScript interfaces have been updated to expect numbers

## Rollback Plan

If you need to rollback:

1. **Database Rollback:**

   - Restore from backup
   - Or run a reverse migration script (convert int back to string)

2. **Code Rollback:**
   - Revert all the changes made to the model files
   - Revert frontend type changes
   - Revert controller changes

## Testing

After migration, test the following:

1. **Question Upload:**

   - Upload questions with integer batch IDs
   - Verify they are stored correctly

2. **Annotation Process:**

   - Create annotations and verify batch_id is handled correctly
   - Check that existing annotations still work

3. **Admin Dashboard:**
   - Verify upload functionality works with integer batch IDs
   - Check that all displays show correct batch ID values

## Notes

- The migration script handles conversion errors gracefully
- Non-numeric string batch IDs will be logged as errors and skipped
- The application will now enforce integer batch IDs going forward
- All new uploads must use integer batch IDs
