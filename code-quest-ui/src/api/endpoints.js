export const endpoints = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  googleLogin: "/api/auth/google",
  lessons: "/api/lessons",
  quizzes: "/api/quizzes",
  questions: "/api/questions",
  submitAttempt: "/api/attempts/submit",

  myProgress: "/api/progress/my",
  unlockedLessons: "/api/progress/unlocked",
  
  me: "/api/users/me",
  updateMe: "/api/users/me",

  leaderboardTop: "/api/leaderboard/top",

  resendVerification: "/api/auth/resend-verification",

  adminUsers: "/api/admin/users",
  adminUserDeactivate: (id) => `/api/admin/users/${id}/deactivate`,
  adminUserActivate: (id) => `/api/admin/users/${id}/activate`,
  adminUserDelete: (id) => `/api/admin/users/${id}`,
  adminLessons: "/api/admin/lessons",
  adminLessonById: (id) => `/api/admin/lessons/${id}`,
  adminLessonUploadResource: (id) => `/api/admin/lessons/${id}/upload-resource`,
  adminQuestions: "/api/admin/questions",
  adminQuestionsByQuiz: (quizId) => `/api/admin/questions?quizId=${quizId}`,
  adminQuestionById: (id) => `/api/admin/questions/${id}`,

  aiChat: "/api/ai/chat",
};