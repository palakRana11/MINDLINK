import React, { useState, useEffect } from "react";

export default function Report({ patientId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Friendly quotes if no report exists
  const fallbackQuotes = [
    "Your reports will be displayed here once available. Keep tracking your progress!",
    "Every small step counts. Reports will appear here soon.",
    "Stay consistent with your journaling—your reports will show up here as soon as the doctor updates them.",
    "Well-being grows with attention. Your report will be visible here shortly.",
    "Your journey matters. Reports will appear here when available."
  ];

  const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

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

  if (loading) return <p className="text-gray-500">Loading report...</p>;
  if (error) return (
    <div className="p-6 bg-white shadow rounded-md max-w-xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Patient Report</h2>
        <p className="text-gray-700 italic">{randomQuote}</p>
      </div>
  );

  // Show friendly placeholder if no report exists
  if (!report || !report.report) {
    return (
      <div className="p-6 bg-white shadow rounded-md max-w-xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">Patient Report</h2>
        <p className="text-gray-700 italic">{randomQuote}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow rounded-md max-w-xl mx-auto">
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
