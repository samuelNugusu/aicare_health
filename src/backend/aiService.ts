import OpenAI from "openai";

export type AIProvider = 'gemini' | 'openai';

const getOpenAIKey = () => process.env.OPENAI_API_KEY || "";

let openaiClient: OpenAI | null = null;

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
    throw new Error("Gemini analysis should be handled on the frontend.");
  }
  
  const openai = getOpenAI();
  const messages: any[] = [
    { role: "system", content: "You are an expert AI Health Diagnostic Assistant. Always return JSON." },
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
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function getHealthAssistantResponse(
  history: { role: 'user' | 'model' | 'assistant'; content: string }[], 
  message: string, 
  base64Image?: string,
  provider: AIProvider = 'gemini'
) {
  if (provider === 'gemini') {
    throw new Error("Gemini chat should be handled on the frontend.");
  }

  const openai = getOpenAI();
  const messages: any[] = [
    { role: "system", content: "You are AiCare Assistant, a professional health coach and medical information specialist." },
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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages
  });
  return completion.choices[0].message.content;
}
