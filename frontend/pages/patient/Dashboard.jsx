import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../src/context/UserContext";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Report from "../../src/components/Report";
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

  // mood → gradient colors
  const moodColors = {
    Happy: "from-yellow-100 to-yellow-50",
    Sad: "from-blue-100 to-blue-50",
    Angry: "from-red-100 to-red-50",
    Calm: "from-green-100 to-green-50",
    Stressed: "from-purple-100 to-purple-50",
    Neutral: "from-gray-100 to-gray-50",   // ⭐ ADDED NEUTRAL
    None: "from-gray-100 to-white",
  };

  // ----------------------- QUOTES -----------------------
  const quotes = {
    Happy: [
      "Keep shining, happiness looks great on you!",
      "Your smile is contagious.",
      "Today is full of possibilities!",
      "Happiness is a journey, enjoy every step.",
      "You're glowing with positivity.",
      "Your joy lights up the room.",
      "The world needs your smile today.",
      "Good vibes are your superpower.",
      "You radiate pure happiness.",
      "Celebrate every little win.",
      "Happiness begins with you.",
      "Let your joy speak louder.",
      "Your positive energy inspires others.",
      "Today feels brighter with you!",
      "Keep spreading happiness.",
      "Your cheerful heart is a gift.",
      "Your smile is your strongest strength.",
      "Let the sunshine in your soul shine.",
      "Your happiness uplifts everyone.",
      "You make today better just by being here!",
    ],

    Sad: [
      "It's okay to not be okay.",
      "Your feelings are valid.",
      "Storms don't last forever.",
      "You are stronger than your sadness.",
      "Take it one step at a time.",
      "You matter, deeply.",
      "Even the darkest night ends.",
      "Healing takes time—be kind to yourself.",
      "You're not alone in this.",
      "This moment will pass.",
      "You deserve peace.",
      "Be gentle with your heart today.",
      "Crying is not a weakness.",
      "You are allowed to feel this way.",
      "Your emotions are real and important.",
      "You are loved, even on hard days.",
      "You have survived every tough day.",
      "Small steps still move you forward.",
      "You will smile again.",
      "Your story isn’t over yet.",
    ],

    Angry: [
      "Take a deep breath—you deserve calm.",
      "Your feelings are valid, even the intense ones.",
      "Pause. Breathe. Reset.",
      "Anger is a message; listen to it gently.",
      "You are in control, not the anger.",
      "It’s okay to step away for a moment.",
      "Your peace matters more.",
      "Let the frustration flow out slowly.",
      "It's okay to feel overwhelmed.",
      "Choose calm over chaos.",
      "Your mind deserves rest.",
      "Anger does not define you.",
      "You are stronger than your reaction.",
      "Every emotion teaches something.",
      "Healing starts with a breath.",
      "Release, don't suppress.",
      "You are doing your best in a tough moment.",
      "Your calm is returning.",
      "Peace is finding its way back to you.",
      "Let today soften your heart again.",
    ],

    Calm: [
      "Your peaceful energy is beautiful.",
      "Today feels balanced and serene.",
      "You're moving through life gracefully.",
      "Calmness is a superpower.",
      "Your inner peace shows.",
      "Let this calm stay with you.",
      "You make peace look effortless.",
      "Your mind is clear and steady.",
      "You're aligned with your best self.",
      "This calm is well deserved.",
      "Stillness is speaking to you.",
      "Your energy is soft and soothing.",
      "You are grounded and centered.",
      "Peace looks good on you.",
      "You're flowing at the perfect pace.",
      "Your presence calms others too.",
      "Keep embracing the stillness.",
      "You are exactly where you need to be.",
      "Your calm heart is powerful.",
      "Serenity surrounds you today.",
    ],

    Stressed: [
      "Remember to breathe—you’re doing your best.",
      "Stress is temporary, your strength is permanent.",
      "Slow down, you deserve a break.",
      "Everything doesn’t need to be perfect.",
      "You're handling more than you realize.",
      "One moment at a time.",
      "You are capable of overcoming this.",
      "Rest is productive too.",
      "Let go of what you can’t control.",
      "You’ve survived 100% of your stressful days.",
      "Be kinder to yourself today.",
      "Your effort is enough.",
      "You are doing better than you think.",
      "Take a pause, recharge your mind.",
      "Gentle moments help you reset.",
      "You are stronger than your stress.",
      "This tension will ease soon.",
      "You deserve peace and rest.",
      "Let today be softer.",
      "Trust yourself—you will get through this.",
    ],

    // ⭐⭐⭐ ADDED NEUTRAL QUOTES (20) ⭐⭐⭐
    Neutral: [
      "Today is a fresh canvas—see where it takes you.",
      "Not every day needs to be extraordinary, and that’s okay.",
      "Neutral days are perfect for small wins.",
      "You’re doing fine—no pressure at all.",
      "A calm mind can grow beautiful ideas.",
      "You don’t have to feel a certain way to have a good day.",
      "Neutral moments lead to stable progress.",
      "Even simple days matter.",
      "Balance is quietly powerful.",
      "You’re moving forward, even gently.",
      "Take today at your own pace.",
      "Every steady step counts.",
      "Not too high, not too low—just right.",
      "Neutral days help reset the mind.",
      "You’re doing better than you think.",
      "There’s beauty in the in-between.",
      "Let today be soft and simple.",
      "You don't need excitement to grow.",
      "Quiet days restore your energy.",
      "Sometimes neutral is exactly what you need.",
    ],

    None: [
      "A fresh day brings new opportunities!",
      "Believe in yourself—you are stronger than you think.",
      "You have the power to make today amazing.",
      "Keep moving forward, step by step.",
      "You deserve peace, happiness, and kindness.",
      "Today is yours to grow.",
      "Every effort you make matters.",
      "Be gentle with yourself today.",
      "You are doing your best.",
      "You are enough, always.",
      "Small steps lead to big changes.",
      "It's a good day to start something positive.",
      "Your energy shapes your day—choose calm.",
      "Your journey matters.",
      "You are learning, growing, becoming better.",
      "Let today bring you clarity.",
      "You are capable of beautiful things.",
      "One moment at a time—that’s all you need.",
      "Your potential is limitless.",
      "You deserve kindness—from yourself too.",
    ],
  };

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

  // ---------------------- FETCH SESSIONS (GREEN DOT DATES) ----------------------
  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:5000/sessions/patient/${userId}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, [userId]);

  // ---------------------- GREEN DOT LOGIC ----------------------
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
    <div className="w-[70vw] mx-auto mt-12">
      {/* ------------------ MOOD BOX ------------------ */}
      <div
        className={`p-12 rounded-3xl shadow-2xl bg-gradient-to-b ${
          moodColors[mood] || moodColors["None"]
        } text-center transition-all duration-700`}
      >
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">
          Hi {userName}! 👋
        </h1>

        <p className="text-xl font-semibold text-gray-700 leading-relaxed italic animate-fadeIn max-w-4xl mx-auto">
          “{quote}”
        </p>

        {mood === "None" && (
          <p className="mt-10 text-2xl text-green-700 font-bold">
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

      {/* ------------------ SMALL CALENDAR ------------------ */}
      <div className="mt-10 flex justify-start">
        <div
          className="p-6 bg-white/70 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl 
                    cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 
                    w-[330px]"
          onClick={() => navigate("/patient/sessions")}
        >
          {/* Title */}
          <h2 className="text-xl font-semibold mb-5 text-gray-800 tracking-wide">
            Your Sessions
          </h2>

          {/* Calendar Container */}
          <div className="flex justify-center">
            <div className="scale-95">
              <Calendar
                value={value}
                onChange={setValue}
                tileContent={tileContent}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ------------------ REPORT SECTION ------------------ */}
    <div className="mt-10">
      <Report patientId={userId} doctorId={loggedUser?.assigned_doctor_id} />
    </div>
    </div>
  );
}

export default Dashboard;