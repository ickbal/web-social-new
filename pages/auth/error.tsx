import { useRouter } from "next/router";
import Head from "next/head";
import { getSiteName } from "../../lib/env";
import Link from "next/link";

export default function Error() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = () => {
    switch (error) {
      case "Signin":
        return "Try signing in with a different account.";
      case "OAuthSignin":
        return "Try signing in with a different account.";
      case "OAuthCallback":
        return "Try signing in with a different account.";
      case "OAuthCreateAccount":
        return "Try signing in with a different account.";
      case "EmailCreateAccount":
        return "Try signing in with a different email address.";
      case "Callback":
        return "Try signing in with a different account.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, sign in with the same account you used originally.";
      case "EmailSignin":
        return "Check your email address.";
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An unexpected error occurred.";
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>Error - {getSiteName()}</title>
      </Head>
      
      <div className="bg-dark-900 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        
        <div className="mb-6">
          <p className="text-red-400 mb-4">{getErrorMessage()}</p>
          <p className="text-sm text-gray-400">Error code: {error || "unknown"}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link href="/auth/signin" className="bg-primary-600 py-2 px-4 rounded hover:bg-primary-700 transition">
            Try again
          </Link>
          <Link href="/" className="bg-dark-700 py-2 px-4 rounded hover:bg-dark-600 transition">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
