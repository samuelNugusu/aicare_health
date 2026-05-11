import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'gemini' | 'openai';

const getOpenAIKey = () => process.env.OPENAI_API_KEY || "";
const getGeminiKey = () => process.env.GEMINI_API_KEY || "";

let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenAI | null = null;

function getOpenAI() {
  if (!openaiClient) {
    const key = getOpenAIKey();
    if (!key) throw new Error("OPENAI_API_KEY is missing on server.");
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

function getGemini() {
  if (!geminiClient) {
    const key = getGeminiKey();
    if (!key) throw new Error("GEMINI_API_KEY is missing on server.");
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

const ANALYSIS_PROMPT = `
You are a Senior Clinical Diagnostic Specialist and Medical Data Scientist. Your task is to perform an exhaustive, deep analysis of medical lab results from provided images or text.

DEEP ANALYSIS REQUIREMENTS:
1. Extract EVERY clinical marker with absolute precision (values, units, and reference ranges).
2. For every marker outside the reference range, provide a detailed clinical explanation of what this might indicate (differential considerations).
3. Synthesize the findings: Do not just list markers, but explain how they relate to each other (e.g., how elevated Glucose relates to HbA1c).
4. Provide highly specific, actionable health optimizations including physiological mechanisms (e.g., explain WHY a certain nutrient is needed based on the labs).
5. Identify long-term health trends or "Predictive Alerts" based on subtle variations in the data.

Output format MUST be strictly valid JSON:
{
  "summary": "Full, deep clinical overview of the patient's current metabolic and physiological state...",
  "keyMetrics": [
    {"marker": "...", "value": "...", "unit": "...", "referenceRange": "...", "status": "normal|high|low|critical", "insight": "Deep technical insight for this specific marker..."}
  ],
  "recommendations": ["Detailed, scientifically-backed action steps..."],
  "predictiveAlerts": ["Sophisticated risk assessment and long-term trend warnings..."]
}

DISCLAIMER: Always append a professional medical disclaimer stating that this is an AI-powered data synthesis and must be reviewed by a licensed physician.
`;

export async function analyzeLabResult(input: { text?: string; base64Image?: string }, provider: AIProvider = 'gemini') {
  if (provider === 'gemini') {
    try {
      const ai = getGemini();
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
        config: { 
          responseMimeType: "application/json",
          systemInstruction: "CRITICAL: You are a World-Class AI Clinical Pathologist. You provide DEEP, rigorous, and technical medical analysis of laboratory results. You ONLY analyze health-related documents. If the input is non-medical, explain that your expertise is strictly clinical. Be thorough, use medical terminology correctly, and provide profound insights into the user's health state."
        }
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (err: any) {
      console.error("Gemini Analysis Error:", err);
      throw new Error(`Gemini Analysis Failed: ${err.message || 'Unknown error'}`);
    }
  } else {
    try {
      const openai = getOpenAI();
      const messages: any[] = [
        { role: "system", content: "CRITICAL: You are an Elite AI Clinical Pathologist. Provide exhaustive, technical, and deep medical analysis of clinical reports. strictly return JSON. Use high-level medical reasoning to synthesize the data." },
        { role: "user", content: ANALYSIS_PROMPT }
      ];
      if (input.text) messages.push({ role: "user", content: `Lab Result Text: ${input.text}` });
      if (input.base64Image) {
        messages.push({ 
          role: "user", 
          content: [
            { type: "image_url", image_url: { url: input.base64Image } }
          ] 
        });
      }
      
      console.log("Analyzing with OpenAI...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" }
      });
      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (err: any) {
      console.warn("OpenAI Analysis Error:", err);
      if (err.status === 401 || err.status === 404 || err.status === 429) {
        console.log("GPT-4o unavailable, using Deep Gemini fallback...");
        return analyzeLabResult(input, 'gemini');
      }
      throw err;
    }
  }
}

export async function getHealthAssistantResponse(
  history: { role: 'user' | 'model' | 'assistant'; content: string }[], 
  message: string, 
  base64Image?: string,
  provider: AIProvider = 'gemini'
) {
  const MEDICAL_SYSTEM_PROMPT = "CRITICAL: You are the AiCare Medical AI, an advanced Clinical Reasoning System. You provide DEEP, scientifically rigorous medical, wellness, and health-related responses. Your knowledge covers clinical pathology, nutrition, exercise science, and physiological optimizations. You MUST provide detailed, multi-layered medical answers. If the user asks non-medical queries, politely redirect them to your clinical specialization. You never provide shallow answers; you always provide deep health insights.";

  if (provider === 'gemini') {
    try {
      const ai = getGemini();
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
          systemInstruction: MEDICAL_SYSTEM_PROMPT
        }
      });
      
      return response.text;
    } catch (err: any) {
      console.error("Gemini Assistant Error:", err);
      throw new Error(`Gemini Assistant Failed: ${err.message || 'Unknown error'}`);
    }
  } else {
    try {
      const openai = getOpenAI();
      const messages: any[] = [
        { role: "system", content: MEDICAL_SYSTEM_PROMPT },
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : h.role, content: h.content })),
      ];

      if (base64Image) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: message },
            { type: "image_url", image_url: { url: base64Image } }
          ]
        });
      } else {
        messages.push({ role: "user", content: message });
      }

      console.log("Chatting with OpenAI...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages
      });
      return completion.choices[0].message.content;
    } catch (err: any) {
      console.warn("OpenAI Chat Error:", err);
      if (err.status === 401 || err.status === 404 || err.status === 429) {
        console.log("GPT-4o unavailable, using Deep Gemini fallback...");
        return getHealthAssistantResponse(history, message, base64Image, 'gemini');
      }
      throw err;
    }
  }
}
