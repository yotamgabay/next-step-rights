import type { JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Chat } from './pages/Chat';
import { Detail } from './pages/Detail';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Rights } from './pages/Rights';
import { Signup } from './pages/Signup';
import { Wizard } from './wizard/Wizard';
import { WizardProvider } from './wizard/WizardContext';

export function App(): JSX.Element {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Wizard />
      </WizardProvider>
    </BrowserRouter>
  );
}
