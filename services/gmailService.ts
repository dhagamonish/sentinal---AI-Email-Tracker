
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export interface GmailConversation {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  sentAt: number;
  threadId: string;
  body?: string;
}

/**
 * Initializes the Gmail OAuth2 flow using Google Identity Services.
 */
export const initGmailAuth = (clientId: string, onSuccess: (token: string) => void) => {
  const finalId = clientId.trim();
  
  if (!(window as any).google?.accounts?.oauth2) {
    console.error("Google Identity Services not loaded.");
    return;
  }

  const client = (window as any).google.accounts.oauth2.initTokenClient({
    client_id: finalId,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.access_token) {
        onSuccess(response.access_token);
      } else if (response.error) {
        console.error("OAuth Error:", response.error);
      }
    },
  });
  
  client.requestAccessToken();
};

/**
 * Automatically discovers people you've emailed recently
 */
export const discoverSentLeads = async (token: string): Promise<GmailConversation[]> => {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent('is:sent')}&maxResults=15`,
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
      
      const match = to.match(/(.*)<(.*)>/) || [null, to, to];
      const name = match[1]?.trim() || match[2]?.split('@')[0] || 'Unknown';
      const email = match[2]?.trim();

      if (email && !leads.has(email)) {
        leads.set(email, {
          recipientEmail: email,
          recipientName: name,
          subject,
          sentAt: date,
          threadId: detail.threadId,
          body: detail.snippet
        });
      }
    }

    return Array.from(leads.values());
  } catch (error) {
    console.error("Error fetching sent leads:", error);
    return [];
  }
};

/**
 * Gets the actual content of the latest reply from a specific email
 */
export const getLatestReply = async (token: string, email: string, since: number): Promise<{content: string, date: number} | null> => {
  try {
    const query = encodeURIComponent(`from:${email} after:${Math.floor(since / 1000)}`);
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    
    if (data.messages && data.messages.length > 0) {
      const latestId = data.messages[0].id;
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const detail = await detailRes.json();
      return {
        content: detail.snippet || "No preview available",
        date: parseInt(detail.internalDate)
      };
    }
    return null;
  } catch (error) {
    console.error("Error checking replies:", error);
    return null;
  }
};
