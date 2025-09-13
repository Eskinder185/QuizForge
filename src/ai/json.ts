export interface ParsedItem {
  type: "single" | "multi" | "truefalse" | "text";
  prompt: string;
  choices?: Array<{ text: string; correct?: boolean }>;
  answerText?: string;
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  explanation?: string;
}

export function safeExtractItems(text: string): ParsedItem[] | null {
  try {
    // First, try to find JSON in code fences
    const codeFenceMatch = text.match(/```(?:json)?\s*(\[.*?\])\s*```/s);
    if (codeFenceMatch) {
      const jsonStr = codeFenceMatch[1];
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed as ParsedItem[];
      }
    }

    // Try to find JSON array directly
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed as ParsedItem[];
      }
    }

    // Try parsing the entire text as JSON
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed as ParsedItem[];
    }

    return null;
  } catch (error) {
    console.warn("Failed to parse AI response as JSON:", error);
    return null;
  }
}
