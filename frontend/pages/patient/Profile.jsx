import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // 👈 Add subtle animations

export default function PatientProfile() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    age: "",
    profession: "",
    diagnosed: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (storedUser) {
      setFormData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        gender: storedUser.gender || "",
        age: storedUser.age || "",
        profession: storedUser.profession || "",
        diagnosed: storedUser.diagnosed || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/update/patient/${storedUser.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Profile updated successfully!");
        setIsEditing(false);

        // ✅ Update localStorage
        const updatedUser = { ...storedUser, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        setMessage("⚠️ " + (data.error || "Failed to update profile."));
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f1ee] via-[#e7efe8] to-[#dce9e2] py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-[#d8d4c4]"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#bcd6c7] flex items-center justify-center text-4xl font-bold text-[#2f4f4f] shadow-md">
            {formData.name ? formData.name[0].toUpperCase() : "?"}
          </div>
          <h2 className="text-2xl font-bold text-[#2f4f4f] mt-4">
            {formData.name || "Unnamed Patient"}
          </h2>
          <p className="text-gray-600 text-sm">{formData.email}</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                {key}
              </label>
              <input
                type={key === "age" ? "number" : "text"}
                name={key}
                value={value}
                onChange={handleChange}
                disabled={!isEditing || key === "email"}
                className={`w-full border border-[#cfcac0] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#bcd6c7] transition-all ${
                  key === "email"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#bcd6c7] text-[#1a3d2f] font-semibold px-6 py-2 rounded-md hover:bg-[#a7c9b5] shadow-sm transition-transform hover:scale-105"
            >
              ✏️ Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-700 shadow-md transition-transform hover:scale-105"
            >
              💾 Save Changes
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center mt-6 text-sm font-medium ${
              message.includes("✅")
                ? "text-green-700"
                : message.includes("⚠️")
                ? "text-yellow-700"
                : "text-red-600"
            }`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
