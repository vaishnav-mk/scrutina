import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobForm from "./components/JobForm";
import JobResults from "./components/JobResults";
import PreviousJobs from "./components/PreviousJobs";

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen font-mono">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<JobForm />} />
            <Route path="/results/:jobId" element={<JobResults />} />
            <Route path="/jobs" element={<PreviousJobs />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
