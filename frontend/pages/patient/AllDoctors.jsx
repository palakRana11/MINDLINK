import React, { useEffect, useState } from "react";

export default function AllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [connectionTime, setConnectionTime] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Fetch assigned doctor if any
    if (user.assigned_doctor_id) {
      fetch(`http://127.0.0.1:5000/doctor/${user.assigned_doctor_id}`)
        .then((res) => res.json())
        .then((data) => {
          setAssignedDoctor(data);
          setConnectionTime(data.connected_since);
        })
        .catch((err) => console.error(err));
    } else {
      // Otherwise fetch all available doctors
      fetch("http://127.0.0.1:5000/doctors")
        .then((res) => res.json())
        .then((data) => setDoctors(data))
        .catch((err) => console.error("Error fetching doctors:", err));
    }
  }, []);

  const sendRequest = async (doctorId) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/request/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: user.id, doctor_id: doctorId }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage("Error sending request. Try again.");
      console.error(err);
    }
  };

  const removeDoctor = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/patient/remove_doctor/${user.id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      setMessage(data.message);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, assigned_doctor_id: null })
      );
      window.location.reload();
    } catch (err) {
      setMessage("Error removing doctor.");
    }
  };

  if (assignedDoctor) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white border border-[#e0d7ce] rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-[#2f4f4f] mb-4 text-center">
          👩‍⚕️ Your Doctor
        </h2>
        <p><b>Name:</b> {assignedDoctor.name}</p>
        <p><b>Specialization:</b> {assignedDoctor.specialization}</p>
        <p><b>Clinic:</b> {assignedDoctor.clinic_name}</p>
        <p><b>Experience:</b> {assignedDoctor.experience} years</p>
        <p className="mt-2 text-sm text-gray-600">
          Connected since: {connectionTime ? new Date(connectionTime).toDateString() : "N/A"}
        </p>

        <button
          onClick={removeDoctor}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Remove Doctor ❌
        </button>

        {message && <p className="text-center mt-3 text-green-600">{message}</p>}
      </div>
    );
  }

  // Default: show all available doctors
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-[#2f4f4f] mb-6 text-center">
        🩺 Available Doctors
      </h2>

      {message && (
        <p className="text-center text-green-700 font-medium mb-4">{message}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-[#e0d7ce] rounded-xl shadow-md p-5 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-[#1a3d2f]">{doc.name}</h3>
            <p className="text-gray-600">{doc.specialization}</p>
            <p className="text-sm text-gray-500 mt-1">
              🏥 {doc.clinic_name || "Independent Practice"}
            </p>
            <p className="text-sm text-gray-500">
              👨‍⚕️ {doc.experience || "N/A"} years experience
            </p>

            <button
              onClick={() => sendRequest(doc.id)}
              className="mt-4 bg-[#bcd6c7] text-[#1a3d2f] font-semibold px-4 py-2 rounded-md hover:bg-[#a7c9b5] transition"
            >
              Send Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
