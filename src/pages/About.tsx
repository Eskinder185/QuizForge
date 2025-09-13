import React from "react";
import { APP_NAME } from "../config/brand";

export default function About() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <div className="text-xl font-semibold">About {APP_NAME}</div>
        <p className="mt-2 text-zinc-300">
          {APP_NAME} is privacy-first exam prep. Everything runs locally in your browser:
          no servers, no external API calls. Build quizzes with sources, study with adaptive
          review, practice with timers, simulate exams, and export your data anytime.
        </p>
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <div className="text-lg font-semibold">What’s next</div>
        <ul className="list-disc list-inside text-zinc-300 mt-2">
          <li>Import/export quiz data</li>
          <li>Richer question types and media</li>
          <li>Smarter review mode and spaced repetition</li>
        </ul>
      </div>
      <div id="privacy" className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <div className="text-lg font-semibold">Privacy & Security</div>
        <p className="mt-2 text-zinc-300">
          QuizForge is designed with privacy-first principles. All data stays on your device:
        </p>
        <ul className="list-disc list-inside text-zinc-300 mt-2 space-y-1">
          <li>No webcam or microphone access required</li>
          <li>No external API calls or data transmission</li>
          <li>All quiz data stored locally in your browser</li>
          <li>No tracking, analytics, or user profiling</li>
          <li>Export your data anytime for backup or migration</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <div className="text-lg font-semibold">Links</div>
        <a className="text-sky-300 hover:underline" href="https://github.com/Eskinder185/QuizForge" target="_blank" rel="noreferrer">GitHub Repo</a>
      </div>
    </div>
  );
}
