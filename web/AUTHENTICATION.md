# Phone Number Authentication System

## Overview
The SmartSchool app now includes a phone number-based authentication system that requires users to login before accessing the dashboard.

## Features
- **Phone Number & Password Login**: Users login with phone number and password
- **No Signup Required**: Admin manages user access behind the scenes
- **Password Visibility Toggle**: Show/hide password functionality
- **Protected Routes**: Dashboard routes are protected and require authentication
- **Logout Functionality**: Users can logout from the dashboard
- **Session Management**: Login state is stored in localStorage

## Authentication Flow
1. User clicks "Launch App" on landing page
2. User is redirected to `/login` page
3. User enters phone number (minimum 10 digits)
4. User enters password (minimum 6 characters)
5. System validates phone number and password
6. On successful login, user is redirected to dashboard
7. User can logout from dashboard navbar

## Test Credentials
For testing purposes, use these phone number and password combinations:

**Admin User:**
- Phone: 1234567890
- Password: admin123

**Teacher User:**
- Phone: 5551234567
- Password: teacher123

**Student User:**
- Phone: 9876543210
- Password: student123

**Password Requirements:**
- Minimum 6 characters
- Can use any combination of letters, numbers, and symbols

## Implementation Details

### Files Created/Modified:
1. **`src/pages/Login.jsx`** - New login page component
2. **`src/App.jsx`** - Updated routing with protected routes
3. **`src/pages/LandingPage.jsx`** - Updated "Launch App" button to link to login
4. **`src/components/layout/Navbar.jsx`** - Added logout functionality

### Authentication Logic:
- Phone number validation (minimum 10 digits)
- Session management using localStorage
- Protected route component
- Automatic redirect after login/logout

### Security Features:
- Input sanitization (removes non-numeric characters)
- Session-based authentication
- Protected routes
- Admin-managed access control

## Usage Instructions
1. Navigate to http://localhost:5173/
2. Click "Launch App" button
3. Enter a phone number (10+ digits)
4. Click "Continue" to login
5. You'll be redirected to the dashboard
6. Use the logout button in the navbar to logout

## Notes
- This is a frontend-only implementation for demo purposes
- In a production environment, this would integrate with a backend API
- Phone numbers are not stored permanently in this demo
- Admin manages user access through the backend system