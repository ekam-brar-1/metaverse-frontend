import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // 🔁 Change this to your deployed URL if needed
const ROOM_ID = "table-room-1"; // Replace dynamically if you have multiple tables

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(`User-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    // Join a room on mount
    socket.emit("join-room", ROOM_ID);

    // Receive messages
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chat-message", {
        roomId: ROOM_ID,
        message: input,
        sender: username,
      });
      setInput("");
    }
  };

  return (
    <div className="chatbox p-4 border rounded-lg w-80 bg-white shadow-md">
      <div className="messages h-60 overflow-y-auto border-b pb-2">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm p-1">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
