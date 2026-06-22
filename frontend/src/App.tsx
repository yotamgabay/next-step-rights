import { useEffect, useRef, type JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Chat } from './pages/Chat';
import { Detail } from './pages/Detail';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Rights } from './pages/Rights';
import { Signup } from './pages/Signup';
import { Tracker } from './pages/Tracker';
import { Wizard } from './wizard/Wizard';
import { useWizard, WizardProvider } from './wizard/WizardContext';

/**
 * Opens the personalization wizard (the onboarding) once per session when a
 * logged-in user has not completed it yet. `amputation_type` is the persisted
 * "completed" marker, written by the wizard on finish.
 */
function OnboardingGate(): null {
  const { session, profile, loading } = useAuth();
  const { open, completed, start } = useWizard();
  const prompted = useRef(false);

  useEffect(() => {
    if (loading || !session) return;
    const needsOnboarding = !profile || !profile.amputation_type;
    if (needsOnboarding && !open && !completed && !prompted.current) {
      prompted.current = true;
      start();
    }
  }, [loading, session, profile, open, completed, start]);

  return null;
}

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WizardProvider>
          <OnboardingGate />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/rights" element={<Rights />} />
              <Route path="/rights/:id" element={<Detail />} />
              <Route path="/tracker" element={<Tracker />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Onboarding moved into the wizard modal; keep the old path harmless. */}
            <Route path="/complete-profile" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Wizard />
        </WizardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
