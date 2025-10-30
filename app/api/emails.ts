import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getGmailClient, listMessages, getMessage } from "../../lib/gmail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const gmail = await getGmailClient(session.accessToken as string);
    const messages = await listMessages(gmail, "is:unread", 10);

    const emails = await Promise.all(
      messages.map(async (message: any) => {
        const msg = await getMessage(gmail, message.id);
        const headers = msg.payload.headers;
        const from = headers.find((h: any) => h.name === "From").value;
        const subject = headers.find((h: any) => h.name === "Subject").value;
        return {
          id: msg.id,
          from,
          subject,
          snippet: msg.snippet,
        };
      })
    );

    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
}
