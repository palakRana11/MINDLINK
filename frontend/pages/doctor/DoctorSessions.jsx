import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DoctorSessions() {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id;

  const [sessions, setSessions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [patientId, setPatientId] = useState("");

  const [editingSession, setEditingSession] = useState(null);
  const [editDateByDoctor, setEditDateByDoctor] = useState("");
  const [editTimeByDoctor, setEditTimeByDoctor] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/doctor/${doctorId}/patients`)
      .then((res) => res.json())
      .then((data) => setPatients(Array.isArray(data) ? data : []));

    fetch(`http://127.0.0.1:5000/sessions/doctor/${doctorId}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, [doctorId]);

  // ✅ FIXED DATE ISSUE — timezone safe
  const handleCreateSession = async () => {
    const formatted = selectedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const res = await fetch("http://127.0.0.1:5000/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctorId,
        patient_id: patientId,
        date: formatted,
        time,
        created_by: "doctor",
      }),
    });

    const data = await res.json();
    alert(data.message || "Created");
    window.location.reload();
  };

  const handleStatusChange = async (id, status) => {
    await fetch(`http://127.0.0.1:5000/session/${id}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    alert(`Session ${status}`);
    window.location.reload();
  };

  const handleDoctorEditRequest = async (sessionId) => {
    if (!editDateByDoctor || !editTimeByDoctor) {
      return alert("Please choose new date and time.");
    }

    const res = await fetch(`http://127.0.0.1:5000/session/${sessionId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_date: editDateByDoctor,
        new_time: editTimeByDoctor,
        requested_by: "doctor",
      }),
    });

    const data = await res.json();
    alert(data.message || "Edit request sent");
    setEditingSession(null);
    window.location.reload();
  };

  const handleRespondEdit = async (sessionId, decision) => {
    const res = await fetch(
      `http://127.0.0.1:5000/session/${sessionId}/edit/decision`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          decided_by: "doctor",
        }),
      }
    );

    const data = await res.json();
    alert(data.message || `Edit ${decision}ed`);
    window.location.reload();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const tileContent = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const dateSessions = sessions.filter((s) => s.date === dateStr);

    if (dateSessions.length === 0) return null;

    const tooltipText = dateSessions
      .map(
        (s) =>
          `${s.patient_name} • ${formatTime(s.time)} • ${
            s.status.charAt(0).toUpperCase() + s.status.slice(1)
          }`
      )
      .join("\n");

    return (
      <div
        title={tooltipText}
        className="flex justify-center items-center mt-1"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#fdfbf9] rounded-3xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6 text-[#2f4f4f]">
        🩺 My Scheduled Sessions
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-4 rounded-xl border border-[#e2dfd0]">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
          <p className="text-center mt-2 text-gray-600">
            Selected: {selectedDate.toDateString()}
          </p>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3">Add New Session</h3>

          <select
            className="w-full p-2 border rounded-lg mb-3"
            onChange={(e) => setPatientId(e.target.value)}
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.age}, {p.gender})
              </option>
            ))}
          </select>

          <input
            type="time"
            className="w-full p-2 border rounded-lg mb-3"
            onChange={(e) => setTime(e.target.value)}
          />

          <button
            onClick={handleCreateSession}
            className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700"
          >
            Add Session
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3 text-[#2f4f4f]">
          📋 All Sessions
        </h3>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-[#fafaf9] rounded-xl border border-[#e2dfd0] flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{s.patient_name}</p>
                  <p className="text-sm text-gray-600">
                    {s.date} at {formatTime(s.time)}
                  </p>

                  {s.edit_request && s.edit_request.new_date && (
                    <div className="mt-2 text-sm bg-gray-50 rounded p-2 border border-gray-100">
                      <p className="text-xs text-gray-700">
                        Edit requested by{" "}
                        <strong>{s.edit_request.requested_by}</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        New: {s.edit_request.new_date} at{" "}
                        {formatTime(s.edit_request.new_time)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {s.status === "edit_requested" &&
                  s.edit_request &&
                  s.edit_request.requested_by === "patient" ? (
                    <>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => handleRespondEdit(s.id, "accept")}
                      >
                        Accept Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleRespondEdit(s.id, "reject")}
                      >
                        Reject Edit
                      </button>
                    </>
                  ) : null}

                  {s.status === "pending" && s.created_by === "patient" ? (
                    <>
                      <button
                        className="text-green-600 mr-3 hover:underline"
                        onClick={() =>
                          handleStatusChange(s.id, "accepted")
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() =>
                          handleStatusChange(s.id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        s.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : s.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  )}

                  {editingSession === s.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className="border p-1 rounded"
                        onChange={(e) =>
                          setEditDateByDoctor(e.target.value)
                        }
                      />
                      <input
                        type="time"
                        className="border p-1 rounded"
                        onChange={(e) =>
                          setEditTimeByDoctor(e.target.value)
                        }
                      />
                      <button
                        className="text-green-600 font-semibold"
                        onClick={() =>
                          handleDoctorEditRequest(s.id)
                        }
                      >
                        ✅ Send
                      </button>
                      <button
                        className="text-gray-500"
                        onClick={() => setEditingSession(null)}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setEditingSession(s.id)}
                    >
                      Request Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center">
            No sessions yet.
          </p>
        )}
      </div>
    </div>
  );
}
