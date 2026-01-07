import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!msg.trim()) return;

    try {
      console.log("Sending:", msg);

      const res = await axios.post("http://localhost:3000/api/chat", {
        message: msg,
      });

      setChat((prev) => [
        ...prev,
        { user: msg, bot: res.data.reply },
      ]);

      setMsg("");
    } catch (error) {
      console.error("Chat error:", error);
      alert("Server not responding");
    }
  };


  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={styles.fab}
      >
        🗨️
      </button>

      {/* Chat Window */}
      {open && (
        <div style={styles.chatbox}>
          <div style={styles.header}>
            Car Assistant
            <span onClick={() => setOpen(false)} style={styles.close}>✖</span>
          </div>

          <div style={styles.messages}>
            {chat.map((c, i) => (
              <div key={i}>
                <p><b>You:</b> {c.user}</p>
                <p><b>Bot:</b> {c.bot}</p>
              </div>
            ))}
          </div>

          <div style={styles.inputArea}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about cars..."
              style={styles.input}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    borderRadius: "50%",
    width: "65px",        // ⬆️ bigger
    height: "65px",
    fontSize: "30px",     // ⬆️ bigger icon
    backgroundColor: "#111", // 🔥 dark
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    zIndex: 9999,
  },

  chatbox: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "320px",
    height: "420px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    zIndex: 9999,
  },
  header: {
    padding: "10px",
    background: "#111",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
  },
  close: {
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
  },
  inputArea: {
    display: "flex",
    padding: "10px",
    gap: "5px",
  },
  input: {
    flex: 1,
  },
};
