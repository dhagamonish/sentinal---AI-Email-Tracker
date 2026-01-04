
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export interface GmailConversation {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  sentAt: number;
  threadId: string;
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
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: finalId,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.access_token) onSuccess(response.access_token);
    },
  });
  client.requestAccessToken();
};

/**
 * Automatically discovers people you've emailed recently
 */
export const discoverSentLeads = async (token: string): Promise<GmailConversation[]> => {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent('is:sent')}&maxResults=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();
  if (!data.messages) return [];

  const leads: Map<string, GmailConversation> = new Map();

  for (const msg of data.messages) {
    const detailRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const detail = await detailRes.json();
    
    const headers = detail.payload.headers;
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
    const date = parseInt(detail.internalDate);
    
    // Extract clean email and name
    const match = to.match(/(.*)<(.*)>/) || [null, to, to];
    const name = match[1].trim() || match[2].split('@')[0];
    const email = match[2].trim();

    if (!leads.has(email)) {
      leads.set(email, {
        recipientEmail: email,
        recipientName: name,
        subject,
        sentAt: date,
        threadId: detail.threadId
      });
    }
  }

  return Array.from(leads.values());
};

/**
 * Checks if a specific recipient has replied
 */
export const checkHasReplied = async (token: string, email: string, since: number): Promise<boolean> => {
  const query = encodeURIComponent(`from:${email} after:${Math.floor(since / 1000)}`);
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();
  return !!(data.messages && data.messages.length > 0);
};
