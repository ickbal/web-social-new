# Deployment Instructions for Ickbal Watch Party

This document provides instructions for deploying the Ickbal Watch Party application to various platforms.

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Git

## Application Structure

The application is a Next.js project with the following key features:
- Authentication system with Google OAuth and email/password login
- User profiles
- Real-time synchronized video watching
- Redis for state management

## Deployment Options

### 1. Vercel (Recommended for Next.js)

Vercel is the platform built by the creators of Next.js and offers the simplest deployment experience.

1. Create an account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm install -g vercel`
3. Login to Vercel: `vercel login`
4. Navigate to the project directory and run: `vercel`
5. Follow the prompts to deploy
6. For production deployment: `vercel --prod`

**Environment Variables to Configure:**
- `SITE_NAME`: "Ickbal Watch Party"
- `PUBLIC_DOMAIN`: Your deployed domain (e.g., "https://ickbal-watch-party.vercel.app")
- `REDIS_URL`: URL to your Redis instance
- `NEXTAUTH_URL`: Same as your PUBLIC_DOMAIN
- `NEXTAUTH_SECRET`: A secure random string for session encryption
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### 2. Netlify

1. Create an account at [netlify.com](https://netlify.com)
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Login to Netlify: `netlify login`
4. Navigate to the project directory and run: `netlify init`
5. Configure build settings:
   - Build command: `yarn build`
   - Publish directory: `.next`
6. Deploy with: `netlify deploy --prod`

**Note:** You'll need to configure the same environment variables as listed for Vercel.

### 3. Render

1. Create an account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure as a Node.js application
5. Set build command: `yarn && yarn build`
6. Set start command: `yarn start`
7. Add the environment variables listed above

### 4. Railway

1. Create an account at [railway.app](https://railway.app)
2. Create a new project
3. Deploy from GitHub repository
4. Configure as a Node.js application
5. Add the environment variables listed above

### 5. Heroku

1. Create an account at [heroku.com](https://heroku.com)
2. Install Heroku CLI: `npm install -g heroku`
3. Login to Heroku: `heroku login`
4. Create a new app: `heroku create ickbal-watch-party`
5. Add Redis add-on: `heroku addons:create heroku-redis:hobby-dev`
6. Deploy the application: `git push heroku main`
7. Configure environment variables through Heroku dashboard

## Redis Configuration

For production deployment, you'll need a Redis instance. Options include:
- [Upstash](https://upstash.com) - Serverless Redis (works well with Vercel)
- [Redis Labs](https://redis.com) - Managed Redis service
- Self-hosted Redis on a VPS

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Navigate to "APIs & Services" > "OAuth consent screen"
4. Configure the consent screen
5. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
6. Set up a Web application
7. Add authorized JavaScript origins (your domain)
8. Add authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`
9. Copy the Client ID and Client Secret to your environment variables

## Testing Your Deployment

After deployment, verify:
1. The application loads without errors
2. Authentication works (both email/password and Google OAuth)
3. User profiles can be viewed and edited
4. Room creation and joining works
5. Video synchronization functions correctly

## Troubleshooting

- If you encounter hydration errors, ensure environment variables are correctly set
- For Redis connection issues, verify your Redis URL is correct and accessible
- For authentication problems, check that your OAuth credentials and redirect URIs are properly configured
