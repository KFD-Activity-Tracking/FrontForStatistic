import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './LoginPage'
import UsersPage from './UsersPage'
import UserStatsListPage from './UserStatsListPage'
import UserDetailPage from './UserDetailPage'

function Navbar({ page, onBack, onLogout, onToggleTheme, theme }) {
    const showBack = page === 'user-detail' || page === 'user-stats-list'
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <span className="navbar-brand">KFD Tracker</span>
                {showBack && <button className="btn-nav" onClick={onBack}>← Назад</button>}
            </div>
            <div className="navbar-right">
                {page !== 'login' && (
                    <button className="btn-nav btn-nav-logout" onClick={onLogout}>Выйти</button>
                )}
                <button className="theme-toggle" onClick={onToggleTheme} title="Сменить тему">
                    {theme === 'dark' ? '☀' : '☾'}
                </button>
            </div>
        </nav>
    )
}

function App() {
    const [page, setPage]         = useState('login')
    const [selectedUser, setUser] = useState(null)
    const [selectedStat, setStat] = useState(null)
    const [theme, setTheme]       = useState(() => localStorage.getItem('theme') || 'dark')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme  = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
    const handleLogout = () => { localStorage.removeItem('token'); setPage('login') }

    function handleBack() {
        if (page === 'user-detail')     setPage('user-stats-list')
        if (page === 'user-stats-list') setPage('users')
    }

    return (
        <>
            <Navbar
                page={page}
                onBack={handleBack}
                onLogout={handleLogout}
                onToggleTheme={toggleTheme}
                theme={theme}
            />
            <div className="app-root">
                {page === 'login' && (
                    <LoginPage onLogin={() => setPage('users')} />
                )}
                {page === 'users' && (
                    <UsersPage onUser={user => { setUser(user); setPage('user-stats-list') }} />
                )}
                {page === 'user-stats-list' && (
                    <UserStatsListPage
                        user={selectedUser}
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
