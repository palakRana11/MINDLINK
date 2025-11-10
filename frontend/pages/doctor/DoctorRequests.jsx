import React, { useEffect, useState } from "react";

export default function DoctorRequests() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/doctor/${user.id}/requests`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      const endpoint =
        action === "approve"
          ? `http://127.0.0.1:5000/doctor/approve_request/${requestId}`
          : `http://127.0.0.1:5000/doctor/reject_request/${requestId}`;

      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      setMessage(data.message);
      fetchRequests();
    } catch (err) {
      console.error("Error handling request:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#2f4f4f] mb-4">
        📨 Patient Requests
      </h2>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white p-5 rounded-xl shadow border border-gray-200 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg text-[#2f4f4f]">
                  {req.name}
                </h3>
                <p className="text-sm text-gray-600">{req.email}</p>
                <p className="text-sm text-gray-500">
                  {req.age} years • {req.gender} • {req.profession}
                </p>
                <p className="text-sm italic text-gray-400">
                  Diagnosed: {req.diagnosed || "N/A"}
                </p>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => handleAction(req.request_id, "approve")}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(req.request_id, "reject")}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
