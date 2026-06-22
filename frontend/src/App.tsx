import { useEffect, type JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Chat } from './pages/Chat';
import { CompleteProfile } from './pages/CompleteProfile';
import { Detail } from './pages/Detail';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Rights } from './pages/Rights';
import { Signup } from './pages/Signup';
import { Wizard } from './wizard/Wizard';
import { WizardProvider } from './wizard/WizardContext';

function GlobalAuthGuard({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (session && profile) {
      // If missing critical data and not already on complete-profile
      if ((!profile.age || !profile.amputation_type) && location.pathname !== '/complete-profile') {
        navigate('/complete-profile', { replace: true });
      }
    }
  }, [session, profile, loading, location.pathname, navigate]);

  return <>{children}</>;
}

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalAuthGuard>
          <WizardProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/rights" element={<Rights />} />
              <Route path="/rights/:id" element={<Detail />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Wizard />
        </WizardProvider>
        </GlobalAuthGuard>
      </AuthProvider>
    </BrowserRouter>
  );
}
