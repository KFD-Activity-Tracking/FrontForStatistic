import { useEffect, useState } from "react"

function AddUserModal({ onClose, onCreated }) {
    const [username, setUsername] = useState('')
    const [realName, setRealName] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole]         = useState('USER')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!username.trim() || !password.trim()) {
            setError('Логин и пароль обязательны')
            return
        }
        setLoading(true)
        setError('')
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/users/add', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password, role }),
            })
            if (!res.ok) {
                const msg = await res.text()
                setError(msg || 'Ошибка при создании пользователя')
                setLoading(false)
                return
            }
            const created = await res.json()
            const trimmedName = realName.trim()
            if (trimmedName && trimmedName !== username.trim()) {
                await fetch('/api/users/update', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...created, realName: trimmedName }),
                })
            }
            onCreated()
        } catch {
            setError('Ошибка сети')
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">Новый пользователь</h3>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="modal-field">
                        <label>Логин</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            autoFocus
                        />
                    </div>
                    <div className="modal-field">
                        <label>ФИО</label>
                        <input
                            type="text"
                            value={realName}
                            onChange={e => setRealName(e.target.value)}
                            placeholder="Иван Иванов (необязательно)"
                        />
                    </div>
                    <div className="modal-field">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="modal-field">
                        <label>Роль</label>
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="USER">USER</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                    {error && <div className="modal-error">{error}</div>}
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Отмена
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function UsersPage({ onUser }) {
    const [users, setUsers]       = useState([])
    const [loading, setLoading]   = useState(true)
    const [showModal, setModal]   = useState(false)
    const [refreshKey, setRefresh] = useState(0)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch('/api/users/all', {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            const data = await response.json()
            setUsers(data)
            setLoading(false)
        }
        load()
    }, [refreshKey])

    return (
        <div className="page">
            <div className="page-header">
                <h2>Пользователи</h2>
                <button className="btn-primary" onClick={() => setModal(true)}>+ Добавить</button>
            </div>

            {loading && <div className="loading">Загрузка...</div>}

            <div className="users-list">
                {!loading && users.map(user => (
                    <div key={user.id} className="user-card" onClick={() => onUser(user)}>
                        <div>
                            <div className="user-name">{user.realName || user.username}</div>
                            <div className="user-login">@{user.username}</div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <AddUserModal
                    onClose={() => setModal(false)}
                    onCreated={() => { setModal(false); setRefresh(k => k + 1) }}
                />
            )}
        </div>
    )
}

export default UsersPage
