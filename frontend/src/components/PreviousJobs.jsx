import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PreviousJobs() {
  const [jobsList, setJobsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
    setJobsList(savedJobs);
  }, []);

  const handleSelectJob = (jobId) => {
    navigate(`/results/${jobId}`);
  };

  return (
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
  );
}

export default PreviousJobs;
