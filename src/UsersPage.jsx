import { useEffect, useState } from "react"

const ROLE_LABEL = { USER: 'Сотрудник', MANAGER: 'Менеджер', ADMIN: 'Администратор' }

function UserPage({ onUser }) {
    const [users, setUsers]     = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUsers() {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch('/api/users/all', {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            const data = await response.json()
            setUsers(data)
            setLoading(false)
        }
        loadUsers()
    }, [])

    return (
        <div className="page">
            <div className="page-hero">
                <h1 className="page-hero-title">Пользователи</h1>
                <p className="page-hero-sub">Выберите сотрудника для просмотра статистики активности</p>
            </div>

            {loading && <div className="loading">Загрузка...</div>}

            <div className="users-list">
                {!loading && users.map(user => (
                    <div key={user.id} className="user-card" onClick={() => onUser(user)}>
                        <div className="user-brief">
                            <span className="user-login-brief">@{user.username}</span>
                            <span className={`user-role-badge role-${user.role?.toLowerCase()}`}>
                                {ROLE_LABEL[user.role] ?? user.role}
                            </span>
                        </div>
                        <span className="user-arrow">→</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserPage
