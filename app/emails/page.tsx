// app/emails/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "../providers"; // <-- Import useTheme

// Define a type for our email object
type Email = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
};

export default function EmailsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme(); // <-- Use the theme
  const [emails, setEmails] = useState<Email[]>([]);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [emailCount, setEmailCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  // Helper: Get OpenAI key from localStorage
  const getApiKey = () => localStorage.getItem("openai_api_key");

  // 1. Fetch emails
  const fetchEmails = async (count: number) => {
    setIsLoading(true);
    setClassifications({}); // Clear old classifications
    try {
      const res = await fetch(`/api/gmail/fetch?maxResults=${count}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEmails(data);
      // Store in localStorage as requested
      localStorage.setItem("emails", JSON.stringify(data));
    } catch (error) {
      console.error(error);
      alert("Failed to fetch emails.");
    }
    setIsLoading(false);
  };

  // 2. Classify emails
  const handleClassify = async () => {
    const apiKey = getApiKey();

    // --- THIS IS THE NEW, MORE ROBUST CHECK ---
    if (!apiKey || apiKey === "null" || apiKey === "undefined") {
      return alert("API key not found in localStorage. Please log out and save your key.");
    }
    // --- END OF NEW CHECK ---

    if (emails.length === 0) return alert("No emails to classify.");

    setIsClassifying(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ emails }),
      });

      if (!res.ok) {
        // Try to get the error message from the backend
        const errorData = await res.json();
        throw new Error(errorData.error || "Classification failed");
      }

      const results: { id: string; category: string }[] = await res.json();

      // Convert array to a lookup object
      const classMap = results.reduce((acc, item) => {
        acc[item.id] = item.category;
        return acc;
      }, {} as Record<string, string>);

      setClassifications(classMap);
    } catch (error: any) {
      console.error(error);
      alert(error.message); // Show the specific error from the backend
    }
    setIsClassifying(false);
  };

  // 3. Handle auth and data loading on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      if (!getApiKey()) {
        router.push("/"); // No API key
      } else {
        const storedEmails = localStorage.getItem("emails");
        if (storedEmails) {
          setEmails(JSON.parse(storedEmails));
        } else {
          fetchEmails(emailCount);
        }
      }
    }
  }, [status, router]);

  // 4. Handle email count change
  const onCountChange = (count: number) => {
    setEmailCount(count);
    fetchEmails(count); // Re-fetch when count changes
  };

  // 5. Handle user logout
  const handleLogout = () => {
    localStorage.clear(); // Clear key and emails
    signOut({ callbackUrl: '/' }); // Sign out and redirect to home
  };

  // Helper for tag colors - updated with dark mode
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Important":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Promotions":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Social":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Marketing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Spam":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading your session...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={session.user?.image || `https://avatar.vercel.sh/${session.user?.email}.png`}
              alt="User"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{session.user?.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </header>

        <main>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <label htmlFor="emailCount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Emails to show:
              </label>
              <select
                id="emailCount"
                value={emailCount}
                onChange={(e) => onCountChange(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400"
              >
                <option>15</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <button
              onClick={handleClassify}
              disabled={isClassifying || isLoading || emails.length === 0}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isClassifying
                ? "Classifying..."
                : `Classify ${emails.length} Emails`}
            </button>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Fetching your emails...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This might take a moment.</p>
              </div>
            )}
            {!isLoading && emails.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No Emails Found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try fetching a different number of emails or checking your Gmail account.
                </p>
              </div>
            )}
            {!isLoading &&
              emails.map((email) => (
                <div
                  key={email.id}
                  className="p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-lg dark:hover:shadow-indigo-500/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900 dark:text-white">{email.from}</div>
                    {classifications[email.id] && (
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getCategoryColor(
                          classifications[email.id]
                        )}`}
                      >
                        {classifications[email.id]}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 dark:text-gray-300 mb-1">{email.subject}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {email.snippet}
                  </p>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
