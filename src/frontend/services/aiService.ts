export type AIProvider = 'gemini' | 'openai';

export async function analyzeLabResult(input: { text?: string; base64Image?: string }, provider: AIProvider = 'gemini') {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, provider })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze lab result');
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to get AI response');
  }
  const data = await response.json();
  return data.result;
}
