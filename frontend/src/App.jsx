import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import PostDetail from './pages/PostDetail';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <Home />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/feed" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <Feed />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/explore" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <Explore />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <Notifications />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <Profile />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <UserProfile />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/post/:postId" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <Navbar />
                <PostDetail />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
