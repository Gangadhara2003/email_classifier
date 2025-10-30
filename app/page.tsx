// app/page.tsx

"use client"; // Login page needs to be a client component

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // <-- Use next/navigation
import { useTheme } from "./providers";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter(); // <-- App Router hook
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState("");

  const handleSaveKey = () => {
    if (apiKey) {
      // Save the OpenAI key to localStorage as requested
      localStorage.setItem("openai_api_key", apiKey);
      alert("API Key saved!");
      // If logged in, redirect to emails page
      if (session) {
        router.push("/emails");
      }
    } else {
      alert("Please enter an API key.");
    }
  };

  useEffect(() => {
    // Check if user is logged in AND has an API key
    const storedKey = localStorage.getItem("openai_api_key");
    if (status === "authenticated" && storedKey) {
      router.push("/emails");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {theme === 'light' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Classifier
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Log in to classify your Gmail inbox
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-6">
          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.21 13.12a6 6 0 018.58 0l-.88.88a4.5 4.5 0 00-6.82 0l-.88-.88zM10 11a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
              Login with Google
            </button>
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">Welcome, {session.user?.name}!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Gemini API Key
            </label>
            <input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            onClick={handleSaveKey}
            disabled={!apiKey}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save API Key & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
