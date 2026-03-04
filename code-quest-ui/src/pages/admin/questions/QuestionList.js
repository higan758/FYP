import React, { useCallback, useEffect, useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import QuestionTable from "./QuestionTable";
import QuestionModal from "./QuestionModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import styles from "./questionTable.module.css";

export default function QuestionList({ lessons }) {
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Build quiz options from lessons
  const quizOptions = [];
  (lessons || []).forEach((l) => {
    (l.quizzes || []).forEach((q) => {
      quizOptions.push({ id: q.id, title: q.title, lessonTitle: l.title });
    });
  });

  // Load questions for selected quiz
  const loadQuestions = useCallback(async () => {
    if (!selectedQuizId) {
      setQuestions([]);
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await http.get(endpoints.adminQuestionsByQuiz(selectedQuizId));
      setQuestions(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Edit handler
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setModalMode("edit");
    setModalOpen(true);
    setSaveError("");
  };

  // Delete handler (open modal)
  const handleDelete = (question) => {
    setDeletingQuestion(question);
    setDeleteOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;

    try {
      setIsDeleting(true);
      await http.delete(endpoints.adminQuestionById(deletingQuestion.id));
      setSuccess("Question deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setDeleteOpen(false);
      setDeletingQuestion(null);
      await loadQuestions();
    } catch (err) {
      setError(err.message || "Failed to delete question");
    } finally {
      setIsDeleting(false);
    }
  };

  // Save question (create or update)
  const handleSaveQuestion = async (formData) => {
    try {
      setSaveError("");
      setIsSaving(true);

      if (modalMode === "create") {
        await http.post(endpoints.adminQuestions, {
          quizId: selectedQuizId,
          ...formData,
          damage: Number(formData.damage),
        });
        setSuccess("Question created successfully!");
      } else {
        await http.put(endpoints.adminQuestionById(editingQuestion.id), {
          ...formData,
          damage: Number(formData.damage),
        });
        setSuccess("Question updated successfully!");
      }

      setTimeout(() => setSuccess(""), 3000);
      setModalOpen(false);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (err) {
      setSaveError(err.message || "Failed to save question");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.listWrap}>
      {/* Quiz Selector */}
      <div className={styles.selectorCard}>
        <label className={styles.selectorLabel}>
          🎯 Select Quiz <span className={styles.required}>*</span>
        </label>
        <select
          className={styles.selectorSelect}
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
        >
          <option value="">-- Choose a quiz to manage its questions --</option>
          {quizOptions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title} ({q.lessonTitle})
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}
      {success && <div className={styles.successBanner}>✅ {success}</div>}

      {/* Create button (only show when quiz selected) */}
      {selectedQuizId && (
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingQuestion(null);
            setModalMode("create");
            setModalOpen(true);
            setSaveError("");
          }}
        >
          ➕ Create New Question
        </button>
      )}

      {/* Questions Table */}
      {selectedQuizId ? (
        <QuestionTable
          questions={questions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          error={error && error !== "" ? null : undefined}
        />
      ) : (
        <div className={styles.promptState}>
          <span className={styles.promptIcon}>👆</span>
          <p className={styles.promptText}>Select a quiz above to view and manage its questions</p>
        </div>
      )}

      {/* Edit/Create Modal */}
      <QuestionModal
        open={modalOpen}
        mode={modalMode}
        question={editingQuestion}
        onSave={handleSaveQuestion}
        onCancel={() => {
          setModalOpen(false);
          setEditingQuestion(null);
          setSaveError("");
        }}
        isSaving={isSaving}
        error={saveError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        questionText={deletingQuestion?.text}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setDeletingQuestion(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}

