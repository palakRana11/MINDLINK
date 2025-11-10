import React, { useEffect, useState } from "react";

export default function ChatPage({ role }) {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle case where user is null
  if (!user) {
    return (
      <div className="text-center mt-20 text-red-600 font-semibold">
        ⚠️ User not logged in. Please log in again.
      </div>
    );
  }

  // Determine chat partner
  useEffect(() => {
    if (role === "patient" && user.assigned_doctor_id) {
      setReceiverId(user.assigned_doctor_id);
      setLoading(false);
    } else if (role === "doctor") {
      // ✅ Fetch doctor’s assigned patients
      fetch(`http://127.0.0.1:5000/doctor/${user.id}/patients`)
        .then((res) => res.json())
        .then((data) => {
          setPatients(data);
          const saved = localStorage.getItem("active_patient");
          if (saved) setReceiverId(saved);
        })
        .catch((err) => console.error("Error fetching patients:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [role, user]);

  // Fetch chat messages
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      try {
        const patientId = role === "patient" ? user.id : receiverId;
        const doctorId = role === "doctor" ? user.id : receiverId;

        const res = await fetch(
          `http://127.0.0.1:5000/chat/${patientId}/${doctorId}`
        );
        if (!res.ok) throw new Error("Failed to fetch chat");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Chat fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverId, role, user.id]);

  // ✅ Send message (Enter key + Button)
  const handleSend = async () => {
    if (!newMessage.trim() || !receiverId) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: receiverId,
          sender_role: role,
          message: newMessage,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewMessage("");
        setMessages((prev) => [
          ...prev,
          {
            sender_id: user.id,
            sender_role: role,
            message: newMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        alert(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading screen
  if (loading) return <p className="text-center mt-20">Loading chat...</p>;

  // ✅ Patient has no assigned doctor
  if (role === "patient" && !user.assigned_doctor_id) {
    return (
      <div className="text-center mt-20 text-gray-700">
        ⚠️ Please assign a doctor first before starting a chat.
      </div>
    );
  }

  // ✅ Doctor needs to select a patient first
  if (role === "doctor" && !receiverId) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h2 className="text-xl text-[#2f4f4f] mb-3">
          🩺 Select a patient to start chatting
        </h2>
        {patients.length > 0 ? (
          <select
            onChange={(e) => {
              localStorage.setItem("active_patient", e.target.value);
              setReceiverId(e.target.value);
            }}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">-- Choose Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500 text-sm">
            You have no assigned patients yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-[#fafaf9] rounded-2xl shadow-md border border-[#e5e1da] p-6">
      <h2 className="text-2xl font-semibold text-[#2f4f4f] text-center mb-6">
        💬 Chat with {role === "patient" ? "Your Doctor" : "Your Patient"}
      </h2>

      <div className="h-96 overflow-y-auto bg-[#fffefc] border border-[#e6e0d5] rounded-xl p-4 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center italic">
            No messages yet. Start the conversation 🌱
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${
                msg.sender_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  msg.sender_id === user.id
                    ? "bg-green-200 text-[#1a3d2f]"
                    : "bg-[#f3ede5] text-[#3b4b3b]"
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.split(" ")[1]}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center space-x-3">
        <input
          className="flex-1 border border-[#d4ccc2] rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-green-300"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown} // ✅ Press Enter to send
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
