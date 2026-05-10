export type AIProvider = 'gemini' | 'openai';

export async function analyzeLabResult(input: { text?: string; base64Image?: string }, provider: AIProvider = 'gemini') {
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
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message, base64Image, provider })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI chat failed: ${errorText}`);
  }
  const data = await response.json();
  return data.result;
}
