import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Sessions() {
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.id;

  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [time, setTime] = useState("");

  const [editingSession, setEditingSession] = useState(null);
  const [editDateByPatient, setEditDateByPatient] = useState("");
  const [editTimeByPatient, setEditTimeByPatient] = useState("");

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isPastDateTime = () => {
    if (!time) return false;
    const [hour, minute] = time.split(":").map(Number);
    const selected = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      minute
    );
    return selected < new Date();
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/sessions/patient/${patientId}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));

    fetch(`http://127.0.0.1:5000/doctors`)
      .then((res) => res.json())
      .then((data) => setAvailableDoctors(Array.isArray(data) ? data : []));
  }, [patientId]);

  const handleCreateSession = async () => {
    if (isPastDateTime()) return alert("Cannot book past date/time!");

    const res = await fetch("http://127.0.0.1:5000/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctorId,
        patient_id: patientId,
        date: formatDate(selectedDate),
        time,
        created_by: "patient",
      }),
    });

    const data = await res.json();
    alert(data.message || "Created");
    window.location.reload();
  };

  const handleStatusChange = async (id, status, type) => {
    const endpoint =
      type === "edit"
        ? `http://127.0.0.1:5000/session/${id}/edit/decision`
        : `http://127.0.0.1:5000/session/${id}/update`;

    const body =
      type === "edit"
        ? { decision: status, decided_by: "patient" }
        : { status };

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(data.message || `${type === "edit" ? "Edit" : "Session"} ${status}ed`);
    window.location.reload();
  };

  const handlePatientEditRequest = async (sessionId) => {
    if (!editDateByPatient || !editTimeByPatient)
      return alert("Please choose new date and time.");

    const res = await fetch(`http://127.0.0.1:5000/session/${sessionId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_date: editDateByPatient,
        new_time: editTimeByPatient,
        requested_by: "patient",
      }),
    });

    const data = await res.json();
    alert(data.message || "Edit request sent");
    setEditingSession(null);
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

  // ---------------------------
  //        JOIN BUTTON LOGIC
  // ---------------------------
  const isJoinEnabled = (session) => {
    if (session.status !== "accepted") return false;

    const today = formatDate(new Date());
    if (session.date !== today) return false;

    const [h, m] = session.time.split(":").map(Number);

    const sessionTime = new Date();
    sessionTime.setHours(h, m, 0, 0);

    const now = new Date();

    const minus10 = new Date(sessionTime.getTime() - 10 * 60000);
    const plus30 = new Date(sessionTime.getTime() + 30 * 60000);

    if (now >= minus10 && now <= plus30) return true;

    return false;
  };

  const isSessionExpired = (s) => {
    const [h, m] = s.time.split(":").map(Number);
    const sessionTime = new Date();
    sessionTime.setHours(h, m, 0, 0);

    const now = new Date();
    const plus30 = new Date(sessionTime.getTime() + 30 * 60000);

    return now > plus30;
  };

  // ---------------------------------

  const tileContent = ({ date }) => {
    const dateStr = formatDate(date);
    const dateSessions = sessions.filter((s) => s.date === dateStr);

    if (dateSessions.length === 0) return null;

    const tooltipText = dateSessions
      .map(
        (s) =>
          `${s.doctor_name} • ${formatTime(s.time)} • ${
            s.status.charAt(0).toUpperCase() + s.status.slice(1)
          }`
      )
      .join("\n");

    return (
      <div className="flex justify-center items-center mt-1" title={tooltipText}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#fdfbf9] rounded-3xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6 text-[#2f4f4f]">
        📅 My Therapy Sessions
      </h2>

      {/* CALENDAR + REQUEST NEW SESSION */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-4 rounded-xl border border-[#e2dfd0]">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            minDate={new Date()}
          />
          <p className="text-center mt-2 text-gray-600">
            Selected: {selectedDate.toDateString()}
          </p>
        </div>

        {/* REQUEST FORM */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3">Request New Session</h3>

          <select
            className="w-full p-2 border rounded-lg mb-3"
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Select Doctor</option>
            {availableDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization}
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
            disabled={!doctorId || !time || isPastDateTime()}
          >
            Send Request
          </button>
          {isPastDateTime() && (
            <p className="text-red-500 text-sm mt-1">
              Cannot book past date/time.
            </p>
          )}
        </div>
      </div>

      {/* ALL SESSIONS */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3 text-[#2f4f4f]">
          🧾 All Sessions
        </h3>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-[#fafaf9] rounded-xl border border-[#e2dfd0] flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium"> Dr. {s.doctor_name}</p>
                  <p className="text-sm text-gray-600">
                    {s.date} at {formatTime(s.time)}
                  </p>

                  {s.edit_request &&
                    s.edit_request.new_date &&
                    s.edit_request.requested_by === "doctor" && (
                      <div className="mt-2 text-sm bg-gray-50 rounded p-2 border border-gray-100">
                        <p className="text-xs text-gray-700">
                          Doctor requested to edit
                        </p>
                        <p className="text-xs text-gray-600">
                          New: {s.edit_request.new_date} at{" "}
                          {formatTime(s.edit_request.new_time)}
                        </p>
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Accept/Reject doctor edit request */}
                  {s.edit_request?.requested_by === "doctor" ? (
                    <>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => handleStatusChange(s.id, "accept", "edit")}
                      >
                        Accept Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleStatusChange(s.id, "reject", "edit")}
                      >
                        Reject Edit
                      </button>
                    </>
                  ) : s.status === "pending" && s.created_by === "doctor" ? (
                    <>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() =>
                          handleStatusChange(s.id, "accepted", "session")
                        }
                      >
                        Accept Request
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() =>
                          handleStatusChange(s.id, "rejected", "session")
                        }
                      >
                        Reject Request
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
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  )}

                  {/* JOIN BUTTON */}
                  {s.status === "accepted" &&
                    s.date === formatDate(new Date()) && (
                      <>
                        {isSessionExpired(s) ? (
                          <span className="text-gray-500 text-sm italic">
                            Session Expired
                          </span>
                        ) : (
                          <button
                            className={`px-4 py-1 rounded-lg text-white ${
                              isJoinEnabled(s)
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!isJoinEnabled(s)}
                            onClick={() => alert("Joining session...")}
                          >
                            Join Session
                          </button>
                        )}
                      </>
                    )}

                  {/* PATIENT EDIT REQUEST */}
                  {editingSession === s.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className="border p-1 rounded"
                        onChange={(e) => setEditDateByPatient(e.target.value)}
                        min={formatDate(new Date())}
                      />
                      <input
                        type="time"
                        className="border p-1 rounded"
                        onChange={(e) => setEditTimeByPatient(e.target.value)}
                      />
                      <button
                        className="text-green-600 font-semibold"
                        onClick={() => handlePatientEditRequest(s.id)}
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
          <p className="text-gray-500 italic text-center">No sessions yet.</p>
        )}
      </div>
    </div>
  );
}
