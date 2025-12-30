
import { GoogleGenAI } from "@google/genai";
import { EmailTracking } from "../types";

const getConfig = () => ({
  apiKey: localStorage.getItem('sentinal_gemini_api_key') || '',
});

export const generateFollowUpDraft = async (email: EmailTracking): Promise<string> => {
  const { apiKey } = getConfig();
  if (!apiKey) return "Please set your Gemini API Key in Settings.";

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const historyContext = email.history
    .map(h => `[${h.type.toUpperCase()}]: ${h.content}`)
    .join('\n\n');

  const prompt = `
    Role: Professional relationship manager.
    Goal: Detect the lack of response from ${email.recipientName} and write a polite, low-pressure follow-up.
    User Mental Model: The recipient is likely busy, not ignoring me.
    Thread History:
    ${historyContext}

    Tone Architecture:
    - Calm, professional, and helpful.
    - Zero sales pressure.
    - No "just checking in" clichés.
    - Focus on being a useful resource.
    - Under 80 words.

    Output only the email body.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI draft. Check your connection.";
  }
};

export const analyzeReply = async (replyText: string): Promise<{ sentiment: string; summary: string }> => {
  const prompt = `
    Analyze this email reply:
    "${replyText}"

    Provide a 5-word summary and categorize sentiment as one of: [Interested, Uninterested, Neutral, Questioning].
    Format: Sentiment: [Category] | Summary: [5 words]
    `;

  try {
    const { apiKey } = getConfig();
    if (!apiKey) return { sentiment: 'N/A', summary: 'API Key missing.' };

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const [sentimentPart, summaryPart] = text.split('|');
    return {
      sentiment: sentimentPart?.replace('Sentiment:', '').trim() || 'Neutral',
      summary: summaryPart?.replace('Summary:', '').trim() || 'No summary available.'
    };
  } catch (error) {
    return { sentiment: 'Neutral', summary: 'Could not analyze reply.' };
  }
}
