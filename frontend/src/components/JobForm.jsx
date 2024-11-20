import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JobForm() {
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [scroll, setScroll] = useState(10);
  const [status, setStatus] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem("jobDetails")) || [];
    setSavedJobs(storedJobs);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!role.trim()) newErrors.role = "Role is required.";
    if (scroll <= 0)
      newErrors.scroll = "Scroll count must be greater than zero.";
    return newErrors;
  };

  const handleScrapeJob = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/scrape`,
        { location, role, scroll },
        {
          params: { location, role, scroll },
        }
      );
  
      const newJobId = response.data.job_id;
      setStatus("Job started. Waiting for completion...");
  
      navigate(`/results/${newJobId}`);
    } catch (error) {
      console.error("Error starting the scraping job:", error);
      setStatus("Error starting the scraping job.");
    }
  
    const newJobDetail = { location, role, scroll };
  
    const jobExists = savedJobs.some(
      (job) =>
        job.location === newJobDetail.location &&
        job.role === newJobDetail.role &&
        job.scroll === newJobDetail.scroll
    );
  
    if (!jobExists) {
      const updatedJobs = [newJobDetail, ...savedJobs];
      localStorage.setItem("jobDetails", JSON.stringify(updatedJobs));
      setSavedJobs(updatedJobs);
    }
  };
  
  const handleClickSavedJob = (jobDetail) => {
    setLocation(jobDetail.location);
    setRole(jobDetail.role);
    setScroll(jobDetail.scroll);
  };

  const handleDeleteJob = (index) => {
    const updatedJobs = savedJobs.filter((_, i) => i !== index);
    localStorage.setItem("jobDetails", JSON.stringify(updatedJobs));
    setSavedJobs(updatedJobs);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <label className="block text-lg font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-3 w-full p-4 text-green-300 bg-gray-800 border border-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter location"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-2">{errors.location}</p>
          )}
        </div>

        <div>
          <label className="block text-lg font-medium">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-3 w-full p-4 text-green-300 bg-gray-800 border border-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter role"
          />
          {errors.role && (
            <p className="text-red-500 text-sm mt-2">{errors.role}</p>
          )}
        </div>

        <div>
          <label className="block text-lg font-medium">Scroll Count</label>
          <input
            type="number"
            value={scroll}
            onChange={(e) => setScroll(e.target.value)}
            className="mt-3 w-full p-4 text-green-300 bg-gray-800 border border-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Number of scrolls"
          />
          {errors.scroll && (
            <p className="text-red-500 text-sm mt-2">{errors.scroll}</p>
          )}
        </div>

        <button
          onClick={handleScrapeJob}
          className="w-full p-4 mt-6 text-black bg-green-500 hover:bg-green-600 font-mono"
        >
          Start Scraping
        </button>

        {status && <p className="text-center mt-4 text-yellow-400">{status}</p>}

        {savedJobs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-mono text-green-400">
              Saved Job Details
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Click on a job to prefill the form.
            </p>
            <ul className="space-y-4">
              {savedJobs.map((jobDetail, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center cursor-pointer text-green-300 hover:text-green-500 font-mono"
                  onClick={() => handleClickSavedJob(jobDetail)}
                >
                  <span>
                    {jobDetail.location} - {jobDetail.role} - {jobDetail.scroll}{" "}
                    scrolls
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(index);
                    }}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    Delete
                  </button>
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
