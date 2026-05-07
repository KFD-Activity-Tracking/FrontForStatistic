import HeatMap from "./HeatMap"

const ROLE_LABEL = { USER: 'Сотрудник', MANAGER: 'Менеджер', ADMIN: 'Администратор' }

function fmt(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

function UserDetailPage({ user, stat }) {
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
                    <span className="user-meta-sep">·</span>
                    <span className="user-meta-item">{fmt(stat.start_time)}</span>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-row"><span>Начало</span><span>{fmt(stat.start_time)}</span></div>
                <div className="stat-row"><span>Конец</span><span>{fmt(stat.end_time)}</span></div>
                <div className="stat-row"><span>Активное время</span><span>{stat.active_time}</span></div>
                <div className="stat-row"><span>Неактивное время</span><span>{stat.idle_time}</span></div>
                <div className="stat-row"><span>Клики мышью</span><span>{stat.mouse_clicks}</span></div>
                <div className="stat-row"><span>Нажатия клавиш</span><span>{stat.keyboard_clicks}</span></div>
                <div className="stat-row"><span>Движение мыши</span><span>{stat.mouse_movement}</span></div>
                <div className="stat-row"><span>Коэф. клав/мышь</span><span>{stat.keyboard_to_mouse_coef?.toFixed(2)}</span></div>

                {stat.app_statistics && stat.app_statistics.length > 0 && (
                    <div className="apps-section">
                        <div className="section-title">Приложения</div>
                        {stat.app_statistics.map(app => (
                            <div key={app.id} className="app-row">
                                <span>{app.app_name}</span>
                                <span>{app.number_of_exits} выходов</span>
                            </div>
                        ))}
                    </div>
                )}

                {stat.ai_eval && stat.ai_eval !== 'no evaluation' && (
                    <div className="apps-section">
                        <div className="section-title">AI-анализ</div>
                        <div className="ai-eval-text">{stat.ai_eval}</div>
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
        </div>
    )
}

export default UserDetailPage
