import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    // ✅ Force full reload to ensure context + state reset
    window.location.href = "/";
  };

  return (
    <div className="h-screen w-64 bg-[#f9f8f3] border-r border-[#e2dfd0] flex flex-col justify-between shadow-sm fixed">
      {/* Sidebar links */}
      <div className="flex flex-col p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[#2f4f4f] mb-4">🪴 MindLink</h2>

        {/* ✅ Common Links */}
        <Link to={`/${role}/dashboard`} className="hover:text-green-700">
          🏠 Home
        </Link>

        <Link to={`/${role}/sessions`} className="hover:text-green-700">
          📅 Sessions
        </Link>

        <Link to={`/${role}/chat`} className="hover:text-green-700">
          💬 Chat
        </Link>

        {/* 👩‍⚕️ Doctor Links */}
        {role === "doctor" && (
          <>
            <Link to="/doctor/requests" className="hover:text-green-700">
              📨 Requests
            </Link>

            <Link to="/doctor/insights" className="hover:text-green-700">
              🧠 Patient Insights
            </Link>
          </>
        )}

        {/* 👨‍⚕️ Patient Links */}
        {role === "patient" && (
          <>
            <Link to={`/${role}/journal`} className="hover:text-green-700">
              📔 Journal
            </Link>

            <Link to={`/${role}/buddy`} className="hover:text-green-700">
              🤖 Buddy
            </Link>

            <Link to="/patient/doctors" className="hover:text-green-700">
              👨‍⚕️ Doctors
            </Link>
          </>
        )}
      </div>

      {/* User section at bottom */}
      <div className="border-t border-[#e2dfd0] p-6 text-[#3b4b3b]">
        {/* ✅ Clickable user info */}
        <div
          className="mb-3 cursor-pointer hover:text-green-700 transition"
          onClick={() => navigate(`/${role}/profile`)}
        >
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
