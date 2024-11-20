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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/job/${jobId}`
        );
        setJobData(response.data.job_data);
        setJobDetails(response.data);
        setStatus("Loading job data...");
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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/job/${jobId}`
        );
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

  if (jobData.length === 0) {
    return (
      <div className="bg-red-800 border border-red-500 text-red-200 px-6 py-4 rounded-md text-center mx-4 mt-6">
        <strong className="text-xl block font-bold">Oops!</strong>
        <span className="text-sm">
          No jobs found for the given criteria. Please try again.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white">Job Results for {jobId}</h2>
      <div className="space-y-4 mt-4">
        <div className="block p-4 bg-gray-900 text-gray-300">
          <p className="text-sm">
            Created At: {new Date(jobDetails.created_at).toLocaleString()}
          </p>
          <p className="text-sm">Location: {jobDetails.details.location}</p>
          <p className="text-sm">Role: {jobDetails.details.role}</p>
          <p className="text-sm">Scroll: {jobDetails.details.scroll}</p>
          <p className="text-sm">
            Completed At:{" "}
            {jobDetails.completed_at
              ? new Date(jobDetails.completed_at).toLocaleString()
              : "N/A"}
          </p>
          <p>
            Total Jobs Found:{" "}
            {jobData.reduce(
              (acc, company) => acc + company.availableJobs.length,
              0
            )}
          </p>
        </div>

        {jobDetails.status !== "completed" && (
          <>
            <div className="block p-4 bg-gray-800 text-gray-300">
              <p className="text-sm">Last Polled: {lastPolled}</p>
              <p className="text-sm">Polling Status: {pollingStatus}</p>
            </div>
          </>
        )}

        {jobData.map((company, index) => (
          <div
            key={index}
            className="block p-6 border-t-4 border-gray-500 bg-gray-800"
          >
            <h3 className="text-xl font-bold text-white">
              {company.companyName}
            </h3>
            <p className="text-sm text-gray-400">{company.companyTagline}</p>
            <p className="text-sm text-gray-400">
              Employees: {company.employeeCount}
            </p>
            {company.availableJobs.map((job, jobIndex) => (
              <div key={jobIndex} className="mt-4">
                <h4 className="text-lg font-bold text-white">{job.jobName}</h4>
                <p className="text-sm text-gray-400">
                  Compensation: {job.compensation}
                </p>
                <p className="text-sm text-gray-400">
                  Locations: {job.locations.join(", ")}
                </p>
                <p className="text-sm text-gray-400">Posted: {job.posted}</p>
                <a
                  href={`https://www.wellfound.com${job.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-500 mt-4 inline-block"
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
