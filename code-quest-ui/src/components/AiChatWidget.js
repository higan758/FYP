import React, { useState, useRef, useEffect } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import styles from "./aiChatWidget.module.css";

// Helper to format message content with code blocks
function formatMessage(content) {
  const parts = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```|`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }

    // Add code block (multiline or inline)
    if (match[2]) {
      parts.push({ type: "code", language: match[1] || "text", content: match[2].trim() });
    } else if (match[3]) {
      parts.push({ type: "inline-code", content: match[3] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content }];
}

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
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <span>CodeQuest AI Tutor</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                👋 Hi! I'm your CodeQuest AI Tutor. Ask me anything about C# or programming!
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? styles.userBubble : styles.aiBubble}>
                {formatMessage(m.content).map((part, i) => {
                  if (part.type === "code") {
                    return (
                      <pre key={i} className={styles.codeBlock}>
                        <code>{part.content}</code>
                      </pre>
                    );
                  } else if (part.type === "inline-code") {
                    return (
                      <code key={i} className={styles.inlineCode}>
                        {part.content}
                      </code>
                    );
                  } else {
                    return (
                      <span key={i} style={{ whiteSpace: "pre-wrap" }}>
                        {part.content}
                      </span>
                    );
                  }
                })}
              </div>
            ))}
            <div ref={scrollRef}></div>
          </div>

          <div className={styles.chatInputArea}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              className={styles.inputField}
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