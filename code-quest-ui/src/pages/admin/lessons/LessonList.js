import React, { useMemo, useState, useRef } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import styles from "../../../styles/adminLessons.module.css";

export default function LessonList({ lessons, onDelete }) {
  const list = useMemo(() => Array.isArray(lessons) ? lessons : [], [lessons]);
  const [editLesson, setEditLesson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submitEdit(e) {
    e.preventDefault();
    if (!editLesson) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: editLesson.id,
      title: fd.get("title"),
      description: fd.get("description"),
      levelNumber: Number(fd.get("levelNumber") || editLesson.levelNumber || 1),
    };
    try {
      setErr("");
      setSaving(true);
      await http.put(endpoints.adminLessonById(editLesson.id), payload);
      setEditLesson(null);
      window.dispatchEvent(new CustomEvent("admin-lessons-updated"));
    } catch (ex) {
      setErr(ex.message || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  }

  if (list.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>📭</span>
        <p className={styles.emptyText}>No lessons yet. Create your first lesson above!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.cardGrid}>
        {list.map((l) => (
          <LessonCard key={l.id} l={l} onEdit={() => setEditLesson(l)} onDelete={onDelete} />
        ))}
      </div>

      {/* Edit Modal */}
      {editLesson && (
        <div className={styles.modalWrap} onClick={() => setEditLesson(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>✏️ Edit Lesson</h3>
              <button className={styles.modalClose} onClick={() => setEditLesson(null)}>✕</button>
            </div>
            <form onSubmit={submitEdit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input className={styles.input} name="title" defaultValue={editLesson.title || ""} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textareaField} name="description" defaultValue={editLesson.description || ""} rows={3} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Level Number</label>
                <input className={styles.input} name="levelNumber" type="number" min={1} defaultValue={editLesson.levelNumber || 1} required />
              </div>
              {err && <div className={styles.error}>⚠️ {err}</div>}
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditLesson(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function fileNameFromUrl(u) {
  try {
    const url = (u || "").toString();
    const parts = url.split("/");
    const last = parts[parts.length - 1];
    return last || "";
  } catch { return ""; }
}

function LessonCard({ l, onEdit, onDelete }) {
  const materialUrl = l.resourceFilePath || l.ResourceFilePath || l.pptUrl || l.PptUrl || l.materialUrl || l.MaterialUrl || "";
  const materialName = fileNameFromUrl(materialUrl);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const ext = materialName.split(".").pop()?.toLowerCase();
  const fileIcon = ext === "pdf" ? "📄" : (ext === "ppt" || ext === "pptx") ? "📊" : "📎";

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "ppt", "pptx"].includes(fileExt)) {
      setUploadErr("Only .pdf, .ppt, .pptx files allowed.");
      return;
    }

    setUploadErr("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await http.upload(endpoints.adminLessonUploadResource(l.id), formData);
      window.dispatchEvent(new CustomEvent("admin-lessons-updated"));
    } catch (ex) {
      setUploadErr(ex.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={styles.lessonCard}>
      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardLevel}>Level {l.levelNumber}</div>
        <div className={styles.cardQuizBadge}>
          {Array.isArray(l.quizzes) ? l.quizzes.length : 0} quiz{(Array.isArray(l.quizzes) ? l.quizzes.length : 0) !== 1 ? "zes" : ""}
        </div>
      </div>

      {/* Card body */}
      <h3 className={styles.cardTitle}>{l.title}</h3>
      <p className={styles.cardDesc}>{l.description}</p>

      {/* Material status */}
      <div className={styles.materialSection}>
        {materialName ? (
          <div className={styles.materialInfo}>
            <span>{fileIcon}</span>
            <span className={styles.materialName}>{materialName}</span>
          </div>
        ) : (
          <div className={styles.noMaterial}>No resource uploaded</div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <button className="btn btn-secondary btn-small" onClick={onEdit}>✏️ Edit</button>
        {onDelete && (
          <button className="btn btn-danger btn-small" onClick={() => onDelete(l.id)}>🗑️ Delete</button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className={`btn btn-small ${materialName ? "btn-secondary" : "btn-outline"}`}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "⏳ Uploading..." : materialName ? "🔄 Replace" : "📤 Upload PPT/PDF"}
        </button>
      </div>
      {uploadErr && <div className={styles.uploadError}>⚠️ {uploadErr}</div>}
    </div>
  );
}
