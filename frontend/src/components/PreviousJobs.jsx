import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';

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
        <h2 className="text-xl font-semibold">Previous Jobs:</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (noJobs) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Previous Jobs:</h2>
        <p className="text-gray-600">No jobs available.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Previous Jobs:</h2>
      <div className="space-y-4 mt-4">
        {jobsList.map((job, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() => handleSelectJob(job.job_id)}
          >
            <h3 className="text-lg font-semibold">Job ID: {job.job_id}</h3>
            <p className="text-sm text-gray-600">Status: {job.status}</p>
            <p className="text-sm text-gray-600">Created At: {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
            <p className="text-sm text-gray-600">Completed At: {job.completed_at ? formatDistanceToNow(new Date(job.completed_at), { addSuffix: true }) : "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreviousJobs;
