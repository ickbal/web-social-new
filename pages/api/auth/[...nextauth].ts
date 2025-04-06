import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Get the domain from the environment or default to localhost
const baseUrl = process.env.PUBLIC_DOMAIN || 'http://localhost:3005';

// Configure authentication options
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account"
        }
      },
      // Explicitly set the callback URL
      httpOptions: {
        timeout: 40000,
      }
    }),
  ],
  // Explicitly set the callback URL for testing purposes
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user info to token when they sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to session from token
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Log the redirect attempt
      console.log(`NextAuth redirect called with URL: ${url}, baseUrl: ${baseUrl}`);
      
      // If the callback URL includes a specific room ID, honor that
      if (url.includes('/room/')) {
        console.log(`Redirecting to room URL: ${url}`);
        return url;
      }
      
      // For other cases, redirect to create a new room
      const redirectUrl = `${baseUrl}/api/create-room`;
      console.log(`Redirecting to create-room API: ${redirectUrl}`);
      return redirectUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
