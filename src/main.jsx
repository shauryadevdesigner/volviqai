import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import SignUp from './pages/SignUp.tsx';
import SignIn from './pages/SignIn.tsx';
import Onboarding from './pages/Onboarding.tsx';
import RequireAuth from './components/auth/RequireAuth.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
