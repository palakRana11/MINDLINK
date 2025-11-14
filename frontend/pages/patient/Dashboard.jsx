import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../src/context/UserContext";
import axios from "axios";

function Dashboard() {
  const { loggedUser } = useContext(UserContext);
  const userName = loggedUser?.name?.split(" ")[0] || "Friend";
  const userId = loggedUser?.id;

  const [mood, setMood] = useState(null);

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
      "You make today better just by being here!"
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
      "Your story isn’t over yet."
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
      "Let today soften your heart again."
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
      "Serenity surrounds you today."
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
      "Trust yourself—you will get through this."
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
      "You deserve kindness—from yourself too."
    ]
  };

  const [quote, setQuote] = useState("");

  // ----------------------------------------------------------
  // Fetch today's mood from backend
  // ----------------------------------------------------------
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/mood/today/${userId}`)
      .then((res) => {
        const moodToday = res.data.mood || "None";
        setMood(moodToday);

        // pick random quote from correct mood array
        const moodQuotes = quotes[moodToday] || quotes["None"];
        const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];

        setQuote(randomQuote);
      })
      .catch(() => {
        setMood("None");
        setQuote(quotes["None"][Math.floor(Math.random() * quotes["None"].length)]);
      });
  }, [userId]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 bg-green-50 rounded-2xl shadow-lg text-center">
      <h1 className="text-3xl font-bold text-green-700">Hi {userName}! 👋</h1>

      <p className="text-lg text-gray-700 mt-4 italic">
        {quote}
      </p>

      {mood === "None" && (
        <p className="mt-6 text-green-700 font-semibold">
          Don't forget to journal today, {userName}! 📝
        </p>
      )}
    </div>
  );
}

export default Dashboard;
