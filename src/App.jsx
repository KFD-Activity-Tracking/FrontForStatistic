import { useState, useEffect } from 'react'
import './App.css'
import logoUrl from './assets/logo.svg'
import LoginPage from './LoginPage'
import UsersPage from './UsersPage'
import UserStatsListPage from './UserStatsListPage'
import UserDetailPage from './UserDetailPage'

function Navbar({ showBack, onBack, page, onLogout, theme, onToggleTheme }) {
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
    const [page, setPage]                   = useState('login')
    const [selectedUser, setUser]           = useState(null)
    const [selectedStat, setStat]           = useState(null)
    const [selectedManager, setManager]     = useState(null)
    const [managerStack, setManagerStack]   = useState([])
    const [theme, setTheme]                 = useState(() => localStorage.getItem('theme') || 'dark')
    const [showArchived, setShowArchived]   = useState(false)
    const [currentUser, setCurrentUser]     = useState(null)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        fetch('/api/users/owninfo', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.ok ? res.json() : null)
            .then(u => {
                if (!u) { localStorage.removeItem('token'); return }
                setCurrentUser(u)
                if (u.role === 'USER') { setUser(u); setPage('user-stats-list') }
                else setPage('users')
            })
            .catch(() => localStorage.removeItem('token'))
    }, [])

    const toggleTheme  = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
    const handleLogout = () => {
        localStorage.removeItem('token')
        setCurrentUser(null)
        setManagerStack([])
        setPage('login')
    }

    const handleLogin = async () => {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/users/owninfo', { headers: { 'Authorization': 'Bearer ' + token } })
            .catch(() => null)
        if (res?.ok) {
            const u = await res.json()
            setCurrentUser(u)
            if (u.role === 'USER') { setUser(u); setPage('user-stats-list') }
            else setPage('users')
        } else {
            setPage('users')
        }
    }

    const openManager = (manager) => {
        if (page === 'manager-users') setManagerStack(s => [...s, selectedManager])
        setManager(manager)
        setPage('manager-users')
    }

    const handleSelectUser = (user) => {
        if (user.role === 'MANAGER') {
            openManager(user)
        } else {
            setUser(user)
            setShowArchived(false)
            setPage('user-stats-list')
        }
    }

    function handleBack() {
        if (page === 'user-detail') {
            setPage('user-stats-list')
        } else if (page === 'user-stats-list') {
            setShowArchived(false)
            if (currentUser?.role === 'ADMIN' || managerStack.length > 0) {
                setPage('manager-users')
            } else {
                setPage('users')
            }
        } else if (page === 'manager-users') {
            if (managerStack.length > 0) {
                const prev = managerStack[managerStack.length - 1]
                setManager(prev)
                setManagerStack(s => s.slice(0, -1))
            } else {
                setManager(null)
                setPage('users')
            }
        }
    }

    const showBack = page === 'user-detail'
        || page === 'manager-users'
        || (page === 'user-stats-list' && currentUser?.role !== 'USER')

    return (
        <>
            <Navbar
                showBack={showBack}
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
                    <LoginPage onLogin={handleLogin} />
                )}
                {page === 'users' && (
                    <UsersPage
                        currentUser={currentUser}
                        onUser={user => {
                            if (currentUser?.role === 'ADMIN') openManager(user)
                            else handleSelectUser(user)
                        }}
                    />
                )}
                {page === 'manager-users' && (
                    <UsersPage
                        currentUser={currentUser}
                        manager={selectedManager}
                        onUser={handleSelectUser}
                    />
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
