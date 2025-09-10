import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContextProvider } from './contexts/ThemeContext';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProblemsList from './components/ProblemsList';
import ProblemDetails from './components/ProblemDetails';
import ProblemDiscussion from './components/ProblemDiscussion';
import Contests from './components/Contests';
import Submissions from './components/Submissions';
import AdminPanel from './components/AdminPanel';
import Leaderboard from './components/Leaderboard';
import Layout from './components/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page wrapper with animations
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeContextProvider>
          <CssBaseline />
          <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            dense
            preventDuplicate
          >
            <Router>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={
                    <PageWrapper>
                      <HomePage />
                    </PageWrapper>
                  } />
                  <Route path="/login" element={
                    <PageWrapper>
                      <Login />
                    </PageWrapper>
                  } />
                  <Route path="/register" element={
                    <PageWrapper>
                      <Register />
                    </PageWrapper>
                  } />
                  
                  {/* Protected Routes with Layout */}
                  <Route path="/*" element={
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={
                          <PageWrapper>
                            <Dashboard />
                          </PageWrapper>
                        } />
                        <Route path="/problems" element={
                          <PageWrapper>
                            <ProblemsList />
                          </PageWrapper>
                        } />
                        <Route path="/problem/:id" element={
                          <PageWrapper>
                            <ProblemDetails />
                          </PageWrapper>
                        } />
                        <Route path="/problem/:id/discussion" element={
                          <PageWrapper>
                            <ProblemDiscussion />
                          </PageWrapper>
                        } />
                        <Route path="/contests" element={
                          <PageWrapper>
                            <Contests />
                          </PageWrapper>
                        } />
                        <Route path="/submissions" element={
                          <PageWrapper>
                            <Submissions />
                          </PageWrapper>
                        } />
                        <Route path="/admin" element={
                          <PageWrapper>
                            <AdminPanel />
                          </PageWrapper>
                        } />
                        <Route path="/leaderboard" element={
                          <PageWrapper>
                            <Leaderboard />
                          </PageWrapper>
                        } />
                      </Routes>
                    </Layout>
                  } />
                </Routes>
              </AnimatePresence>
            </Router>
          </SnackbarProvider>
        </ThemeContextProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
