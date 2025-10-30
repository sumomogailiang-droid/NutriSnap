import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/Navigation';
import { ToastContainer } from './components/common/Toast';
import { Home } from './pages/Home';
import { Camera } from './pages/Camera';
import { Analysis } from './pages/Analysis';
import { Stats } from './pages/Stats';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Pricing } from './pages/Pricing';
import { Subscription } from './pages/Subscription';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <main className="min-h-[calc(100vh-64px)]">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/camera" element={<Camera />} />
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/subscription" element={<Subscription />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <BottomNavigation />
                  <ToastContainer />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
