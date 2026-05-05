import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './LoginPage'
import UsersPage from './UsersPage'
import UserDetailPage from './UserDetailPage'

function App() {
  const [page, setPage]     = useState("login")
  const [userId, setUserId] = useState(null)
  const [theme, setTheme]   = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="app-root">
      {page !== 'login' && (
        <button className="theme-toggle" onClick={toggleTheme} title="Сменить тему">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      )}

      {page === 'login'       && <LoginPage onLogin={() => setPage('users')} onToggleTheme={toggleTheme} theme={theme} />}
      {page === 'users'       && <UsersPage
        onUser={(id) => { setUserId(id); setPage('user-detail') }}
        onLogout={() => { localStorage.removeItem('token'); setPage('login') }}
      />}
      {page === 'user-detail' && <UserDetailPage userId={userId} onBack={() => setPage('users')} />}
    </div>
  )
}

export default App
