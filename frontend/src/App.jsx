import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobForm from "./components/JobForm";
import JobResults from "./components/JobResults";
import PreviousJobs from "./components/PreviousJobs";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-4">Job Scraper</h1>
        <Routes>
          <Route path="/" element={<JobForm />} />
          <Route path="/results/:jobId" element={<JobResults />} />
          <Route path="/jobs" element={<PreviousJobs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
