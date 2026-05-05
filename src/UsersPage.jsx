import { useEffect, useState } from "react"

function UserPage({ onUser, onLogout }) {
    const [users, setUsers] = useState([])
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
            <div className="page-header">
                <h2>Пользователи</h2>
                <button className="btn-secondary" onClick={onLogout}>Выйти</button>
            </div>

            {loading && <div className="loading">Загрузка...</div>}

            <div className="users-list">
                {!loading && users.map(user => (
                    <div key={user.id} className="user-card" onClick={() => onUser(user.id)}>
                        <div className="user-name">{user.realName || user.username}</div>
                        <div className="user-login">@{user.username}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserPage