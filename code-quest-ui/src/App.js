import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Navbar from "./components/Navbar";
import AiChatWidget from "./components/AiChatWidget";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lessons from "./pages/student/Lessons";
import LessonDetail from "./pages/student/LessonDetail";
import Quiz from "./pages/student/Quiz";
import ProgressPage from "./pages/student/ProgressPage";
import LeaderboardPage from "./pages/student/LeaderboardPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLessonsPage from "./pages/admin/lessons/AdminLessonsPage";
import AdminQuizzesPage from "./pages/admin/quizzes/AdminQuizzesPage";
import AdminQuestionsPage from "./pages/admin/questions/AdminQuestionsPage";
import Profile from "./pages/Profile";
import UsersPage from "./pages/admin/users/UsersPage";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "648187412343-bur0nqvsp0308c5dqfca4j1q5bdc5d8c.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <AiChatWidget />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lesson/:lessonId" element={<LessonDetail />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="lessons" element={<AdminLessonsPage />} />
                <Route path="quizzes" element={<AdminQuizzesPage />} />
                <Route path="questions" element={<AdminQuestionsPage />} />
              </Route>
            </Route>


          </Route>

          <Route path="*" element={<div style={{ padding: 16 }}>Not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
