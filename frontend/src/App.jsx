import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [scroll, setScroll] = useState(10);
  const [jobId, setJobId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [status, setStatus] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [jobsList, setJobsList] = useState([]);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [lastPollTime, setLastPollTime] = useState(null);

  const handleScrapeJob = async () => {
    try {
      const response = await axios.get("http://localhost:8000/scrape", {
        params: { location, role, scroll },
      });

      const newJobId = response.data.job_id;
      setJobId(newJobId);
      setStatus("Job started. Waiting for completion...");
      setJobData(null);

      startPolling(newJobId);
      const savedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
      savedJobs.push({ jobId: newJobId, status: "pending" });
      localStorage.setItem("jobs", JSON.stringify(savedJobs));
      setJobsList(savedJobs);
    } catch (error) {
      console.error("Error starting the scraping job:", error);
      setStatus("Error starting the scraping job.");
    }
  };

  const startPolling = (jobId) => {
    setIsPolling(true);
    const intervalId = setInterval(async () => {
      setLastPollTime(new Date().toLocaleTimeString());

      try {
        const response = await axios.get(`http://localhost:8000/job/${jobId}`);
        const job = response.data;

        if (job.status === "completed") {
          setIsPolling(false);
          setStatus("Job completed.");
          setJobData(job.job_data);
          clearInterval(intervalId);

          const savedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
          const updatedJobs = savedJobs.map((item) =>
            item.jobId === jobId ? { ...item, status: "completed" } : item
          );
          localStorage.setItem("jobs", JSON.stringify(updatedJobs));
          setJobsList(updatedJobs);
        } else {
          setStatus("Job is still in progress...");
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setStatus("Error fetching job data.");
        setIsPolling(false);
        clearInterval(intervalId);
      }
    }, 5000);
    setPollingInterval(intervalId);
  };

  const handleSelectJob = (jobId) => {
    setJobId(jobId);
    setStatus("Loading job data...");
    setJobData(null);

    axios
      .get(`http://localhost:8000/job/${jobId}`)
      .then((response) => {
        setJobData(response.data.job_data);
        setStatus("Job data loaded.");
      })
      .catch((error) => {
        console.error("Error fetching job data:", error);
        setStatus("Error loading job data.");
      });
  };

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
    setJobsList(savedJobs);
    return () => {
      if (isPolling) {
        clearInterval(pollingInterval);
      }
    };
  }, [isPolling]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Job Scraper</h1>
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

          {isPolling && (
            <p className="text-center mt-4">
              Polling... Last polled at {lastPollTime}
            </p>
          )}

          {jobData && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Job Results for {jobId}</h2>
              <div className="space-y-4 mt-4">
                {jobData.map((company, index) => (
                  <div key={index} className="border p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">{company.companyName}</h3>
                    <p className="text-sm text-gray-500">{company.companyTagline}</p>
                    <p className="text-sm text-gray-500">Employees: {company.employeeCount}</p>
                    {company.availableJobs.map((job, jobIndex) => (
                      <div key={jobIndex} className="mt-4">
                        <h4 className="font-semibold">{job.jobName}</h4>
                        <p className="text-sm text-gray-600">Compensation: {job.compensation}</p>
                        <p className="text-sm text-gray-600">Locations: {job.locations.join(", ")}</p>
                        <p className="text-sm text-gray-600">Posted: {job.posted}</p>
                        <a
                          href={`https://www.wellfound.com${job.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
                        >
                          View Job
                        </a>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobsList.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Previous Jobs:</h2>
              <div className="space-y-4 mt-4">
                {jobsList.map((job, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg shadow-md cursor-pointer"
                    onClick={() => handleSelectJob(job.jobId)}
                  >
                    <h3 className="text-lg font-semibold">Job ID: {job.jobId}</h3>
                    <p className="text-sm text-gray-600">Status: {job.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
