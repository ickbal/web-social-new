# Google OAuth Configuration Guide

## Issue Description
You're experiencing a "redirect_uri_mismatch" error when trying to authenticate with Google. This happens because the callback URL your application is using doesn't match what's configured in your Google Cloud Console project.

## How to Fix the Issue

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Configuration**
   - Go to "APIs & Services" > "Credentials"
   - Find your OAuth 2.0 Client ID
   - Click on the edit (pencil) icon

3. **Update Authorized Redirect URIs**
   - Add: `http://localhost:3004/api/auth/callback/google`
   - This matches the port (3004) that your application is currently running on
   - Save the changes

4. **Alternative: Run Application on Port 3000**
   - If you can't modify the Google Cloud Console settings:
   - Find what process is using port 3000: `tasklist /fi "pid eq PID_NUMBER"`
   - Terminate that process: `taskkill /F /PID PID_NUMBER`
   - Update your .env file to use port 3000
   - Run the application with: `npm run dev`

## Current Configuration
- Your application is running on: `http://localhost:3004`
- NextAuth callback URL: `http://localhost:3004/api/auth/callback/google`
- Your Google OAuth client is likely expecting: `http://localhost:3000/api/auth/callback/google`

## Testing Your Changes
After making changes, try to sign in with Google again. If you've correctly updated the redirect URIs in Google Cloud Console, the authentication should now work. 