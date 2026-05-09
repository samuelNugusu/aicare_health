import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ANALYSIS_PROMPT = `
You are an expert AI Health Diagnostic Assistant. Your task is to analyze lab results from an image or text.
Extract clinical markers, values, units, and reference ranges.
Categorize each marker as normal, high, low, or critical.
Provide a clear summary, health recommendations (lifestyle, diet, further tests), and potential predictive alerts.
IMPORTANT: Always include a disclaimer that this is NOT a medical diagnosis and the user should consult a doctor.

Output format should be JSON:
{
  "summary": "...",
  "keyMetrics": [
    {"marker": "Hemoglobin", "value": "12.5", "unit": "g/dL", "referenceRange": "13.5-17.5", "status": "low"}
  ],
  "recommendations": ["..."],
  "predictiveAlerts": ["..."]
}
`;

export async function analyzeLabResult(input: { text?: string; base64Image?: string }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI Analysis is unavailable: GEMINI_API_KEY is missing. Please add it to your environment variables.");
  }

  const parts: any[] = [{ text: ANALYSIS_PROMPT }];
  
  if (input.text) {
    parts.push({ text: `Lab Result Text: ${input.text}` });
  }
  
  if (input.base64Image) {
    const mimeMatch = input.base64Image.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    const base64Data = input.base64Image.split(',')[1] || input.base64Image;

    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}

export async function getHealthAssistantResponse(history: { role: 'user' | 'model'; content: string }[], message: string, base64Image?: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chat Assistant is unavailable: GEMINI_API_KEY is missing.");
  }

  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: chatHistory,
      config: {
        systemInstruction: "You are AiCare Assistant, a professional health coach and medical information specialist. Be helpful, accurate, and always advise professional medical consultation for serious concerns. If the user provides an image, analyze it as part of the health discussion."
      }
    });

    const parts: any[] = [{ text: message }];

    if (base64Image) {
      const mimeMatch = base64Image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const base64Data = base64Image.split(',')[1] || base64Image;

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const result = await chat.sendMessage({
      message: parts
    });

    return result.text;
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    throw new Error(`AI Chat failed: ${error.message}`);
  }
}

