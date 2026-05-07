import { useEffect, useState } from "react"
import ActivityCalendar from "./ActivityCalendar"

function fmt(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

function isAnomalous(stat) {
    if (!stat.ai_eval || stat.ai_eval === 'no evaluation') return false
    try {
        if (stat.ai_eval.trim().startsWith('{'))
            return JSON.parse(stat.ai_eval).is_anomalous === true
    } catch (e) { void e }
    return /anomalies?:\s*true/i.test(stat.ai_eval)
}

const STATUS_LABEL = { ACTIVE: '● активна', COMPLETED: 'завершена', INTERRUPTED: 'прервана' }
const STATUS_CLASS = { ACTIVE: 'status-active', COMPLETED: 'status-done', INTERRUPTED: 'status-interrupted' }

function UserStatsListPage({ user, onSelectStat }) {
    const [statistics, setStatistics] = useState([])
    const [loading, setLoading]       = useState(true)
    const [updatedAt, setUpdatedAt]   = useState(null)
    const [showArchived, setShowArchived] = useState(false)

    useEffect(() => {
        setLoading(true)
        setStatistics([])

        async function load() {
            const token = localStorage.getItem('token')
            const res   = await fetch(`/api/statistics/from/${user.id}?archived=${showArchived}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            const data = await res.json()
            setStatistics([...data].sort((a, b) => (b.start_time > a.start_time ? 1 : -1)))
            setUpdatedAt(new Date())
            setLoading(false)
        }

        load()
        if (showArchived) return
        const id = setInterval(load, 30_000)
        return () => clearInterval(id)
    }, [user.id, showArchived])

    return (
        <div className="page">
            <div className="page-header">
                <h2>{user.realName || user.username}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {updatedAt && !showArchived && (
                        <span className="updated-at">
                            Обновлено: {updatedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        className={`btn-secondary ${showArchived ? 'btn-archive-active' : ''}`}
                        onClick={() => setShowArchived(v => !v)}
                    >
                        {showArchived ? '← Текущие' : '🗄 Архив'}
                    </button>
                </div>
            </div>

            {!loading && !showArchived && (
                <div className="cal-wrapper">
                    <div className="section-title" style={{ marginBottom: 12 }}>Активность за год</div>
                    <ActivityCalendar stats={statistics} />
                </div>
            )}

            {loading && <div className="loading">Загрузка...</div>}

            {!loading && statistics.length === 0 && (
                <div className="empty">
                    {showArchived ? 'Архив пуст' : 'Нет данных статистики'}
                </div>
            )}

            {!loading && statistics.length > 0 && (
                <div className="stats-list">
                    {statistics.map(stat => (
                        <div key={stat.id} className={`stat-list-card${showArchived ? ' stat-list-card-archived' : ''}`} onClick={() => onSelectStat(stat)}>
                            <div className="stat-list-main">
                                <span className="stat-list-date">{fmtDate(stat.start_time)}</span>
                                <span className="stat-list-time">{fmt(stat.start_time)} — {fmt(stat.end_time)}</span>
                            </div>
                            <div className="stat-list-meta">
                                <span>Клики: <b>{stat.mouse_clicks ?? '—'}</b></span>
                                <span>Клавиши: <b>{stat.keyboard_clicks ?? '—'}</b></span>
                                <span>Движение: <b>{stat.mouse_movement ?? '—'}</b></span>
                                {stat.status && (
                                    <span className={`session-status ${STATUS_CLASS[stat.status] ?? ''}`}>
                                        {STATUS_LABEL[stat.status] ?? stat.status}
                                    </span>
                                )}
                                {stat.status !== 'ACTIVE' && (isAnomalous(stat)
                                    ? <span className="stat-anomaly">⚠ аномалия</span>
                                    : <span className="stat-ok">✓ норма</span>
                                )}
                            </div>
                            <span className="stat-list-arrow">→</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserStatsListPage
