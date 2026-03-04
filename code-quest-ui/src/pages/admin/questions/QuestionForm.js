import React, { useMemo, useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";

export default function QuestionForm({ lessons, onCreated }) {
  const lessonsArr = useMemo(() => Array.isArray(lessons) ? lessons : [], [lessons]);
  const quizOptions = useMemo(() => {
    const rows = [];
    lessonsArr.forEach((l) => {
      (l.quizzes || []).forEach((q) => {
        rows.push({ lessonId: l.id, lessonTitle: l.title, quizId: q.id, quizTitle: q.title });
      });
    });
    return rows;
  }, [lessonsArr]);

  const [quizId, setQuizId] = useState(quizOptions[0]?.quizId || "");
  const [text, setText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [damage, setDamage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!text.trim()) {
      setError("Question text is required");
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("All options (A, B, C, D) are required");
      return;
    }

    try {
      setSaving(true);
      await http.post(endpoints.adminQuestions, {
        quizId,
        text,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        damage: Number(damage),
      });
      setText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
      setDamage(10);
      setSuccess("Question created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create question");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 640, padding: "16px", backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e2e8f0" }}>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Create New Question</h3>
      
      {error && <div style={{ padding: 12, backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 4 }}>{error}</div>}
      {success && <div style={{ padding: 12, backgroundColor: "#dcfce7", color: "#166534", borderRadius: 4 }}>{success}</div>}

      <label style={labelStyle}>
        Quiz <span style={{ color: "#dc2626" }}>*</span>
        <select value={quizId} onChange={(e) => setQuizId(e.target.value)} required style={inputStyle}>
          <option value="" disabled>Select a quiz</option>
          {quizOptions.map((q) => (
            <option key={q.quizId} value={q.quizId}>
              {q.quizTitle} — {q.lessonTitle}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Question Text <span style={{ color: "#dc2626" }}>*</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} required style={textareaStyle} rows={3} placeholder="Enter the question..." />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label style={labelStyle}>
          Option A <span style={{ color: "#dc2626" }}>*</span>
          <input value={optionA} onChange={(e) => setOptionA(e.target.value)} required style={inputStyle} placeholder="Option A" />
        </label>
        <label style={labelStyle}>
          Option B <span style={{ color: "#dc2626" }}>*</span>
          <input value={optionB} onChange={(e) => setOptionB(e.target.value)} required style={inputStyle} placeholder="Option B" />
        </label>
        <label style={labelStyle}>
          Option C <span style={{ color: "#dc2626" }}>*</span>
          <input value={optionC} onChange={(e) => setOptionC(e.target.value)} required style={inputStyle} placeholder="Option C" />
        </label>
        <label style={labelStyle}>
          Option D <span style={{ color: "#dc2626" }}>*</span>
          <input value={optionD} onChange={(e) => setOptionD(e.target.value)} required style={inputStyle} placeholder="Option D" />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <label style={labelStyle}>
          Correct Answer <span style={{ color: "#dc2626" }}>*</span>
          <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} style={inputStyle}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>

        <label style={labelStyle}>
          Damage <span style={{ color: "#dc2626" }}>*</span>
          <input type="number" value={damage} onChange={(e) => setDamage(e.target.value)} min={1} required style={inputStyle} placeholder="Damage" />
        </label>
      </div>

      <button type="submit" disabled={saving || !quizId} style={buttonStyle}>
        {saving ? "Creating…" : "Create Question"}
      </button>
    </form>
  );
}

const labelStyle = {
  display: "grid",
  gap: 4,
  fontSize: 14,
  fontWeight: 500,
  color: "#1f2937",
};

const inputStyle = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 14,
  fontFamily: "inherit",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};

const buttonStyle = {
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 500,
  backgroundColor: "#667eea",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  transition: "background-color 0.2s",
};

