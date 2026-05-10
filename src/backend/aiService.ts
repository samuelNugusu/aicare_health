import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export type AIProvider = 'gemini' | 'openai';

const getGeminiKey = () => process.env.GEMINI_API_KEY || "";
const getOpenAIKey = () => process.env.OPENAI_API_KEY || "";

let geminiClient: GoogleGenAI | null = null;
let openaiClient: OpenAI | null = null;

function getGemini() {
  if (!geminiClient) {
    const key = getGeminiKey();
    if (!key) throw new Error("GEMINI_API_KEY is missing on server.");
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

function getOpenAI() {
  if (!openaiClient) {
    const key = getOpenAIKey();
    if (!key) throw new Error("OPENAI_API_KEY is missing on server.");
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

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
    const ai = getGemini();
    const parts: any[] = [{ text: ANALYSIS_PROMPT }];
    if (input.text) parts.push({ text: `Lab Result Text: ${input.text}` });
    if (input.base64Image) {
      const mimeMatch = input.base64Image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
      const base64Data = input.base64Image.split(',')[1] || input.base64Image;
      parts.push({ inlineData: { data: base64Data, mimeType } });
    }
    
    console.log(`Starting Gemini analysis with model gemini-3-flash-preview...`);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });
    console.log("Gemini response received.");
    return JSON.parse(response.text || '{}');
  } else if (provider === 'openai') {
// ... existing openai ...
    const openai = getOpenAI();
    const messages: any[] = [
      { role: "system", content: "You are an expert AI Health Diagnostic Assistant. Always return JSON." },
      { role: "user", content: [
        { type: "text", text: ANALYSIS_PROMPT },
        ...(input.text ? [{ type: "text", text: `Lab Result Text: ${input.text}` }] : []),
        ...(input.base64Image ? [{ type: "image_url", image_url: { url: input.base64Image } }] : [])
      ]}
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content || '{}');
  }
  throw new Error(`Provider ${provider} not supported on backend`);
}

export async function getHealthAssistantResponse(
  history: { role: 'user' | 'model' | 'assistant'; content: string }[], 
  message: string, 
  base64Image?: string,
  provider: AIProvider = 'gemini'
) {
  if (provider === 'gemini') {
    const ai = getGemini();
    
    const chatHistory = history.map(h => ({
      role: h.role === 'assistant' ? 'model' : h.role,
      parts: [{ text: h.content }]
    }));

    console.log(`Starting Gemini chat with model gemini-3-flash-preview...`);
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
    
    console.log("Gemini chat response received.");
    return response.text;
  } else if (provider === 'openai') {
    const openai = getOpenAI();
    const messages: any[] = [
      { role: "system", content: "You are AiCare Assistant, a professional health coach and medical information specialist. Be helpful, accurate, and always advise professional medical consultation for serious concerns." },
      ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.content })),
      { role: "user", content: [
        { type: "text", text: message },
        ...(base64Image ? [{ type: "image_url", image_url: { url: base64Image } }] : [])
      ]}
    ];
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });
    return response.choices[0].message.content || '';
  }
  throw new Error(`Provider ${provider} not supported on backend`);
}
