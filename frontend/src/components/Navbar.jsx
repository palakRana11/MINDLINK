import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Navbar({ role }) {
  const navigate = useNavigate();
  const { setLoggedUser } = useContext(UserContext);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    setLoggedUser(null);
    localStorage.clear();
    window.location.href = "/"; // full reload ensures clean logout
  };

  if (!role) return null;

  return (
    <nav className="w-full bg-[#f9f8f3] border-b border-[#e2dfd0] px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <h1
        className="text-2xl font-semibold text-[#2f4f4f] cursor-pointer"
        onClick={() => navigate(`/${role}/dashboard`)}
      >
        🪴 MindLink
      </h1>

      {/* Navigation Links */}
      <div className="flex gap-6 text-[#3b4b3b] font-medium">
        <Link to={`/${role}/dashboard`} className="hover:text-green-700">
           Home
        </Link>

        <Link to={`/${role}/sessions`} className="hover:text-green-700">
           Sessions
        </Link>

        <Link to={`/${role}/chat`} className="hover:text-green-700">
           Chat
        </Link>

        {/* 👩‍⚕️ Doctor-specific Links */}
        {role === "doctor" && (
          <>
            <Link to="/doctor/requests" className="hover:text-green-700">
               Requests
            </Link>

            <Link to="/doctor/patients" className="hover:text-green-700">
               Patients
            </Link>

            <Link to="/doctor/insights" className="hover:text-green-700">
               Patient Insights
            </Link>
          </>
        )}

        {/* 👨‍⚕️ Patient-specific Links */}
        {role === "patient" && (
          <>
            <Link to={`/${role}/journal`} className="hover:text-green-700">
               Journal
            </Link>

            <Link to={`/${role}/buddy`} className="hover:text-green-700">
               Buddy
            </Link>

            <Link to="/patient/doctors" className="hover:text-green-700">
               Doctors
            </Link>
          </>
        )}
      </div>

      {/* User Info + Logout */}
      <div className="flex items-center gap-4">
        

        <button
          onClick={handleLogout}
          className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
