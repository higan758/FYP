import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import styles from "../styles/lessonViewer.module.css";

export default function LessonViewer({ lessonId }) {
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState(""); // "pdf", "ppt", or ""
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError("");
        setLoading(true);
        const res = await http.get(`/api/lessons/${lessonId}/ppt`);
        let u = res?.url || res?.Url || "";

        if (!u) {
          if (mounted) {
            setUrl("");
            setFileType("");
          }
          return;
        }

        const apiBase = (process.env.REACT_APP_API_BASE_URL?.trim() || "http://localhost:5143");
        if (u && !/^https?:\/\//i.test(u)) {
          u = `${apiBase}${u.startsWith("/") ? u : `/${u}`}`;
        }

        const lower = (u || "").toLowerCase();
        if (lower.endsWith(".pdf")) {
          if (mounted) { setUrl(u); setFileType("pdf"); }
        } else if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
          // Use Microsoft Office Online viewer for PPT/PPTX
          const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(u)}`;
          if (mounted) { setUrl(viewerUrl); setFileType("ppt"); }
        } else {
          // Try rendering as iframe for other formats
          if (mounted) { setUrl(u); setFileType("other"); }
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load lesson material");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [lessonId]);

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loadingPanel}>Loading material...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <div className={styles.errorPanel}>
          <span>⚠️</span> {error}
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderContent}>
            <span className={styles.placeholderIcon}>📚</span>
            <span>No learning resource uploaded yet.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <iframe
        title="Lesson Material"
        src={url}
        className={styles.iframe}
        allowFullScreen
      />
    </div>
  );
}
