import React, { useState, useRef, useEffect } from "react";
import { aiChat, hasKey, type ChatMessage } from "../ai/llm";
import { safeExtractItems, type ParsedItem } from "../ai/json";
import AiKeyModal from "./AiKeyModal";

interface ChatDockProps {
  mode: "build" | "study";
  onClose: () => void;
  initialMessage?: string;
  onInsertItems?: (items: ParsedItem[]) => void;
}

const SYSTEM_PROMPTS = {
  build: `You are an expert exam item writer. Output **strict JSON** only with an array \`items\`. Each item: { type: "single"|"multi"|"truefalse"|"text", prompt: string, choices?: [{text:string, correct?:boolean}], answerText?: string, tags?: string[], difficulty?: "easy"|"medium"|"hard", explanation?: string }.

Follow the project style. Keep explanations concise. Prefer 30–60 word prompts when needed. Avoid ambiguous stems.`,

  study: `You are a calm study coach. Use Socratic hints first, then short explanations with one key takeaway. If I paste a mistake summary, propose a 5-question micro-drill. Keep responses < 200 words unless I ask for more.`
};

export default function ChatDock({ mode, onClose, initialMessage, onInsertItems }: ChatDockProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!hasKey()) {
      setShowKeyModal(true);
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = messages.length === 0 
      ? [{ role: "system" as const, content: SYSTEM_PROMPTS[mode] }, userMessage]
      : [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiChat(newMessages);
      const assistantMessage: ChatMessage = { role: "assistant", content: response };
      setMessages([...newMessages, assistantMessage]);

      // Try to parse items for build mode
      if (mode === "build") {
        const items = safeExtractItems(response);
        if (items) {
          setParsedItems(items);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { 
        role: "assistant", 
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}` 
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertItems = () => {
    if (parsedItems && onInsertItems) {
      onInsertItems(parsedItems);
      setParsedItems(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-700 z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h3 className="font-semibold">
            {mode === "build" ? "✨ Question Assistant" : "🧠 Study Coach"}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-sm text-zinc-400">
              {mode === "build" 
                ? "Paste your notes or topic, and I'll generate high-quality questions for your quiz."
                : "Ask me about study strategies, explain mistakes, or request practice questions."
              }
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-100 p-3 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {parsedItems && mode === "build" && (
          <div className="p-4 border-t border-zinc-700">
            <div className="text-sm text-zinc-300 mb-2">
              Found {parsedItems.length} questions. Select to insert:
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {parsedItems.map((item, index) => (
                <div key={index} className="text-xs bg-zinc-800 p-2 rounded">
                  <div className="font-medium">{item.prompt}</div>
                  <div className="text-zinc-400">
                    {item.type} • {item.difficulty || "medium"} • {item.tags?.join(", ") || "no tags"}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleInsertItems}
              className="btn primary w-full mt-2"
            >
              Insert All Questions
            </button>
          </div>
        )}

        <div className="p-4 border-t border-zinc-700">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === "build" ? "Paste notes or describe topic..." : "Ask about study strategies..."}
              className="input flex-1 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn primary self-end"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      <AiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
      />
    </>
  );
}

