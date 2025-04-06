import { signOut } from "next-auth/react";
import { useEffect } from "react";
import Head from "next/head";
import { getSiteName } from "../../lib/env";

export default function SignOut() {
  useEffect(() => {
    // Sign out when the component mounts
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen bg-dark-800 text-white flex flex-col items-center justify-center">
      <Head>
        <title>Sign Out - {getSiteName()}</title>
      </Head>
      
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Signing you out...</h1>
        <p>You will be redirected to the home page shortly.</p>
      </div>
    </div>
  );
}
