
import { GoogleGenAI } from "@google/genai";
import { EmailTracking } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFollowUpDraft = async (email: EmailTracking): Promise<string> => {
  const followUpNumber = email.followUpCount + 1;
  const historyContext = email.history
    .map(h => `[${h.type.toUpperCase()} - ${new Date(h.date).toLocaleDateString()}]: ${h.content}`)
    .join('\n\n');

  const prompt = `
    Context: I am running a professional agency. I sent a cold email to ${email.recipientName} at ${email.recipientEmail}.
    Current Status: This is Follow-up #${followUpNumber} out of a maximum of 3.
    Previous Conversation History:
    ${historyContext}

    Task: Write a concise, professional, and non-pushy follow-up email.
    Guidelines:
    - Keep it under 100 words.
    - Reference the previous contact lightly.
    - Provide value or ask a low-friction question.
    - Match the tone of the previous history.
    - Only provide the email body text, no subject line needed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a draft. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI draft. Check your connection.";
  }
};

export const analyzeReply = async (replyText: string): Promise<{ sentiment: string; summary: string }> => {
    const prompt = `
    Analyze this email reply from a potential client:
    "${replyText}"

    Provide a very brief summary and the sentiment (Interested, Not Interested, Neutral, Needs Info).
    Return as a simple string format: "Sentiment: [Value] | Summary: [Brief Summary]"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        const text = response.text || "";
        const [sentimentPart, summaryPart] = text.split('|');
        return {
            sentiment: sentimentPart?.replace('Sentiment:', '').trim() || 'Neutral',
            summary: summaryPart?.replace('Summary:', '').trim() || 'No summary available.'
        };
    } catch (error) {
        return { sentiment: 'Neutral', summary: 'Could not analyze reply.' };
    }
}
