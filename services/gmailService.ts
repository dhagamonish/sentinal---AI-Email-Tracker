
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  to: string;
  date: string;
  subject: string;
}

const cleanClientId = (id: string): string => {
  let cleaned = id.trim().replace(/[\s\n\r]/g, '');
  const mid = Math.floor(cleaned.length / 2);
  const firstHalf = cleaned.substring(0, mid);
  const secondHalf = cleaned.substring(mid);
  if (firstHalf === secondHalf && cleaned.length > 20) return firstHalf;
  return cleaned;
};

export const initGmailAuth = (clientId: string, onSuccess: (token: string) => void) => {
  const finalId = cleanClientId(clientId);
  // @ts-ignore
  if (!window.google) throw new Error("Google SDK not loaded");
  try {
    // @ts-ignore
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: finalId,
      scope: SCOPES,
      callback: (response: any) => response.access_token && onSuccess(response.access_token),
    });
    client.requestAccessToken();
  } catch (error: any) {
    throw new Error("Failed to initialize Google Auth: " + error.message);
  }
};

export const fetchSentEmails = async (token: string): Promise<GmailMessage[]> => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:sent&maxResults=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return [];
  const data = await response.json();
  if (!data.messages) return [];

  const details = await Promise.all(data.messages.map(async (m: { id: string }) => {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await res.json();
    const headers = d.payload.headers;
    return {
      id: d.id,
      threadId: d.threadId,
      snippet: d.snippet,
      from: headers.find((h: any) => h.name === 'From')?.value || '',
      to: headers.find((h: any) => h.name === 'To')?.value || '',
      date: d.internalDate,
      subject: headers.find((h: any) => h.name === 'Subject')?.value || '',
    };
  }));
  return details;
};

export const checkThreadStatus = async (token: string, threadId: string): Promise<{ hasReply: boolean; snippet?: string; date?: string; from?: string }> => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return { hasReply: false };
  const data = await response.json();

  // A reply is a message in the thread NOT from me
  // For simplicity, we assume if total messages > 1, there's likely a reply, 
  // but let's be precise: find the latest message that isn't from the user.
  const messages = data.messages || [];
  const replies = messages.filter((m: any) => {
    const from = m.payload.headers.find((h: any) => h.name === 'From')?.value || '';
    return !from.includes('me') && !from.includes(messages[0].payload.headers.find((h: any) => h.name === 'From')?.value);
  });

  if (replies.length > 0) {
    const latest = replies[replies.length - 1];
    return {
      hasReply: true,
      snippet: latest.snippet,
      date: latest.internalDate,
      from: latest.payload.headers.find((h: any) => h.name === 'From')?.value
    };
  }
  return { hasReply: false };
};

export const sendGmail = async (token: string, to: string, subject: string, body: string, threadId?: string): Promise<boolean> => {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    ...(threadId ? [`In-Reply-To: ${threadId}`, `References: ${threadId}`] : []),
    '',
    body,
  ];
  const message = messageParts.join('\n');
  const encodedMessage = btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: encodedMessage, threadId })
  });
  return response.ok;
};

export const fetchLatestReply = async (token: string, emailAddress: string): Promise<any | null> => {
  const query = encodeURIComponent(`from:${emailAddress}`);
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data.messages && data.messages.length > 0) {
    const msgId = data.messages[0].id;
    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const msgData = await msgRes.json();
    return { snippet: msgData.snippet, from: emailAddress, date: msgData.internalDate };
  }
  return null;
};
