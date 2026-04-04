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

  study: `You are a calm study coach. Use Socratic hints first, then short explanations with one key takeaway. If I paste a mistake summary, propose a 5-question micro-drill. Keep responses < 200 words unless I ask for more.`,
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
    const newMessages =
      messages.length === 0
        ? [{ role: "system" as const, content: SYSTEM_PROMPTS[mode] }, userMessage]
        : [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiChat(newMessages);
      const assistantMessage: ChatMessage = { role: "assistant", content: response };
      setMessages([...newMessages, assistantMessage]);

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
        content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
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

  const title = mode === "build" ? "Question assistant" : "Study coach";

  return (
    <>
      <div className="chat-dock-overlay" onClick={onClose} aria-hidden />
      <aside className="chat-dock" aria-label={title}>
        <div className="chat-dock__header">
          <h2 className="chat-dock__title">{title}</h2>
          <button type="button" onClick={onClose} className="btn ghost sm" aria-label="Close chat">
            Close
          </button>
        </div>

        <div className="chat-dock__body">
          {messages.length === 0 && (
            <p className="chat-dock__empty">
              {mode === "build"
                ? "Paste your notes or topic, and I will generate questions for your quiz."
                : "Ask about study strategies, mistakes, or practice ideas."}
            </p>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-dock__row ${message.role === "user" ? "chat-dock__row--user" : "chat-dock__row--assistant"}`}
            >
              <div
                className={`chat-dock__bubble ${
                  message.role === "user" ? "chat-dock__bubble--user" : "chat-dock__bubble--assistant"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-dock__row chat-dock__row--assistant">
              <div className="chat-dock__bubble chat-dock__bubble--assistant">
                <span className="text-muted">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {parsedItems && mode === "build" && (
          <div className="chat-dock__parse-block">
            <p className="chat-dock__parse-hint">
              Found {parsedItems.length} question{parsedItems.length === 1 ? "" : "s"}. Review below, then insert.
            </p>
            <div style={{ maxHeight: "8rem", overflowY: "auto" }}>
              {parsedItems.map((item, index) => (
                <div key={index} className="chat-dock__parse-item">
                  <div className="font-medium">{item.prompt}</div>
                  <div className="chat-dock__parse-meta">
                    {item.type} · {item.difficulty || "medium"} · {item.tags?.join(", ") || "no tags"}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleInsertItems} className="btn primary w-full mt-2">
              Insert all questions
            </button>
          </div>
        )}

        <div className="chat-dock__footer">
          <div className="chat-dock__footer-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "build" ? "Paste notes or describe a topic…" : "Ask about study strategies…"
              }
              className="input flex-1 resize-none"
              rows={2}
              disabled={isLoading}
              aria-label="Message"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="btn primary shrink-0"
            >
              {isLoading ? "…" : "Send"}
            </button>
          </div>
        </div>
      </aside>

      <AiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </>
  );
}
