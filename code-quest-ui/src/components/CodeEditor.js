import React, { useState } from "react";
import { http } from "../api/http";
import TerminalOutput from "./TerminalOutput";
import styles from "../styles/codePanel.module.css";

export default function CodeEditor() {
  const [code, setCode] = useState("// Write C# code here\nusing System;\nclass Program { static void Main(){ Console.WriteLine(\"Hello CodeQuest\"); } }");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    try {
      setRunning(true);
      setError("");
      setOutput("");
      const res = await http.post("/api/code/execute", { code });
      const out = res?.output || res?.Output || "";
      setOutput(out);
    } catch (err) {
      setError(err.message || "Execution failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.editorWrap}>
        <textarea
          className={styles.textarea}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className={styles.actions}>
        <button className="btn btn-primary" onClick={run} disabled={running}>
          {running ? "Running…" : "Run"}
        </button>
      </div>
      <TerminalOutput text={output} error={error} />
    </div>
  );
}
