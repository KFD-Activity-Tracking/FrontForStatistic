import { useState, useEffect } from 'react'
import './App.css'
import logoUrl from './assets/logo.svg'
import LoginPage from './LoginPage'
import UsersPage from './UsersPage'
import UserStatsListPage from './UserStatsListPage'
import UserDetailPage from './UserDetailPage'

function Navbar({ page, onBack, onLogout, theme, onToggleTheme }) {
    const showBack = page === 'user-detail' || page === 'user-stats-list'
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logoUrl} alt="KFD" className="navbar-logo" />
                <span className="navbar-brand">KFD Tracker</span>
                {showBack && (
                    <button className="btn-secondary" onClick={onBack}>← Назад</button>
                )}
            </div>
            <div className="navbar-right">
                {page !== 'login' && (
                    <button className="btn-logout" onClick={onLogout}>Выйти</button>
                )}
                <button className="theme-toggle" onClick={onToggleTheme} title="Сменить тему">
                    {theme === 'dark' ? '☀' : '☾'}
                </button>
            </div>
        </nav>
    )
}

function App() {
    const [page, setPage]             = useState('login')
    const [selectedUser, setUser]     = useState(null)
    const [selectedStat, setStat]     = useState(null)
    const [theme, setTheme]           = useState(() => localStorage.getItem('theme') || 'dark')
    const [showArchived, setShowArchived] = useState(false)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        fetch('/api/users/all', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => { if (res.ok) setPage('users'); else localStorage.removeItem('token') })
            .catch(() => localStorage.removeItem('token'))
    }, [])

    const toggleTheme  = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
    const handleLogout = () => { localStorage.removeItem('token'); setPage('login') }

    function handleBack() {
        if (page === 'user-detail')     setPage('user-stats-list')
        if (page === 'user-stats-list') { setPage('users'); setShowArchived(false) }
    }

    return (
        <>
            <Navbar
                page={page}
                onBack={handleBack}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
            {page === 'user-stats-list' && (
                <div className="navbar-archive">
                    <button
                        className={`btn-secondary btn-archive ${showArchived ? 'btn-archive-active' : ''}`}
                        onClick={() => setShowArchived(v => !v)}
                    >
                        {showArchived ? '← Текущие' : '🗄 Архив'}
                    </button>
                </div>
            )}
            <div className="app-root">
                {page === 'login' && (
                    <LoginPage onLogin={() => setPage('users')} />
                )}
                {page === 'users' && (
                    <UsersPage onUser={user => { setUser(user); setShowArchived(false); setPage('user-stats-list') }} />
                )}
                {page === 'user-stats-list' && (
                    <UserStatsListPage
                        user={selectedUser}
                        showArchived={showArchived}
                        onSelectStat={stat => { setStat(stat); setPage('user-detail') }}
                    />
                )}
                {page === 'user-detail' && (
                    <UserDetailPage user={selectedUser} stat={selectedStat} />
                )}
            </div>
        </>
    )
}

export default App
