# SpaceTwo App API Documentation

## Overview

The SpaceTwo App API provides RESTful endpoints for managing projects, spaces, users, and file uploads. All endpoints use JSON for request and response bodies and integrate with Supabase for data persistence.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The API uses Supabase authentication. Ensure you have proper authentication headers when making requests to protected endpoints.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `500` - Internal Server Error

---

## Projects API

### Get All Projects

```http
GET /api/projects
```

**Description:** Retrieve all projects from the database.

**Response:**

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Get Single Project

```http
GET /api/projects?id={projectId}
```

**Parameters:**

- `id` (query string) - The project ID

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Create Project

```http
POST /api/projects
```

**Request Body:**

```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "message": "Project created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Update Project

```http
PUT /api/projects
```

**Request Body:**

```json
{
  "id": "string",
  "name": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "message": "Project updated successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Delete Project

```http
DELETE /api/projects?id={projectId}
```

**Parameters:**

- `id` (query string) - The project ID

**Response:**

```json
{
  "message": "Project deleted successfully"
}
```

**Note:** This performs a soft delete by setting `deleted: true` in the database.

---

## Spaces API

### Get All Spaces

```http
GET /api/spaces
```

**Description:** Retrieve all spaces from the database.

**Response:**

```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Get Single Space

```http
GET /api/spaces?id={spaceId}
```

**Parameters:**

- `id` (query string) - The space ID

**Response:**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Create Space

```http
POST /api/spaces
```

**Request Body:**

```json
{
  "title": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "message": "Space created successfully",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Update Space

```http
PUT /api/spaces
```

**Request Body:**

```json
{
  "id": "string",
  "title": "string",
  "description": "string"
}
```

**Response:**

```json
{
  "message": "Space updated successfully",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Delete Space

```http
DELETE /api/spaces?id={spaceId}
```

**Parameters:**

- `id` (query string) - The space ID

**Response:**

```json
{
  "message": "Space deleted successfully"
}
```

**Note:** This performs a soft delete by setting `deleted: true` in the database.

---

## Users API

### Create User

```http
POST /api/users
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "avatar": "string"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Delete User

```http
DELETE /api/users?id={userId}
```

**Parameters:**

- `id` (query string) - The user ID

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

**Note:** This performs a soft delete by setting `deleted: true` in the database.

---

## Upload API

### Generate Upload URL

```http
POST /api/upload
```

**Description:** Generate a signed upload URL for Supabase storage.

**Request Body:**

```json
{
  "path": "string"
}
```

**Response:**

```json
{
  "message": "Upload url created successfully",
  "data": {
    "signedUrl": "string",
    "token": "string",
    "path": "string"
  }
}
```

**Usage:**

1. Call this endpoint with the desired file path
2. Use the returned `signedUrl` to upload your file directly to Supabase storage
3. The file will be stored in the `avatars` bucket

---

## Supabase Keep-Alive API

### Keep Supabase Connection Active

```http
POST /api/supabase
```

**Description:** Internal endpoint to keep the Supabase connection active by inserting a test record.

**Response:**

```json
{}
```

**Status:** `201 Created`

**Note:** This is an internal utility endpoint used to prevent Supabase from going idle.

---

## Data Models

### Project

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  deleted?: boolean;
  created_at: string;
  updated_at: string;
}
```

### Space

```typescript
interface Space {
  id: string;
  title: string;
  description?: string;
  deleted?: boolean;
  created_at: string;
  updated_at: string;
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  deleted?: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Example Usage

### JavaScript/TypeScript

```javascript
// Get all projects
const response = await fetch("/api/projects");
const projects = await response.json();

// Create a new project
const newProject = await fetch("/api/projects", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "My New Project",
    description: "A sample project",
  }),
});

// Update a project
const updatedProject = await fetch("/api/projects", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id: "project-id",
    name: "Updated Project Name",
    description: "Updated description",
  }),
});

// Delete a project
await fetch("/api/projects?id=project-id", {
  method: "DELETE",
});
```

### cURL Examples

```bash
# Get all projects
curl -X GET https://your-domain.com/api/projects

# Create a project
curl -X POST https://your-domain.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Sample project"}'

# Update a project
curl -X PUT https://your-domain.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":"123","name":"Updated Project","description":"Updated description"}'

# Delete a project
curl -X DELETE https://your-domain.com/api/projects?id=123
```

---

## Development Notes

- All endpoints use Supabase for data persistence
- Soft deletes are implemented (records are marked as `deleted: true` instead of being removed)
- The API follows RESTful conventions
- Error handling is consistent across all endpoints
- File uploads use Supabase Storage with signed URLs for security

## Contributing

When adding new endpoints:

1. Follow the existing naming conventions
2. Implement proper error handling
3. Use consistent response formats
4. Add appropriate TypeScript interfaces
5. Update this documentation
