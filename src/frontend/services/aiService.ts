import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'gemini' | 'openai';

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

// Helper to initialize Gemini
function getGeminiClient() {
  console.log("AiCare AI Service v1.1 - Initializing Gemini Client");
  const apiKey = (process.env.GEMINI_API_KEY as string) || "";
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found in process.env, AI features might not work on frontend.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function analyzeLabResult(input: { text?: string; base64Image?: string }, provider: AIProvider = 'gemini') {
  if (provider === 'gemini') {
    try {
      const ai = getGeminiClient();
      const parts: any[] = [{ text: ANALYSIS_PROMPT }];
      if (input.text) parts.push({ text: `Lab Result Text: ${input.text}` });
      if (input.base64Image) {
        const mimeMatch = input.base64Image.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        const base64Data = input.base64Image.split(',')[1] || input.base64Image;
        parts.push({ inlineData: { data: base64Data, mimeType } });
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text || "{}";
      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.error("Gemini Analysis Error (Frontend):", error);
      // Fallback to server if frontend fails (e.g. key exposure or CORS issues in some envs)
      console.log("Attempting server-side fallback for Gemini...");
    }
  }

  // OpenAI or Gemini fallback
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, provider })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI analysis failed: ${errorText}`);
  }
  return response.json();
}

export async function getHealthAssistantResponse(
  history: { role: 'user' | 'model' | 'assistant'; content: string }[], 
  message: string, 
  base64Image?: string,
  provider: AIProvider = 'gemini'
) {
  if (provider === 'gemini') {
    try {
      const ai = getGeminiClient();
      const chatHistory = history.map(h => ({
        role: (h.role === 'assistant' ? 'model' : h.role) as "user" | "model",
        parts: [{ text: h.content }]
      }));

      const parts: any[] = [{ text: message }];
      if (base64Image) {
        const mimeMatch = base64Image.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        const base64Data = base64Image.split(',')[1] || base64Image;
        parts.push({ inlineData: { data: base64Data, mimeType } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatHistory,
          { role: 'user', parts }
        ],
        config: {
          systemInstruction: "You are AiCare Assistant, a professional health coach and medical information specialist. Be helpful, accurate, and always advise professional medical consultation for serious concerns."
        }
      });
      
      return response.text;
    } catch (error: any) {
      console.error("Gemini Chat Error (Frontend):", error);
      console.log("Attempting server-side fallback for Gemini...");
    }
  }

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message, base64Image, provider })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch(e) {
      errorData = { error: errorText };
    }
    throw new Error(errorData.error || `AI chat failed on server`);
  }
  const data = await response.json();
  return data.result;
}
