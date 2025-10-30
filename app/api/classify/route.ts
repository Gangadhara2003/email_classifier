// app/api/classify/route.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";

// 1. Define the categories
const categories = [
  "Important",
  "Promotions",
  "Social",
  "Marketing",
  "Spam",
  "General",
] as const;

// 2. Define the Zod schema
const emailClassificationSchema = z.object({
  id: z.string().describe("The unique ID of the email"),
  category: z
    .enum(categories)
    .describe("The *single* most appropriate category for the email"),
  reason: z
    .string()
    .describe("A brief (1-sentence) reason for the classification."),
});

const bulkClassificationSchema = z.object({
  classifications: z
    .array(emailClassificationSchema)
    .describe("The array of classification results for all emails."),
});

// 4. Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(
  `You are an expert email classifier. Classify the following list of emails (provided as a JSON array) into one of the following categories: ${categories.join(
    ", "
  )}.

Rules:
- Important: Personal or work-related, urgent, requires action.
- Promotions: Sales, discounts, marketing campaigns.
- Social: Notifications from social media, friends, family.
- Marketing: Newsletters, product updates, non-urgent announcements.
- Spam: Unwanted, unsolicited, phishing.
- General: If none of the above fit.

Respond *only* with a JSON object that matches the requested schema.

Emails to classify:
{email_list}
`
);

export async function POST(req: NextRequest) {
  try {
    const { emails } = await req.json();
    const geminiKey = req.headers.get("authorization")?.split(" ")[1];

    // --- THIS IS THE UPDATED CHECK ---
    if (!geminiKey || geminiKey === "null" || geminiKey === "undefined") {
      return NextResponse.json(
        { error: "Missing or invalid API key. Please log out and save your key." },
        { status: 401 } // 401 Unauthorized
      );
    }
    // --- END OF UPDATED CHECK ---

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: "Invalid emails list" }, { status: 400 });
    }

    const emailsToClassify = emails.map((e) => ({
      id: e.id,
      from: e.from,
      subject: e.subject,
      snippet: e.snippet,
    }));

    const model = new ChatGoogleGenerativeAI({
  model: "gemini-pro", // <-- THIS IS THE FIX
  apiKey: geminiKey,
  temperature: 0,
}).withStructuredOutput(bulkClassificationSchema);

    const chain = promptTemplate.pipe(model);

    const result = await chain.invoke({
      email_list: JSON.stringify(emailsToClassify),
    });

    return NextResponse.json(result.classifications);
  } catch (error: any) {
    console.error("Classification error:", error);
    // Send back a more specific error message
    return NextResponse.json(
      { error: `Google API Error: ${error.message}` },
      { status: 500 }
    );
  }
}
