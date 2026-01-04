
import { GoogleGenAI, Type } from "@google/genai";
import { EmailTracking } from "../types";

// Initialize the Google GenAI SDK with the API key from environment variables.
// Use new GoogleGenAI({ apiKey: process.env.API_KEY }) as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a personalized follow-up email draft based on lead history using Gemini.
 * @param email The tracking object containing history and lead details.
 */
export const generateFollowUpDraft = async (email: EmailTracking): Promise<string> => {
  // Construct context from previous interaction history
  const historyContext = email.history
    .map(h => `${h.type === 'initial' ? 'Initial Email' : 'Follow-up'}: ${h.content}`)
    .join('\n\n');

  const prompt = `You are a world-class professional outreach assistant. 
Generate a short, polite, and effective follow-up email for a lead named ${email.recipientName} regarding "${email.subject}".
This is follow-up #${email.followUpCount + 1}.

Previous interaction history for context:
${historyContext}

Provide ONLY the text of the email body. Do not include subject lines, placeholders like [Your Name], or sign-offs.`;

  try {
    // Using gemini-3-flash-preview for the draft generation task
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access the .text property directly as per SDK guidelines
    return response.text || "";
  } catch (error) {
    console.error("Gemini error generating draft:", error);
    return "";
  }
};

/**
 * Analyzes the sentiment and intent of a lead's reply using Gemini.
 * @param content The raw text content of the reply.
 */
export const analyzeReplyContent = async (content: string) => {
  try {
    // Use structured output for categorization to ensure consistent lead tracking
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following email reply from a lead and determine if they are interested or want to be removed from the list.\n\nReply content:\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "Must be either 'REPLIED' (interested/neutral) or 'DISCARDED' (opt-out/hostile).",
            },
            summary: {
              type: Type.STRING,
              description: "A one-sentence summary of the reply.",
            },
          },
          required: ["category", "summary"],
        },
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    
    return {
      category: data.category === 'DISCARDED' ? 'DISCARDED' : 'REPLIED',
      summary: data.summary || 'Lead response received.'
    };
  } catch (error) {
    console.error("Gemini error analyzing reply:", error);
    return { category: 'REPLIED', summary: 'Lead response received.' };
  }
};
