import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ChallengesPage from './pages/ChallengesPage'
import SolutionsPage from './pages/SolutionsPage'
import TechleadPage from './pages/TechleadPage'
import TimerPage from './pages/TimerPage'
import CredentialsPage from './pages/CredentialsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="solutions" element={<SolutionsPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
            <Route path="techlead" element={<TechleadPage />} />
            <Route path="timer" element={<TimerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
