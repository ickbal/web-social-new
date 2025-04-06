import { GetServerSidePropsContext } from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Head from "next/head";
import { getSiteName } from "../../lib/env";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SignIn() {
  const router = useRouter();
  const { error, callbackUrl } = router.query;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to home if already signed in
    const checkAuth = async () => {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      if (session && session.user) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Use the callbackUrl if provided, otherwise it will use the default redirect to create-room
    await signIn("google", { callbackUrl: callbackUrl as string || undefined });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <Head>
        <title>Sign In - {getSiteName()}</title>
        <meta name="description" content="Sign in to Ickbal Watch Party to watch videos with friends" />
      </Head>
      
      <div className="max-w-md w-full p-8 bg-dark-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Sign in to {getSiteName()}
          </h2>
          <p className="text-gray-400 mb-6">Join the party and watch videos with friends!</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-gray-800 flex items-center justify-center py-3 px-4 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-70"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="mr-3">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-medium">{loading ? "Signing in..." : "Sign in with Google"}</span>
            </div>
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>By signing in, you'll be automatically redirected to a new watch room</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900 text-white rounded text-sm">
            {error === "OAuthSignin" && "Google sign-in failed. Please try again."}
            {error === "OAuthCallback" && "Google sign-in callback failed."}
            {error === "OAuthAccountNotLinked" && "Email already in use with different provider."}
            {error === "OAuthCreateAccount" && "Could not create account. Please try again."}
            {error === "Callback" && "Authentication callback failed."}
            {error === "Default" && "An error occurred during authentication."}
            {!["OAuthSignin", "OAuthCallback", "OAuthAccountNotLinked", "OAuthCreateAccount", "Callback", "Default"].includes(error as string) && 
              "Authentication failed. Please try again."}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // If the user is already logged in, redirect to the homepage
  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  
  return {
    props: {}
  };
}
