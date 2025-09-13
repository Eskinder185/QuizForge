import React, { useState } from "react";
import { setUserApiKey } from "../ai/llm";

interface AiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiKeyModal({ isOpen, onClose }: AiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    try {
      setUserApiKey(apiKey.trim());
      onClose();
      setApiKey("");
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="panel max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Set API Key</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium mb-2">
              OpenAI API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="sk-..."
              className="input w-full"
              autoFocus
            />
          </div>
          
          <p className="text-xs text-zinc-400">
            Stored locally only (localStorage). Works on GitHub Pages.
          </p>
          
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="btn"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn primary"
              disabled={!apiKey.trim() || isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
