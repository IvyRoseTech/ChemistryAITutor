import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import TopicMasteryPage from './pages/TopicMasteryPage';
import QuizPage from './pages/QuizPage';
import InsightsPage from './pages/InsightsPage';
import ChatPage from './pages/ChatPage';
import PastPapersPage from './pages/PastPapersPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Onboarding/Welcome */}
          <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/topics" element={<TopicMasteryPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/past-papers" element={<PastPapersPage />} />
          </Route>

          {/* Catch all - redirect to dashboard if logged in, else home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
