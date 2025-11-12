import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../src/context/UserContext";

const positiveQuotes = [
  "Keep going, you’re doing great! 🌟",
  "Every step counts, stay positive! 💪",
  "You are stronger than you think! 💚",
  "Believe in yourself, always! ✨",
  "Small progress is still progress! 🌱",
];

const Chatbot = () => {
  const { loggedUser } = useContext(UserContext);
  const userName = loggedUser?.name?.split(" ")[0] || "Friend";

  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "bot",
      text: `${positiveQuotes[Math.floor(Math.random() * positiveQuotes.length)]} Hi ${userName}, I’m MindBuddy! How are you feeling today? 💬`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "user", text: userInput };
    setChatHistory([...chatHistory, newMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/gemini", {
        prompt: userInput,
        name: userName,
      });

      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: response.data.response },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "😔 Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 flex flex-col h-full bg-gradient-to-b from-green-50 to-white rounded-3xl shadow-2xl border border-green-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
        MindBuddy 🧠💚
      </h2>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50 rounded-2xl shadow-inner border border-green-100">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] px-5 py-3 break-words ${
              msg.sender === "user"
                ? "ml-auto bg-green-100 text-green-900 rounded-tr-2xl rounded-bl-2xl"
                : "mr-auto bg-white text-gray-900 rounded-tl-2xl rounded-br-2xl shadow-sm"
            }`}
            style={{ animation: msg.sender === "bot" ? "fadeIn 0.3s" : "none" }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 italic">MindBuddy is typing... 💭</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex mt-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-grow border rounded-l-2xl px-4 py-3 focus:outline-green-500 focus:ring-2 focus:ring-green-300"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-6 py-3 rounded-r-2xl hover:bg-green-700 transition-colors font-semibold"
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
