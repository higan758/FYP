import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import SplitLayout from "../../components/SplitLayout";
import LessonViewer from "../../components/LessonViewer";
import CodeEditor from "../../components/CodeEditor";
import styles from "../../styles/lessonDetail.module.css";

export default function LessonDetail() {
  const { lessonId } = useParams();
  const nav = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [quizId, setQuizId] = useState(null);

  useEffect(() => {
    async function load() {
      const lessonRes = await http.get(`${endpoints.lessons}/${lessonId}`);
      setLesson(lessonRes);

      if (lessonRes.quizzes && lessonRes.quizzes.length > 0) {
        setQuizId(lessonRes.quizzes[0].id);
      }
    }

    load();
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.levelBadge}>Level {lesson.levelNumber}</div>
          <h1 className={styles.title}>{lesson.title}</h1>
          <p className={styles.description}>{lesson.description}</p>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`btn btn-secondary ${styles.backBtn}`}
            onClick={() => nav("/lessons")}
          >
            Back to Lessons
          </button>
          <button
            className={`btn btn-primary ${styles.quizBtn}`}
            disabled={!quizId}
            onClick={() => nav(`/quiz/${quizId}`)}
          >
            <span className={styles.quizIcon}>🎯</span>
            Start Quiz
          </button>
        </div>
      </div>

      {/* Content area */}
      <SplitLayout
        left={
          <div className={styles.paneWrapper}>
            <div className={styles.paneHeader}>
              <span className={styles.paneIcon}>📄</span>
              <span className={styles.paneTitle}>Learning Material</span>
            </div>
            <LessonViewer lessonId={lessonId} />
          </div>
        }
        right={
          <div className={styles.paneWrapper}>
            <div className={styles.paneHeader}>
              <span className={styles.paneIcon}>💻</span>
              <span className={styles.paneTitle}>Code Playground</span>
            </div>
            <CodeEditor />
          </div>
        }
      />
    </div>
  );
}
