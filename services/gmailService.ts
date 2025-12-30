
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export interface GmailMessage {
  snippet: string;
  from: string;
  date: string;
}

/**
 * Aggressively cleans the Client ID to prevent "doubling" errors.
 */
const cleanClientId = (id: string): string => {
  let cleaned = id.trim().replace(/[\s\n\r]/g, '');
  
  // If the ID was accidentally pasted twice (e.g. "abc.comabc.com")
  const mid = Math.floor(cleaned.length / 2);
  const firstHalf = cleaned.substring(0, mid);
  const secondHalf = cleaned.substring(mid);
  
  if (firstHalf === secondHalf && cleaned.length > 20) {
    console.warn("Detected doubled Client ID, fixing...");
    return firstHalf;
  }
  
  return cleaned;
};

export const initGmailAuth = (clientId: string, onSuccess: (token: string) => void) => {
  const finalId = cleanClientId(clientId);
  
  if (!finalId || finalId.length < 10) {
    throw new Error("Invalid Client ID. Please check System Settings.");
  }

  // @ts-ignore
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    throw new Error("Google Identity SDK not loaded. Please refresh the page.");
  }

  try {
    // @ts-ignore
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: finalId,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          onSuccess(response.access_token);
        } else if (response.error) {
          const errMsg = response.error_description || response.error;
          console.error("GSI Error:", response);
          alert(`Google Auth Error (${response.error}): ${errMsg}`);
        }
      },
    });
    
    // Request access with a prompt to ensure account selection
    client.requestAccessToken();
  } catch (error: any) {
    console.error("Auth Exception:", error);
    throw new Error("Failed to initialize Google Auth: " + error.message);
  }
};

export const fetchLatestReply = async (token: string, emailAddress: string): Promise<GmailMessage | null> => {
  try {
    const query = encodeURIComponent(`from:${emailAddress}`);
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=1`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (!response.ok) {
        if (response.status === 401) throw new Error("Auth Token Expired");
        return null;
    }

    const data = await response.json();

    if (data.messages && data.messages.length > 0) {
      const msgId = data.messages[0].id;
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const msgData = await msgRes.json();
      
      return {
        snippet: msgData.snippet,
        from: emailAddress,
        date: msgData.internalDate
      };
    }
    return null;
  } catch (error) {
    console.error("Gmail API Error:", error);
    throw error;
  }
};
