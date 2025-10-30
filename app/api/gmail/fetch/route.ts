// app/api/gmail/fetch/route.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth"; // <-- CHANGED
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// Helper function to decode Base64URL
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

export async function GET(req: NextRequest) {
  // Get the user's session and access token securely on the server
  const session: any = await getServerSession(authOptions); // <-- This now works

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const maxResults = searchParams.get("maxResults") || "15";

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const gmail = google.gmail({ version: "v1", auth });

    // 1. List messages
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: parseInt(maxResults),
    });

    const messages = listRes.data.messages;
    if (!messages || messages.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Get details for each message
    const emailPromises = messages.map(async (message) => {
      if (!message.id) return null;

      const msgRes = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const { payload } = msgRes.data;
      if (!payload || !payload.headers) return null;

      const headers = payload.headers;
      const from = headers.find((h) => h.name === "From")?.value || "";
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const snippet = msgRes.data.snippet || "";

      // Find and decode the email body
      let body = "";
      if (payload.parts) {
        const textPart = payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart && textPart.body && textPart.body.data) {
          body = base64UrlDecode(textPart.body.data);
        }
      } else if (payload.body && payload.body.data) {
        body = base64UrlDecode(payload.body.data);
      }

      return {
        id: msgRes.data.id,
        from,
        subject,
        snippet,
        body,
      };
    });

    const emails = (await Promise.all(emailPromises)).filter(Boolean); // Filter out any nulls
    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
