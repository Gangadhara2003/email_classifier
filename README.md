# AI Email Classifier 📧✨

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This is a full-stack web application that allows users to log in with their Google account, fetch their recent Gmail emails, and use the **Google Gemini** AI model to automatically classify them into categories.

## Features

-   **Google OAuth 2.0**: Securely log in with your Google account using Next-Auth.js.
-   **Gmail API Integration**: Fetches the last X emails (15, 25, or 50) from your inbox.
-   **AI Classification**: Uses **Google Gemini** with Langchain.js to classify emails in bulk.
-   **Save API Key**: Prompts the user for their Gemini API key and saves it to `localStorage`.
-   **Built with Next.js**: Uses the App Router for a modern, server-driven UI.
-   **Styled with Tailwind CSS**: A utility-first CSS framework for rapid UI development.

## Tech Stack

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Authentication**: Next-Auth.js
-   **Styling**: Tailwind CSS
-   **AI**: Langchain.js (`@langchain/google-genai`)
-   **Schema Validation**: `zod`
-   **APIs**: Google Gmail API

---

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Setup

#### A. Prerequisites

-   Node.js (v20 or higher)
-   npm (v10 or higher)
-   A Google Cloud Project
-   A **Google Gemini API Key** (from [Google AI Studio](https://ai.google.dev/))

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
