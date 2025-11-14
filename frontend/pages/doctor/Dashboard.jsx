import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorName = user?.name?.split(" ")[0] || "Doctor";
  const doctorId = user?.id;
  const specialization = user?.specialization || "psychology";

  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [articles, setArticles] = useState([]);
  const [quote, setQuote] = useState("");

  const doctorQuotes = [
  "The mind is everything. What you think you become. Every thought you nurture shapes your reality, influences your actions, and ultimately defines the person you grow into over time.",
  "Mental health is just as important as physical health. Taking care of your emotions, processing your feelings, and seeking support when needed is essential for living a balanced and fulfilling life.",
  "Healing takes time, and asking for help is a courageous step. No matter how small the progress, acknowledging your struggles and allowing yourself to recover is a vital part of personal growth.",
  "What we achieve inwardly will change outer reality. By cultivating self-awareness, resilience, and a positive mindset, we can transform our external circumstances in ways we never imagined possible.",
  "Every person has the potential to heal. Even after immense pain or setbacks, with patience, support, and self-compassion, anyone can rebuild their strength and thrive in life.",
  "Understanding yourself is the beginning of all wisdom. When you explore your thoughts, emotions, and motivations deeply, you gain clarity that guides better choices and authentic living.",
  "Talk to someone, don't bottle it up. Sharing your worries, fears, or dreams with a trusted friend, mentor, or therapist allows you to lighten your emotional load and find perspective.",
  "The only journey is the journey within. External achievements are fleeting, but the exploration of your inner world brings lasting insight, peace, and a deeper connection with yourself.",
  "Your emotions are valid. Every feeling you experience, whether joy, sadness, anger, or fear, has a purpose and deserves acknowledgment without judgment or suppression.",
  "Recovery is not linear, and that's okay. There will be highs and lows, steps forward and back, but persistence, self-care, and hope will eventually guide you to lasting healing.",
  "Happiness is a skill you can learn. By practicing gratitude, mindfulness, and positive thinking, you can cultivate joy and contentment regardless of external circumstances.",
  "Listening is often more important than speaking. When you truly hear and understand others, you foster connection, empathy, and trust that can transform relationships and communities.",
  "Self-compassion is key to growth. Treating yourself with kindness during failure or struggle allows you to learn from experiences without self-criticism, building resilience and confidence.",
  "Even the darkest night will end and the sun will rise. No matter how overwhelming challenges feel, hope and renewal are always possible if you remain patient and persistent.",
  "Empathy is the bridge to understanding. By putting yourself in others’ shoes, you gain insight into their struggles and perspectives, fostering stronger bonds and a more compassionate world.",
  "Awareness is the first step to change. By recognizing your thoughts, habits, and patterns, you equip yourself to make conscious choices and transform your life in meaningful ways.",
  "Small steps every day lead to progress. Incremental effort, repeated consistently over time, can accomplish what seems impossible at first and build habits that last a lifetime.",
  "Psychology teaches us the power of perspective. Understanding human behavior, emotions, and cognition allows us to interpret situations wisely, respond effectively, and relate better to others.",
  "You are stronger than you think. In moments of doubt or struggle, remember that your past achievements, resilience, and capacity for growth prove that you can overcome challenges.",
  "Your mental health matters, always. Prioritizing self-care, seeking help when needed, and nurturing your emotional well-being is essential for leading a balanced, purposeful, and happy life."
];

  useEffect(() => {
    setQuote(doctorQuotes[Math.floor(Math.random() * doctorQuotes.length)]);
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    fetch(`http://127.0.0.1:5000/sessions/doctor/${doctorId}`)
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, [doctorId]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `https://newsapi.org/v2/everything?q=${specialization}&pageSize=5&apiKey=8b80d43ce61e4ecb98622c980494e4ad`
        );
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error(err);
        setArticles([]);
      }
    };
    fetchArticles();
  }, [specialization]);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const tileContent = ({ date }) => {
  const dateStr = formatDate(date);
  const dateSessions = sessions.filter((s) => s.date === dateStr);

  if (dateSessions.length === 0) return null;

  const tooltipText = dateSessions
    .map(
      (s) =>
        `${s.patient_name} • ${s.time} • ${
          s.status.charAt(0).toUpperCase() + s.status.slice(1)
        }`
    )
    .join("\n");

  return (
    <div className="flex justify-center items-center mt-1" title={tooltipText}>
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    </div>
  );
};


  return (
    <div className="max-w-6xl mx-auto mt-12 p-6 space-y-8">
      {/* ------------------ TOP: Hi Dr + Quote ------------------ */}
      <div className="p-8 bg-gradient-to-b from-green-100 to-green-50 rounded-3xl shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold mb-4">Hi Dr. {doctorName}! 👋</h1>
        <p className="text-2xl italic text-gray-700">{quote}</p>
      </div>

      {/* ------------------ MAIN CONTENT: Calendar + Articles ------------------ */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch">
        {/* LEFT: Calendar */}
        <div
          className="flex-1 bg-white p-6 rounded-2xl shadow-lg cursor-pointer flex justify-center"
          style={{ minHeight: "600px" }} // same height as articles container
          onClick={() => navigate("/doctor/sessions")}
        >
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">
              Your Scheduled Sessions
            </h2>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              tileContent={tileContent}
            />
          </div>
        </div>

        {/* RIGHT: Articles */}
        <div
          className="flex-1 p-6 bg-white rounded-2xl shadow-lg"
          style={{ minHeight: "600px" }} // match height
        >
          <h2 className="text-xl font-semibold mb-4">
            📰 Top Articles for {specialization}
          </h2>
          <div className="space-y-4">
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={
                      article.urlToImage ||
                      "https://via.placeholder.com/80x60?text=No+Image"
                    }
                    alt={article.title}
                    className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <span className="text-gray-700 font-medium">{article.title}</span>
                </a>
              ))
            ) : (
              <p className="text-gray-500 italic">No articles available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
