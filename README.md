# AI Email Classifier 📧✨

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This is a full-stack web application that allows users to log in with their Google account, fetch their recent Gmail emails, and use an AI model (like Google Gemini) to automatically classify them into categories.

## Features

-   **Google OAuth 2.0**: Securely log in with your Google account using Next-Auth.js.
-   **Gmail API Integration**: Fetches the last X emails (15, 25, or 50) from your inbox.
-   **AI Classification**: Uses Google Gemini (or OpenAI GPT-4o) with Langchain.js to classify emails in bulk.
-   **Save API Key**: Prompts the user for their AI API key and saves it to localStorage.
-   **Built with Next.js**: Uses the App Router for a modern, server-driven UI.
-   **Styled with Tailwind CSS**: A utility-first CSS framework for rapid UI development.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Authentication**: Next-Auth.js
-   **Styling**: Tailwind CSS
-   **AI**: Langchain.js (@langchain/google-genai)
-   **Schema Validation**: zod
-   **APIs**: Google Gmail API

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Setup

#### A. Prerequisites

-   Node.js (v20 or higher)
-   npm (v10 or higher)
-   A Google Cloud Project
-   A Google Gemini API Key

#### B. Google Cloud Console Setup

You must authorize your app to use the Gmail API.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Go to **APIs & Services > Enabled APIs & services** and **+ ENABLE** the **Gmail API**.
4.  Go to **OAuth consent screen**:
    -   Select **External** user type.
    -   Fill in the required app information (app name, user support email).
    -   On the **Scopes** page, add the `.../auth/gmail.readonly` scope.
    -   On the **Test users** page, click **+ Add Users** and add the Gmail account(s) you will be testing with.
5.  Go to **Credentials**:
    -   Click **+ CREATE CREDENTIALS > OAuth client ID**.
    -   Select **Web application** as the type.
    -   Under **Authorized JavaScript origins**, add `http://localhost:3000`.
    -   Under **Authorized redirect URIs**, add `http://localhost:3000/api/auth/callback/google`.
    -   Click **Create** and copy your **Client ID** and **Client Secret**.

#### C. Install Dependencies

```bash
npm install --legacy-peer-deps
```

#### D. Environment Variables

Create a file named `.env.local` in the root of your project and add the following:

```
# Google OAuth Credentials
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# Next-Auth Secret (generate a random string)
NEXTAUTH_SECRET="A_RANDOM_SECRET_STRING_FOR_JWT"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Run the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Deployment Configuration

When you deploy to Vercel, you must update your Vercel and Google Console settings.

1.  **Vercel Environment Variables**: In your Vercel project settings, add all the variables from your `.env.local` file:
    -   `GOOGLE_CLIENT_ID`
    -   `GOOGLE_CLIENT_SECRET`
    -   `NEXTAUTH_SECRET`
    -   `NEXTAUTH_URL` (Set this to your public Vercel URL, e.g., `https://your-app-name.vercel.app`)

2.  **Google Cloud Console Update**: Go back to your Google Console Credentials page and edit your OAuth Client:
    -   **Authorized JavaScript origins**: Add your Vercel URL (`https://your-app-name.vercel.app`)
    -   **Authorized redirect URIs**: Add your Vercel callback URL (`https://your-app-name.vercel.app/api/auth/callback/google`)