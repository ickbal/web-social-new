// This file provides instructions for setting up Google OAuth

/*
Steps to set up Google OAuth for Ickbal Watch Party:

1. Go to the Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Select "External" user type and click "Create"
5. Fill in the required information:
   - App name: Ickbal Watch Party
   - User support email: [your email]
   - Developer contact information: [your email]
6. Click "Save and Continue"
7. Skip adding scopes and click "Save and Continue"
8. Add test users if needed and click "Save and Continue"
9. Review your OAuth consent screen and click "Back to Dashboard"
10. Navigate to "Credentials" > "Create Credentials" > "OAuth client ID"
11. Select "Web application" as the application type
12. Name: Ickbal Watch Party Web Client
13. Add authorized JavaScript origins:
    - https://3000-i3dc0sfbqk2tujofiejpv-b2fcf0e7.manus.computer
14. Add authorized redirect URIs:
    - https://3000-i3dc0sfbqk2tujofiejpv-b2fcf0e7.manus.computer/api/auth/callback/google
15. Click "Create"
16. Copy the Client ID and Client Secret
17. Add these credentials to the .env file:
    GOOGLE_CLIENT_ID="your-client-id"
    GOOGLE_CLIENT_SECRET="your-client-secret"
*/
