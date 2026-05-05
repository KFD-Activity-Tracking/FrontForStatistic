import { useEffect, useState } from "react"
import HeatMap from "./HeatMap"

function UserDetailPage({ userId, onBack }) {
    const [statistics, setStatistics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStatistics() {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/statistics/from/${userId}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            const data = await response.json()
            setStatistics(data)
            setLoading(false)
        }
        loadStatistics()
    }, [userId])

    return (
        <div className="page">
            <div className="page-header">
                <button className="btn-secondary" onClick={onBack}>← Назад</button>
                <h2>Статистика пользователя</h2>
            </div>

            {loading && <div className="loading">Загрузка...</div>}

            {!loading && statistics.length === 0 && (
                <div className="empty">Нет данных статистики</div>
            )}

            {!loading && statistics.map(stat => (
                <div key={stat.id} className="stat-card">
                    <div className="stat-row"><span>Начало:</span><span>{stat.start_time}</span></div>
                    <div className="stat-row"><span>Конец:</span><span>{stat.end_time}</span></div>
                    <div className="stat-row"><span>Активное время:</span><span>{stat.active_time}</span></div>
                    <div className="stat-row"><span>Неактивное время:</span><span>{stat.idle_time}</span></div>
                    <div className="stat-row"><span>Клики мышью:</span><span>{stat.mouse_clicks}</span></div>
                    <div className="stat-row"><span>Нажатия клавиш:</span><span>{stat.keyboard_clicks}</span></div>
                    <div className="stat-row"><span>Движения мышью:</span><span>{stat.mouse_movement}</span></div>
                    <div className="stat-row"><span>Соотношение клав/мышь:</span><span>{stat.keyboard_to_mouse_coef?.toFixed(2)}</span></div>

                    {stat.app_statistics && stat.app_statistics.length > 0 && (
                        <div className="apps-section">
                            <div className="section-title">Приложения</div>
                            {stat.app_statistics.map(app => (
                                <div key={app.id} className="app-row">
                                    <span>{app.app_name}</span>
                                    <span>{app.time_spent}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="heatmap-section">
                        <div className="section-title">Тепловая карта кликов</div>
                        <HeatMap heatMap={stat.heat_map} width={stat.heat_map_width || 100} />
                        <div className="heatmap-legend">
                            <span>Низкая</span>
                            <div className="heatmap-legend-bar" />
                            <span>Высокая активность</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default UserDetailPage