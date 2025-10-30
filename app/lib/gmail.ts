import { google } from "googleapis";

export async function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function listMessages(
  gmail: any,
  query: string,
  maxResults: number
) {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });
  return res.data.messages || [];
}

export async function getMessage(gmail: any, messageId: string) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });
  return res.data;
}
