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

export async function analyzeLabResult(input: { text?: string; base64Image?: string }, provider: AIProvider = 'gemini') {
  if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
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
    return JSON.parse(response.text || '{}');
  }

  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, provider })
  });
  
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze lab result');
    } else {
      const text = await response.text();
      throw new Error(`Server Error: ${response.status} - ${text.substring(0, 100)}...`);
    }
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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const chatHistory = history.map(h => ({
      role: h.role === 'assistant' ? 'model' : h.role,
      parts: [{ text: h.content }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: chatHistory as any,
      config: {
        systemInstruction: "You are AiCare Assistant, a professional health coach and medical information specialist. Be helpful, accurate, and always advise professional medical consultation for serious concerns."
      }
    });

    const parts: any[] = [{ text: message }];
    if (base64Image) {
      const mimeMatch = base64Image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const base64Data = base64Image.split(',')[1] || base64Image;
      parts.push({ inlineData: { data: base64Data, mimeType } });
    }
    
    const result = await chat.sendMessage({ message: parts });
    return result.text;
  }

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message, base64Image, provider })
  });

  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI response');
    } else {
      const text = await response.text();
      throw new Error(`Server Error: ${response.status} - ${text.substring(0, 100)}...`);
    }
  }
  const data = await response.json();
  return data.result;
}
