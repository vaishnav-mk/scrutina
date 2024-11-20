import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistance } from "date-fns";

function PreviousJobs() {
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noJobs, setNoJobs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + "/jobs")
      .then((response) => response.json())
      .then((data) => {
        if (data.jobs.length === 0) {
          setNoJobs(true);
        } else {
          setJobsList(data.jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
      })
      .catch(() => setNoJobs(true))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectJob = (jobId) => {
    navigate(`/results/${jobId}`);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Previous Jobs:</h2>
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (noJobs) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Previous Jobs:</h2>
        <p className="text-gray-300">No jobs available.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Previous Jobs:</h2>
      <div className="space-y-6 mt-4">
        {jobsList.map((job, index) => (
          <div
            key={index}
            className="border border-gray-700 p-6 cursor-pointer hover:bg-gray-700"
            onClick={() => handleSelectJob(job.job_id)}
          >
            <h3 className="text-xl font-semibold text-green-400">Job ID: {job.job_id}</h3>
            <p className="text-sm text-gray-400">Status: {job.status}</p>
            <p className="text-sm text-gray-400">Created At: {job.created_at ? new Date(job.created_at).toLocaleString() : "N/A"}</p>
            <p className="text-sm text-gray-400">Completed At: {job.completed_at ? new Date(job.completed_at).toLocaleString(): "N/A"}</p>
            <p className="text-sm text-gray-400">Took: {job.completed_at && job.created_at ? formatDistance(new Date(job.created_at), new Date(job.completed_at)) : "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreviousJobs;
