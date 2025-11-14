import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function PatientsInsights() {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id;

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Report form state
  const [reportTitle, setReportTitle] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [existingReport, setExistingReport] = useState(null);

  // Fetch doctor’s assigned patients
  useEffect(() => {
    if (doctorId) {
      fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`)
        .then((res) => res.json())
        .then((data) => setPatients(data))
        .catch((err) => console.error("Error fetching patients:", err));
    }
  }, [doctorId]);

  // Fetch mood data and report when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);

      // Fetch mood data
      fetch(`http://127.0.0.1:5000/journal/${selectedPatient}`)
        .then((res) => res.json())
        .then((data) => {
          const processed = data.map((d) => ({
            date: new Date(d.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            }),
            sentiment_score: d.sentiment_score,
            mood: classifyMood(d.sentiment_score),
          }));
          setMoodData(processed);
        })
        .catch((err) => console.error("Error fetching mood data:", err))
        .finally(() => setLoading(false));

      // Fetch latest report
      fetch(`http://127.0.0.1:5000/report/${selectedPatient}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.report) {
            const report = data.report;
            setExistingReport(report);
            setReportTitle(report.title || "");
            setReportSummary(report.summary || "");
            setReportDetails(report.details || "");
          } else {
            setExistingReport(null);
            setReportTitle("");
            setReportSummary("");
            setReportDetails("");
          }
        })
        .catch((err) => console.error("Error fetching report:", err));
    }
  }, [selectedPatient]);

  const classifyMood = (compound) => {
    if (compound >= 0.5) return "Happy 😊";
    else if (compound >= 0.1) return "Calm 😌";
    else if (compound >= -0.4) return "Neutral 😐";
    else if (compound >= -0.7) return "Sad 😢";
    else return "Angry 😠";
  };

  const avgScore =
    moodData.length > 0
      ? moodData.reduce((sum, d) => sum + d.sentiment_score, 0) /
        moodData.length
      : 0;

  // ------------------ REPORT SUBMISSION ------------------
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return alert("Select a patient first.");

    setReportLoading(true);
    const payload = {
      patient_id: selectedPatient,
      title: reportTitle,
      summary: reportSummary,
      details: reportDetails,
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`http://127.0.0.1:5000/report`, {
        method: "POST", // backend handles create/update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message || "Report saved!");
      setExistingReport(payload); // Update local state
    } catch (err) {
      console.error("Error saving report:", err);
      alert("Failed to save report.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-[#fafaf9] rounded-3xl shadow-md border border-[#e2dfd0] p-8">
      <h2 className="text-2xl font-semibold text-[#2f4f4f] text-center mb-8">
        🧠 Patient Mood Insights
      </h2>

      {/* Patient Selector */}
      <div className="flex justify-center mb-6">
        <select
          className="border border-[#ccc] rounded-lg px-4 py-2 w-72 bg-white focus:ring-2 focus:ring-green-300"
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
        >
          <option value="">Select a Patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.age}, {p.gender})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading mood data...</p>
      ) : !selectedPatient ? (
        <p className="text-center text-gray-500 italic">
          Please select a patient to view their mood analysis 🩺
        </p>
      ) : moodData.length === 0 ? (
        <p className="text-center text-gray-500 italic">
          No journal data available for this patient yet. Encourage them to
          document their feelings.❤️
        </p>
      ) : (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#3b4b3b] mb-4 text-center">
            Weekly Mood Analysis 🌦️
          </h3>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                domain={[-1, 1]}
                label={{
                  value: "Sentiment Score",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === "sentiment_score") {
                    const mood = props.payload.mood;
                    return [`${value.toFixed(2)} (${mood})`, "Mood Score"];
                  }
                  return [value];
                }}
              />
              <Line
                type="monotone"
                dataKey="sentiment_score"
                stroke="#2f855a"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Mood Summary */}
          <div className="mt-6 text-center">
            <p className="mt-2 text-gray-700">
              Overall mood trend:{" "}
              <span className="font-semibold text-green-700">
                {classifyMood(avgScore)}
              </span>
            </p>
            <p className="text-gray-700">
              Average sentiment this week:{" "}
              <span className="font-semibold text-green-700">
                {avgScore.toFixed(2)}
              </span>
            </p>
          </div>

          {/* ---------------- REPORT FORM ---------------- */}
          <div className="mt-10 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-[#3b4b3b]">
              📝 Generate / Update Report
            </h3>
            <form className="space-y-4" onSubmit={handleReportSubmit}>
              <input
                type="text"
                placeholder="Report Title"
                className="w-full border p-2 rounded"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Short Summary"
                className="w-full border p-2 rounded"
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
                required
              />
              <textarea
                placeholder="Detailed Notes"
                className="w-full border p-2 rounded h-40"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                disabled={reportLoading}
              >
                {reportLoading ? "Saving..." : "Save Report"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
