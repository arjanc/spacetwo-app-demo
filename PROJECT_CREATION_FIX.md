# Project Creation Fix

## Problem

The project creation was failing due to a restrictive and confusingly named constraint in Supabase:

- Constraint name: `projects_icon_when_type_icon`
- Error code: `23514` (check constraint violation)
- The constraint was too restrictive and the name was misleading

## Root Cause

The constraint `projects_icon_when_type_icon` enforced that:

- When `type = 'icon'`, the `icon` field must be NOT NULL
- When `type = 'text'`, the `label` field must be NOT NULL

However, the constraint name suggested it only applied to icon types, making debugging confusing.

## Solution

We've moved the validation from the database level to the application level for better flexibility and clearer error messages.

### Changes Made

#### 1. Database Level

- **File**: `supabase/remove-projects-constraint.sql`
- **Action**: Remove the restrictive constraint
- **Command**: Run the SQL script in your Supabase dashboard

#### 2. Frontend Validation (AddProjectModal.tsx)

- Added client-side validation for required fields
- Icon is required when project type is 'icon'
- Label is required when project type is 'text'
- Label length validation (max 4 characters)
- Updated UI to show required field indicators (\*)
- Disabled submit button when required fields are missing

#### 3. Backend Validation (app/api/projects/route.ts)

- Enhanced validation in POST endpoint
- Enhanced validation in PUT endpoint
- Clear error messages for each validation failure
- Proper handling of type-specific requirements

## How to Apply the Fix

### Step 1: Remove the Database Constraint

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of `supabase/remove-projects-constraint.sql`:

```sql
-- Remove the restrictive constraint from projects table
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_icon_when_type_icon;
```

### Step 2: Deploy the Code Changes

The frontend and backend validation changes are already implemented in the codebase.

### Step 3: Test the Fix

1. Try creating a project with type 'icon' - ensure icon upload is required
2. Try creating a project with type 'text' - ensure label is required
3. Verify that projects can be created successfully without the constraint error

## Benefits of This Approach

1. **Better User Experience**: Clear error messages at the application level
2. **Flexibility**: Easier to modify validation rules without database migrations
3. **Clarity**: No more confusing constraint names
4. **Maintainability**: Validation logic is in the application code where it belongs

## Validation Rules

### Icon Type Projects

- ✅ Icon upload is required
- ✅ Icon must be a valid image file
- ✅ Project name is required

### Text Type Projects

- ✅ Label is required
- ✅ Label cannot exceed 4 characters
- ✅ Project name is required

### Common Requirements

- ✅ Background and text colors are required
- ✅ User must be authenticated
