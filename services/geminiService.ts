
import { GoogleGenAI, Type } from "@google/genai";
import { FollowUpItem, EmailTracking } from "../types";

/**
 * Generates a professional follow-up email draft using Gemini AI.
 */
export const generateFollowUpDraft = async (item: FollowUpItem | EmailTracking): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing in environment. Using fallback draft.");
    return "Hi, just checking in to see if you received my previous email about " + item.subject + ". Best, " + (item as any).senderName || "Me";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dateValue = 'sentAt' in item ? item.sentAt : (item as EmailTracking).lastActivityAt;
  
  const prompt = `
    I sent a cold email to ${item.recipientName} about "${item.subject}" on ${new Date(dateValue).toLocaleDateString()}.
    They haven't replied. Write a very short (2-3 sentences), professional follow-up. 
    Don't be pushy. Just check in to see if they saw it.
    Only return the email body.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Just checking in on my previous email!";
  } catch (error) {
    console.error("Gemini Draft Generation Error:", error);
    return "Hi, just checking if you caught my last email. Best regards.";
  }
};

/**
 * Analyzes the content of a reply to categorize it.
 */
export const analyzeReplyContent = async (content: string): Promise<{category: string, summary: string}> => {
  if (!process.env.API_KEY) {
    return { category: 'REPLIED', summary: 'Reply detected (AI analysis unavailable)' };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this email reply from a potential lead and categorize it.
    Return a short summary and one of the following categories: 
    'INTERESTED', 'NOT_INTERESTED', 'QUESTIONS', 'UNSUBSCRIBE', 'REPLIED'.
    
    Email Content: "${content}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["category", "summary"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
      category: result.category || 'REPLIED',
      summary: result.summary || 'Responded to your outreach.'
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { category: 'REPLIED', summary: 'Responded to your outreach.' };
  }
};
