export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

const API_KEY_STORAGE_KEY = "qf_api_key";
const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

export function setUserApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function getUserApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function hasKey(): boolean {
  return getUserApiKey() !== null;
}

export async function aiChat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = getUserApiKey();
  if (!apiKey) {
    throw new Error("No API key found. Please set your API key first.");
  }

  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2000,
    signal
  } = options;

  const response = await fetch(DEFAULT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || 
      `API request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
