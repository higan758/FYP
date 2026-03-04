import React, { useEffect, useState } from "react";
import styles from "./questionTable.module.css";

export default function QuestionModal({ open, mode, question, onSave, onCancel, isSaving, error }) {
  const [formData, setFormData] = useState({
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    damage: 10,
  });

  useEffect(() => {
    if (question && mode === "edit") {
      setFormData({
        text: question.text || "",
        optionA: question.optionA || "",
        optionB: question.optionB || "",
        optionC: question.optionC || "",
        optionD: question.optionD || "",
        correctAnswer: question.correctAnswer || "A",
        damage: question.damage || 10,
      });
    } else {
      setFormData({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        damage: 10,
      });
    }
  }, [question, mode, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {mode === "edit" ? "✏️ Edit Question" : "➕ Create Question"}
          </h3>
          <button className={styles.modalClose} onClick={onCancel} disabled={isSaving}>✕</button>
        </div>

        {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Question Text <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.formTextarea}
              value={formData.text}
              onChange={(e) => handleChange("text", e.target.value)}
              required
              rows={3}
              placeholder="Enter the question text"
            />
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Option A <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={formData.optionA}
                onChange={(e) => handleChange("optionA", e.target.value)}
                required
                placeholder="Option A"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Option B <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={formData.optionB}
                onChange={(e) => handleChange("optionB", e.target.value)}
                required
                placeholder="Option B"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Option C <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={formData.optionC}
                onChange={(e) => handleChange("optionC", e.target.value)}
                required
                placeholder="Option C"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Option D <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="text"
                value={formData.optionD}
                onChange={(e) => handleChange("optionD", e.target.value)}
                required
                placeholder="Option D"
              />
            </div>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Correct Answer <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.formInput}
                value={formData.correctAnswer}
                onChange={(e) => handleChange("correctAnswer", e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Damage <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="number"
                value={formData.damage}
                onChange={(e) => handleChange("damage", Number(e.target.value))}
                min={1}
                required
                placeholder="Damage value"
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
