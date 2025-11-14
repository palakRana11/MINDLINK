import React, { useState, useEffect } from "react";
export default function Report({ patientId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`http://localhost:5000/report/${patientId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch report");

        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [patientId]);

  if (loading || !report) return null; // Show nothing if loading or no report
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-white shadow rounded-md max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Patient Report</h2>
      <p className="text-gray-800 font-semibold">Title: {report.report.title}</p>
      <p className="text-gray-700 mt-2">Summary: {report.report.summary}</p>
      <p className="text-gray-700 mt-2 whitespace-pre-line">Details: {report.report.details}</p>
      <p className="text-gray-400 text-sm mt-4">
        Created at: {report.created_at || "N/A"} | Updated at: {report.updated_at || "N/A"}
      </p>
    </div>
  );
}
