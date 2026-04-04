import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionRoot } from "./motion/MotionRoot";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Build from "./pages/Build";
import Study from "./pages/Study";
import Exam from "./pages/Exam";
import Library from "./pages/Library";
import Results from "./pages/Results";
import About from "./pages/About";
import { AppProvider } from "./store/app";

export default function App() {
  return (
    <AppProvider>
      <MotionRoot>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="build" element={<Build />} />
              <Route path="study" element={<Study />} />
              <Route path="exam" element={<Exam />} />
              <Route path="library" element={<Library />} />
              <Route path="results" element={<Results />} />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionRoot>
    </AppProvider>
  );
}
