import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function JobResults() {
  const { jobId } = useParams();
  const [jobData, setJobData] = useState(null);
  const [status, setStatus] = useState("Loading job data...");
  const [isPolling, setIsPolling] = useState(false);
  const [lastPolled, setLastPolled] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("Not started");
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/job/${jobId}`);
        setJobData(response.data.job_data);
        setJobDetails(response.data);
        setStatus("Job data loaded.");
        if (response.data.status === "pending") {
          startPolling();
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setStatus("Error loading job data.");
      }
    };

    fetchJobData();

    return () => {
      if (isPolling) {
        clearInterval(isPolling);
      }
    };
  }, [jobId]);

  const startPolling = () => {
    const intervalId = setInterval(async () => {
      try {
        setPollingStatus("Polling...");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/job/${jobId}`);
        setLastPolled(new Date().toLocaleTimeString());
        if (response.data.status !== "pending") {
          setJobData(response.data.job_data);
          setJobDetails(response.data);
          setStatus("Job data loaded.");
          clearInterval(intervalId);
        } else {
          setStatus("Job is still processing...");
        }
      } catch (error) {
        console.error("Error fetching job status:", error);
        setStatus("Error loading job status.");
        clearInterval(intervalId);
      }
    }, 5000);
    setIsPolling(intervalId);
  };

  if (!jobData) return <p>{status}</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Job Results for {jobId}</h2>
      <div className="space-y-4 mt-4">
        <p className="text-sm text-gray-600">Created At: {new Date(jobDetails.created_at).toLocaleString()}</p>
        <p className="text-sm text-gray-600">Location: {jobDetails.details.location}</p>
        <p className="text-sm text-gray-600">Role: {jobDetails.details.role}</p>
        <p className="text-sm text-gray-600">Scroll: {jobDetails.details.scroll}</p>
        <p className="text-sm text-gray-600">Completed At: {jobDetails.completed_at ? new Date(jobDetails.completed_at).toLocaleString() : 'N/A'}</p>

        {jobDetails.status !== "completed" && (
          <>
            <p className="text-sm text-gray-600">Last Polled: {lastPolled}</p>
            <p className="text-sm text-gray-600">Polling Status: {pollingStatus}</p>
          </>
        )}

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
  );
}

export default JobResults;
