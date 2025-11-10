import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function AuthPage() {
  const [role, setRole] = useState("patient");
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const { setLoggedUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle form input change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle login/register submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin
      ? `http://127.0.0.1:5000/login/${role}`
      : `http://127.0.0.1:5000/register/${role}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setError(null);

      if (res.ok) {
        if (isLogin) {
          // ✅ LOGIN FLOW
          const source = data.user || data;
          const userData = { ...source, role };

          // Save to localStorage & context
          localStorage.setItem("user", JSON.stringify(userData));
          setLoggedUser(userData);

          console.log("AuthPage: navigating to dashboard for role", role);
          navigate(`/${role}/dashboard`);
        } else {
          // ✅ REGISTER FLOW → redirect to login page instead of auto login
          alert("Registration successful! Please log in to continue.");
          setIsLogin(true); // switch UI to login mode
          navigate("/"); // redirect to main (login) page
        }
      } else {
        setError(data.message || data.error || "Request failed");
      }
    } catch (err) {
      console.error("AuthPage: network error", err);
      setError("Network error or server not responding.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f1ee] to-[#dfeee8]">
      <div className="w-[400px] bg-[#fdfbf9] shadow-xl rounded-2xl p-8 border border-[#e0d7ce]">
        {/* Role Tabs */}
        <div className="flex justify-around mb-6">
          {["patient", "doctor"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`w-1/2 py-2 rounded-md font-semibold transition-all ${
                role === r
                  ? "bg-[#bcd6c7] text-[#1a3d2f]"
                  : "bg-transparent text-gray-500 hover:text-[#2f4f4f]"
              }`}
            >
              {r === "patient" ? "Patient" : "Doctor"}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center text-[#2f4f4f] mb-4">
          {isLogin ? "Login" : "Register"} as{" "}
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full border border-[#d3cfc9] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#bcd6c7]"
                required
              />
              {role === "doctor" && (
                <>
                  <input
                    name="specialization"
                    placeholder="Specialization"
                    onChange={handleChange}
                    className="w-full border border-[#d3cfc9] rounded-md p-2"
                  />
                  <input
                    name="license_number"
                    placeholder="License Number"
                    onChange={handleChange}
                    className="w-full border border-[#d3cfc9] rounded-md p-2"
                  />
                </>
              )}
              {role === "patient" && (
                <>
                  <input
                    name="gender"
                    placeholder="Gender"
                    onChange={handleChange}
                    className="w-full border border-[#d3cfc9] rounded-md p-2"
                  />
                  <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    onChange={handleChange}
                    className="w-full border border-[#d3cfc9] rounded-md p-2"
                  />
                </>
              )}
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border border-[#d3cfc9] rounded-md p-2"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border border-[#d3cfc9] rounded-md p-2"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#bcd6c7] text-[#1a3d2f] font-semibold rounded-md py-2 hover:bg-[#a7c9b5] transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-center text-sm text-red-600">{error}</div>
        )}

        <p className="text-center text-gray-600 mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#2f4f4f] font-semibold hover:underline"
          >
            {isLogin ? "Register" : "Login"} here
          </button>
        </p>
      </div>
    </div>
  );
}
