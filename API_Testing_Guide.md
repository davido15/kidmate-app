# KidMate API Testing Guide

## Overview
This guide explains how to test the KidMate API endpoints using the provided Postman collection.

## Setup Instructions

### 1. Import Postman Collection
1. Open Postman
2. Click "Import" button
3. Select the `KidMate_API_Collection.json` file
4. The collection will be imported with all endpoints organized in folders

### 2. Configure Environment Variables
The collection uses two environment variables:
- `base_url`: Set to `http://localhost:5000` (or your Flask server URL)
- `access_token`: Will be automatically set after successful login

### 3. Start the Flask Server
```bash
cd backend
source venv/bin/activate
python app.py
```

## Testing Flow

### Step 1: Authentication
1. **User Login** - Use the "User Login" request with:
   ```json
   {
     "email": "test22@gmail.com",
     "password": "password"
   }
   ```
2. Copy the `access_token` from the response
3. Set the `access_token` environment variable in Postman

### Step 2: Test User Info
1. **Get User Info** - This will return user details and parent information if linked

### Step 3: Test Children Data
1. **Get Children** - Returns all children for the authenticated parent
2. **Get Child Attendance** - Get attendance records for a specific child (use child ID from previous response)
3. **Get Child Grades** - Get grade records for a specific child
4. **Get Child Summary** - Get comprehensive summary including attendance and grade statistics

## Key API Endpoints

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/me` - Get current user info with parent data

### Children & Parent Data
- `GET /api/get-children` - Get all children for authenticated parent
- `GET /api/get-child-attendance/{child_id}` - Get attendance records
- `GET /api/get-child-grades/{child_id}` - Get grade records
- `GET /api/get-child-summary/{child_id}` - Get comprehensive summary

### Admin Endpoints
- `GET /api/get-unlinked-parents` - Get parents not linked to users
- `GET /api/get-users` - Get all users
- `POST /api/link-parent-to-user` - Link parent to user
- `POST /api/add-parent` - Add new parent
- `POST /api/add-kid` - Add new kid

### Pickup Management
- `POST /api/assign-pickup` - Assign pickup person to kid
- `POST /api/scan-pickup` - Scan pickup verification

### Journey & Status
- `GET /get_all_journeys` - Get all pickup journeys
- `GET /get_user_journeys` - Get user-specific journeys
- `GET /get_status` - Get current status
- `POST /update_status` - Update journey status

### Payments
- `GET /get_payments` - Get all payments
- `POST /add_dummy_payments` - Add test payment data

## Sample Test Data

### Test User Credentials
- Email: `test22@gmail.com`
- Password: `password`

### Expected Response Structure

#### Login Response
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test22@gmail.com",
    "role": "parent"
  }
}
```

**Note**: The response returns `token` for compatibility with the mobile app. Make sure to use `token` in your Postman environment variables.

#### Get Children Response
```json
{
  "success": true,
  "children": [
    {
      "id": 1,
      "name": "Hanna Yay",
      "age": 10,
      "grade": "Grade 5",
      "school": "St. Mary Primary School",
      "parent_id": 1
    }
  ],
  "parent": {
    "id": 1,
    "name": "Dornyoh David",
    "phone": "+1234567890"
  }
}
```

#### Child Summary Response
```json
{
  "success": true,
  "child": {
    "id": 1,
    "name": "Hanna Yay",
    "age": 10,
    "grade": "Grade 5",
    "school": "St. Mary Primary School"
  },
  "recent_attendance": [...],
  "recent_grades": [...],
  "attendance_stats": {
    "total_days": 20,
    "present_days": 18,
    "absent_days": 1,
    "late_days": 1,
    "attendance_percentage": 90.0
  },
  "grades_stats": {
    "total_grades": 15,
    "average_grade": 85.5,
    "lowest_grade": 75,
    "highest_grade": 95
  }
}
```

## Troubleshooting

### Common Issues
1. **Server not running**: Make sure Flask server is started on port 5000
2. **Authentication failed**: Check if user exists in database
3. **No children returned**: Verify parent is linked to user via `user_email`
4. **Missing data**: Ensure test data exists in database

### Database Setup
Make sure the following relationships exist:
- User (email) → Parent (user_email)
- Parent (id) → Kids (parent_id)
- Kids (id) → Grades (kid_id)
- Kids (id) → Attendance (child_id)

### Test Data Verification
Run these SQL queries to verify data:
```sql
-- Check user-parent relationship
SELECT u.email, p.name FROM users u 
JOIN parents p ON u.email = p.user_email;

-- Check parent-kids relationship
SELECT p.name as parent_name, k.name as child_name, k.grade, k.school 
FROM parents p 
JOIN kids k ON p.id = k.parent_id;
```

## Mobile App Integration

The mobile app uses these endpoints:
- `getChildren()` - Fetches children for authenticated parent
- `getChildSummary(childId)` - Gets comprehensive child data
- `getChildAttendance(childId)` - Gets attendance records
- `getChildGrades(childId)` - Gets grade records

The app automatically handles:
- JWT token management
- Error handling and loading states
- Data formatting and display
- Pull-to-refresh functionality 