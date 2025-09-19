import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
// import Backdrop from "./components/Backdrop";
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
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="app-shell">
          {/* <Backdrop /> */}
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/build" element={<Build />} />
              <Route path="/study" element={<Study />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/library" element={<Library />} />
              <Route path="/results" element={<Results />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Layout>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
