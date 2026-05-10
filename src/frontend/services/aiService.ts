export type AIProvider = 'gemini' | 'openai';

export async function analyzeLabResult(input: { text?: string; base64Image?: string }, provider: AIProvider = 'gemini') {
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
