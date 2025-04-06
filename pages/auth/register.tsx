import { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Head from "next/head";
import { getSiteName } from "../../lib/env";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to Google Sign In
    // No callback URL specified, will use the default redirect to create a new room
    signIn("google");
  }, []);

  return (
    <div className="min-h-screen bg-dark-800 text-white flex flex-col">
      <Head>
        <title>Register - {getSiteName()}</title>
      </Head>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-dark-900 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Create an account</h1>
          
          <div className="text-center">
            <p className="mb-4">Redirecting to Google Sign In...</p>
            <div className="animate-pulse">
              <svg className="inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              After signing in, you'll be redirected to a new watch room automatically.
            </p>
            
            <div className="text-center mt-4">
              <p className="text-sm">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-primary-400 hover:text-primary-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
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
