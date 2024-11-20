import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JobForm() {
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [scroll, setScroll] = useState(10);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem("jobDetails")) || [];
    setSavedJobs(storedJobs);
  }, []);

  const handleScrapeJob = async () => {
    try {
      const response = await axios.get("http://localhost:8000/scrape", {
        params: { location, role, scroll },
      });

      const newJobId = response.data.job_id;
      setStatus("Job started. Waiting for completion...");

      navigate(`/results/${newJobId}`);
    } catch (error) {
      console.error("Error starting the scraping job:", error);
      setStatus("Error starting the scraping job.");
    }

    const newJobDetail = { location, role, scroll };
    const updatedJobs = [newJobDetail, ...savedJobs];
    localStorage.setItem("jobDetails", JSON.stringify(updatedJobs));
    setSavedJobs(updatedJobs);
  };

  const handleClickSavedJob = (jobDetail) => {
    setLocation(jobDetail.location);
    setRole(jobDetail.role);
    setScroll(jobDetail.scroll);
  };

  return (
    <div className="flex justify-center">
      <div className="max-w-7xl w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter role"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Scroll Count</label>
          <input
            type="number"
            value={scroll}
            onChange={(e) => setScroll(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Number of scrolls"
          />
        </div>

        <button
          onClick={handleScrapeJob}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Start Scraping
        </button>

        {status && <p className="text-center mt-4">{status}</p>}

        {savedJobs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Saved Job Details</h3>
            <ul className="space-y-2">
              {savedJobs.map((jobDetail, index) => (
                <li
                  key={index}
                  className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                  onClick={() => handleClickSavedJob(jobDetail)}
                >
                  {jobDetail.location} - {jobDetail.role} - {jobDetail.scroll} scrolls
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobForm;
