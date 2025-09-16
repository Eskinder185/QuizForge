import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({
  tabs,
  defaultTab,
  className = ""
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-header" style={{
        display: "flex",
        gap: "var(--space-xs)",
        marginBottom: "var(--space-lg)",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "var(--space-sm)"
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "var(--space-sm) var(--space-md)",
              border: "none",
              background: activeTab === tab.id ? "var(--accent)" : "transparent",
              color: activeTab === tab.id ? "var(--bg)" : "var(--text)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {activeTabContent}
      </div>
    </div>
  );
}

