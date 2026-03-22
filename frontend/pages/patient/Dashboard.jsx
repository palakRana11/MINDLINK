import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../src/context/UserContext";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Report from "../../src/components/Report";
import Summary from "../../src/components/Summary";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { loggedUser } = useContext(UserContext);
  const userName = loggedUser?.name?.split(" ")[0] || "Friend";
  const userId = loggedUser?.id;
  const navigate = useNavigate();

  const [mood, setMood] = useState(null);
  const [quote, setQuote] = useState("");
  const [value, setValue] = useState(new Date());
  const [sessions, setSessions] = useState([]);

  // ✅ SOS STATES
  const [sendingSOS, setSendingSOS] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const moodColors = {
    Happy: "from-yellow-100 to-yellow-50",
    Sad: "from-blue-100 to-blue-50",
    Angry: "from-red-100 to-red-50",
    Calm: "from-green-100 to-green-50",
    Stressed: "from-purple-100 to-purple-50",
    Neutral: "from-gray-100 to-gray-50",
    None: "from-gray-100 to-white",
  };

  const quotes = { /* unchanged */ };

  // ---------------------- FETCH MOOD ----------------------
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/mood/today/${userId}`)
      .then((res) => {
        const moodToday = res.data.mood || "None";
        setMood(moodToday);

        const arr = quotes[moodToday] || quotes["None"];
        const q1 = arr[Math.floor(Math.random() * arr.length)];
        const q2 = arr[Math.floor(Math.random() * arr.length)];

        setQuote(`${q1} ${q2}`);
      })
      .catch(() => {
        setMood("None");
        const arr = quotes["None"];
        const q1 = arr[Math.floor(Math.random() * arr.length)];
        const q2 = arr[Math.floor(Math.random() * arr.length)];
        setQuote(`${q1} ${q2}`);
      });
  }, [userId]);

  // ---------------------- FETCH SESSIONS ----------------------
  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:5000/sessions/patient/${userId}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, [userId]);

  // ---------------------- SOS FUNCTION ----------------------
  const handleSOS = async () => {
    if (!userId) return;

    try {
      setSendingSOS(true);

      await axios.post("http://127.0.0.1:5000/sos", {
        patient_id: userId,
        message: `Emergency! Immediate help required . Please connect on the MINDLINK platform`
      });

      setShowConfirm(false);
      alert("🚨 SOS sent successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send SOS. Try again.");
    } finally {
      setSendingSOS(false);
    }
  };

  // ---------------------- CALENDAR DOT ----------------------
  const tileContent = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const found = sessions.some((s) => s.date === dateStr);

    if (!found) return null;

    return (
      <div className="flex justify-center items-center mt-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="w-[70vw] mx-auto mt-12 space-y-10">
      {/* ------------------ Mood Box ------------------ */}
      <div
        className={`p-10 rounded-3xl shadow-lg bg-gradient-to-b ${
          moodColors[mood] || moodColors["None"]
        } text-center transition-all duration-700`}
      >
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 tracking-tight">
          Hi {userName}! 👋
        </h1>

        <p className="text-lg font-medium text-gray-700 italic leading-relaxed max-w-3xl mx-auto animate-fadeIn">
          “{quote}”
        </p>

        {mood === "None" && (
          <p className="mt-8 text-xl text-green-700 font-semibold">
            Don't forget to journal today, {userName}! 📝
          </p>
        )}

        <style>{`
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ------------------ Calendar + Report ------------------ */}
      <div className="flex gap-6">
        <div
          className="flex-shrink-0 p-5 bg-white/80 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl w-[330px] hover:shadow-lg transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/patient/sessions")}
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-800 tracking-wide">
            Your Sessions
          </h2>
          <div className="flex justify-center">
            <div className="scale-95">
              <Calendar value={value} onChange={setValue} tileContent={tileContent} />
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 bg-white/80 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl max-h-[520px] overflow-y-auto">
          <Report patientId={userId} doctorId={loggedUser?.assigned_doctor_id} />
        </div>
      </div>

      {/* ------------------ AI Summary ------------------ */}
      <div className="p-5 bg-white/80 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl overflow-auto">
        <Summary patientId={userId} />
      </div>

      {/* ------------------ FLOATING SOS BUTTON ------------------ */}
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-xl font-bold transition-all duration-300"
      >
        SOS
      </button>

      {/* ------------------ CONFIRM MODAL ------------------ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center w-[300px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Send Emergency Alert?
            </h2>
            <p className="text-gray-600 mb-6">
              This will notify your doctor immediately.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSOS}
                disabled={sendingSOS}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                {sendingSOS ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;