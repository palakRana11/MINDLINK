import React, { useEffect, useState } from "react";

export default function Summary({ patientId }) {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/report/summary/${patientId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to fetch summary.");
        } else {
          setSummaryData(data);
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [patientId]);

  if (loading) return null;           // Do not render anything while loading
  if (error) return null;             // Do not render anything on error
  if (!summaryData) return null;      // Do not render if no summary

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-[#2f4f4f]">📝 Report Summary</h2>

      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-1">Summary:</h3>
        <p className="text-gray-700">{summaryData.summary}</p>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-1">Recommendations:</h3>
        <ul className="list-disc list-inside text-gray-700">
          {summaryData.recommendations
            ? summaryData.recommendations.split("\n").map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))
            : <li>No recommendations provided.</li>
          }
        </ul>
      </div>
    </div>
  );
}
