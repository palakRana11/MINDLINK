import React, { useState, useEffect } from "react";

function Journal() {
  const [entry, setEntry] = useState("");
  const [pastEntries, setPastEntries] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const patient_id = user?.id;

  // Fetch past journal entries
  useEffect(() => {
    if (patient_id) {
      fetch(`http://127.0.0.1:5000/journal/${patient_id}`)
        .then((res) => res.json())
        .then((data) => setPastEntries(data))
        .catch((err) => console.error(err));
    }
  }, [patient_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5000/journal/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id, entry }),
    });
    const data = await res.json();
    alert(data.message);
    setEntry("");
    window.location.reload(); // reload to show updated entries
  };

  // ✨ Dynamic placeholder messages
  const placeholderMessages = [
    "You haven’t written anything yet. Take a deep breath and start journaling 🌼",
    "Your story is waiting to be told — write your first journal today 🌙",
    "Begin your reflection — even a few words can lighten the heart 🌻",
    "No entries yet! Let your thoughts flow freely ✨",
    "Start your mindful journey — one thought at a time 🌿",
    "Every great story starts with a single word. Begin yours 💭",
    "It’s quiet here... maybe your first journal can change that 🌤️"
  ];
  const randomMessage =
    placeholderMessages[Math.floor(Math.random() * placeholderMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f1ee] to-[#e0f2e9] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-[#fdfbf9] shadow-xl rounded-3xl p-8 border border-[#e8e1d9]">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-[#2f4f4f] mb-2">
            🌱 Mindful Journal
          </h1>
          <p className="text-gray-600 text-sm">
            Reflect, express, and grow. Keep track of your emotional journey
            one day at a time.
          </p>
        </div>

        {/* Journal Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#faf6f2] p-5 rounded-2xl shadow-inner border border-[#e5ddd4]"
        >
          <textarea
            className="w-full p-3 border border-[#d6cdc4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bcd6c7] bg-[#fffefc] text-gray-700 resize-none"
            rows="5"
            placeholder="How was your day? Write your thoughts here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className="mt-4 w-full bg-[#bcd6c7] hover:bg-[#a5c5b2] text-[#1a3d2f] font-semibold py-2 rounded-lg transition-all"
          >
            Save Journal ✨
          </button>
        </form>

        {/* Past Entries */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-[#2f4f4f] mb-4">
            🌤️ Your Past 7 Days
          </h2>

          {pastEntries.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {pastEntries.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-[#f9f7f4] rounded-xl border border-[#e0d8cf] hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-[#3b4b3b] font-medium">
                      {new Date(item.date).toDateString()}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {item.entry}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center italic">{randomMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Journal;
