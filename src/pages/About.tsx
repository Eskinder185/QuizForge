import React from "react";
import { APP_NAME } from "../config/brand";
import { PageShell } from "../components/ui";

export default function About() {
  return (
    <PageShell variant="document">
      <section className="content-section">
        <h1 className="document-title">About {APP_NAME}</h1>
        <p className="document-prose" style={{ margin: 0 }}>
          {APP_NAME} is privacy-first exam prep. Everything runs locally in your browser: no servers, no external API
          calls. Build quizzes with sources, study with adaptive review, practice with timers, simulate exams, and export
          your data anytime.
        </p>
      </section>
      <section className="content-section">
        <h2 className="document-section-title">What’s next</h2>
        <ul className="document-list list-disc list-inside space-y-1">
          <li>Import/export quiz data</li>
          <li>Richer question types and media</li>
          <li>Smarter review mode and spaced repetition</li>
        </ul>
      </section>
      <section id="privacy" className="content-section">
        <h2 className="document-section-title">Privacy & Security</h2>
        <p className="document-prose">QuizForge is designed with privacy-first principles. All data stays on your device:</p>
        <ul className="document-list list-disc list-inside space-y-1" style={{ marginTop: "var(--space-md)" }}>
          <li>No webcam or microphone access required</li>
          <li>No external API calls or data transmission</li>
          <li>All quiz data stored locally in your browser</li>
          <li>No tracking, analytics, or user profiling</li>
          <li>Export your data anytime for backup or migration</li>
        </ul>
      </section>
      <section className="content-section">
        <h2 className="document-section-title">Links</h2>
        <p className="document-prose" style={{ margin: 0 }}>
          <a href="https://github.com/Eskinder185/QuizForge" target="_blank" rel="noreferrer">
            GitHub repository
          </a>
        </p>
      </section>
    </PageShell>
  );
}
