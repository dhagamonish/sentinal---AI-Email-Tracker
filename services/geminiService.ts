
import { GoogleGenAI } from "@google/genai";
import { FollowUpItem, EmailTracking } from "../types";

// Always use the process.env.API_KEY directly as per the coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a professional follow-up email draft using Gemini AI.
 * This helper handles both the simplified FollowUpItem and more detailed EmailTracking objects.
 */
export const generateFollowUpDraft = async (item: FollowUpItem | EmailTracking): Promise<string> => {
  // Extract the most relevant date for context in the AI prompt.
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
    // Extract text from the response using the .text property as per SDK documentation.
    return response.text || "Just checking in on my previous email!";
  } catch (error) {
    // Provide a safe fallback message in case of API issues.
    return "Hi, just checking if you caught my last email. Best regards.";
  }
};
