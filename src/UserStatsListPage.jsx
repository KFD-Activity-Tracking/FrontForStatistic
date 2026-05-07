import { useEffect, useState } from "react"
import ActivityCalendar from "./ActivityCalendar"

const ROLE_LABEL = { USER: 'Сотрудник', MANAGER: 'Менеджер', ADMIN: 'Администратор' }

function fmt(dt) {
    if (!dt) return '—'
    const d = new Date(dt)
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

function isAnomalous(stat) {
    if (!stat.ai_eval || stat.ai_eval === 'no evaluation') return false
    return stat.ai_eval.toLowerCase().includes('true')
}

function UserStatsListPage({ user, onSelectStat }) {
    const [statistics, setStatistics] = useState([])
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const token = localStorage.getItem('token')
            const res   = await fetch(`/api/statistics/from/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            const data = await res.json()
            setStatistics([...data].sort((a, b) => (b.start_time > a.start_time ? 1 : -1)))
            setLoading(false)
        }
        load()
    }, [user.id])

    return (
        <div className="page">
            <div className="page-hero">
                <h1 className="page-hero-title">{user.realName || user.username}</h1>
                <div className="user-meta">
                    <span className="user-meta-item">@{user.username}</span>
                    <span className="user-meta-sep">·</span>
                    <span className={`user-role-badge role-${user.role?.toLowerCase()}`}>
                        {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                </div>
            </div>

            {!loading && (
                <div className="cal-wrapper">
                    <div className="section-title" style={{ marginBottom: 12 }}>Активность за год</div>
                    <ActivityCalendar stats={statistics} />
                </div>
            )}

            {loading && <div className="loading">Загрузка...</div>}

            {!loading && statistics.length === 0 && (
                <div className="empty">Нет данных статистики</div>
            )}

            {!loading && statistics.length > 0 && (
                <div className="stats-list">
                    {statistics.map(stat => (
                        <div key={stat.id} className="stat-list-card" onClick={() => onSelectStat(stat)}>
                            <div className="stat-list-main">
                                <span className="stat-list-date">{fmtDate(stat.start_time)}</span>
                                <span className="stat-list-time">{fmt(stat.start_time)} — {fmt(stat.end_time)}</span>
                            </div>
                            <div className="stat-list-meta">
                                <span>Клики: <b>{stat.mouse_clicks ?? '—'}</b></span>
                                <span>Клавиши: <b>{stat.keyboard_clicks ?? '—'}</b></span>
                                <span>Движение: <b>{stat.mouse_movement ?? '—'}</b></span>
                                {isAnomalous(stat)
                                    ? <span className="stat-anomaly">⚠ аномалия</span>
                                    : <span className="stat-ok">✓ норма</span>
                                }
                            </div>
                            <span className="user-arrow">→</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserStatsListPage
