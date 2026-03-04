import React, { useState, useRef, useEffect } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import styles from "./aiChatWidget.module.css";

export default function AiChatWidget({ lessonTitle }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("aiChat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("aiChat", JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    console.log("[AiChatWidget] Sending message:", trimmed);
    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body = { 
        message: trimmed + (lessonTitle ? `\nContext: Current lesson - ${lessonTitle}` : "") 
      };
      console.log("[AiChatWidget] Request body:", body);
      console.log("[AiChatWidget] Endpoint:", endpoints.aiChat);
      
      const res = await http.post(endpoints.aiChat, body);
      console.log("[AiChatWidget] Response received:", res);
      
      if (!res || !res.reply) {
        throw new Error("Invalid response format from API - missing 'reply' field");
      }
      
      const aiReply = res.reply;
      console.log("[AiChatWidget] AI reply:", aiReply);
      setMessages((prev) => [...prev, { role: "ai", content: aiReply }]);
    } catch (err) {
      console.error("[AiChatWidget] Error:", err);
      console.error("[AiChatWidget] Error status:", err.status);
      console.error("[AiChatWidget] Error data:", err.data);
      
      const errorMsg = err.message || err.data?.error || "Failed to get response";
      console.log("[AiChatWidget] Showing error:", errorMsg);
      setMessages((prev) => [...prev, { role: "ai", content: "❌ Error: " + errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("aiChat");
  };

  return (
    <>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span>CodeQuest AI Tutor</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                👋 Hi! I'm your CodeQuest AI Tutor. Ask me anything about C# or programming!
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? styles.userMsg : styles.aiMsg}>
                {m.content}
              </div>
            ))}
            <div ref={scrollRef}></div>
          </div>
          <div className={styles.inputArea}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              className={styles.textarea}
              rows={1}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={styles.sendBtn}
            >
              {loading ? "..." : "Send"}
            </button>
            <button onClick={clearChat} className={styles.clearBtn}>
              Clear
            </button>
          </div>
        </div>
      )}
      <button className={styles.floatingBtn} onClick={() => setOpen((o) => !o)}>
        💬
      </button>
    </>
  );
}