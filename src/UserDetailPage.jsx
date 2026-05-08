import { useState, useEffect, useRef } from "react"
import HeatMap from "./HeatMap"

function parseUTC(dt) {
    if (!dt) return null
    const s = dt.includes('Z') || dt.includes('+') ? dt : dt + 'Z'
    return new Date(s)
}

function fmt(dt) {
    const d = parseUTC(dt)
    if (!d) return '—'
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dt) {
    const d = parseUTC(dt)
    if (!d) return '—'
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtDuration(seconds) {
    if (!seconds || seconds <= 0) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}ч ${m}м`
    if (m > 0) return `${m}м ${s}с`
    return `${s}с`
}

function fmtNum(n) {
    return (n == null || n === 0) ? '—' : n.toLocaleString('ru-RU')
}

function parseAiEval(text) {
    if (!text || text === 'no evaluation') return null
    // JSON format (current)
    try {
        if (text.trim().startsWith('{')) {
            const j = JSON.parse(text)
            return {
                isAnomalous:       j.is_anomalous       ?? null,
                fraudProb:         j.fraud_probability  ?? null,
                confidence:        j.confidence         ?? null,
                issues:            Array.isArray(j.issues) ? j.issues : [],
                analysis:          j.analysis           || null,
                recommendedAction: j.recommended_action || null,
                modelName:         j.model              || null,
            }
        }
    } catch (e) { void e }
    // Fallback: regex for old text format
    const anomalyMatch = text.match(/Anomalies?:\s*(true|false)/i)
    const fraudMatch   = text.match(/fraud probability:\s*([\d.]+)/i)
    const issuesMatch  = text.match(/Issues?:\s*(.+)/i)
    const modelMatch   = text.match(/Using\s+(.+?)\s+as model/i)
    return {
        isAnomalous:       anomalyMatch ? anomalyMatch[1].toLowerCase() === 'true' : null,
        fraudProb:         fraudMatch   ? parseFloat(fraudMatch[1]) : null,
        confidence:        null,
        issues:            issuesMatch  ? issuesMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [],
        analysis:          null,
        recommendedAction: null,
        modelName:         modelMatch   ? modelMatch[1] : null,
    }
}

const ACTION_LABELS = {
    none:  { label: 'Норма',           cls: 'ai-badge-ok'     },
    warn:  { label: 'Внимание',        cls: 'ai-badge-warn'   },
    flag:  { label: 'Требует проверки',cls: 'ai-badge-flag'   },
    block: { label: 'Заблокировать',   cls: 'ai-badge-danger' },
}

function AiEvalSection({ aiEval }) {
    const parsed = parseAiEval(aiEval)
    if (!parsed) return null

    const fraudPct = parsed.fraudProb != null ? Math.round(parsed.fraudProb * 100) : null
    const barColor = fraudPct == null ? 'var(--green)'
        : fraudPct >= 70 ? '#f85149'
        : fraudPct >= 40 ? '#e8a94a'
        : 'var(--green)'

    const actionInfo = parsed.recommendedAction ? ACTION_LABELS[parsed.recommendedAction] : null

    return (
        <div className="ai-section">
            <div className="section-title">AI-анализ</div>
            <div className="ai-badges">
                {parsed.isAnomalous != null && (
                    <span className={`ai-badge ${parsed.isAnomalous ? 'ai-badge-warn' : 'ai-badge-ok'}`}>
                        {parsed.isAnomalous ? '⚠ Аномалия' : '✓ Норма'}
                    </span>
                )}
                {actionInfo && parsed.recommendedAction !== 'none' && (
                    <span className={`ai-badge ${actionInfo.cls}`}>{actionInfo.label}</span>
                )}
                {parsed.modelName && parsed.modelName !== 'fallback-rules' && (
                    <span className="ai-model">{parsed.modelName}</span>
                )}
            </div>
            {parsed.analysis && (
                <div className="ai-analysis">{parsed.analysis}</div>
            )}
            {fraudPct != null && (
                <div className="ai-fraud-bar">
                    <div className="ai-fraud-label">
                        <span>Вероятность аномалии</span>
                        <span>{fraudPct}%</span>
                    </div>
                    <div className="ai-fraud-track">
                        <div className="ai-fraud-fill" style={{ width: `${fraudPct}%`, background: barColor }} />
                    </div>
                </div>
            )}
            {parsed.issues.length > 0 && (
                <div className="ai-issues">
                    <div className="ai-issues-label">Обнаружено:</div>
                    <ul>
                        {parsed.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                    </ul>
                </div>
            )}
        </div>
    )
}

function AppsSection({ apps }) {
    const [open, setOpen] = useState(false)
    if (!apps || apps.length === 0) return null
    return (
        <div className="apps-section">
            <button className="apps-toggle" onClick={() => setOpen(v => !v)}>
                <span className={`apps-toggle-chevron ${open ? 'open' : ''}`}>▾</span>
                Приложения
                <span className="apps-toggle-count">{apps.length}</span>
            </button>
            {open && apps.map(app => (
                <div key={app.id} className="app-row">
                    <span>{app.app_name}</span>
                    <span>{app.time_spent ?? `${app.number_of_exits} выходов`}</span>
                </div>
            ))}
        </div>
    )
}

function ResourceBar({ label, value }) {
    if (!value || value <= 0) return null
    const pct = Math.min(100, Math.round(value))
    const color = pct >= 80 ? '#f85149' : pct >= 60 ? '#e8a94a' : '#58a6ff'
    return (
        <div className="resource-row">
            <span className="resource-label">{label}</span>
            <div className="resource-track">
                <div className="resource-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="resource-value">{pct}%</span>
        </div>
    )
}

function SystemResourcesSection({ cpu, ram, gpu }) {
    if (!cpu && !ram && !gpu) return null
    return (
        <div className="resources-section">
            <div className="section-title">Системные ресурсы (среднее за сессию)</div>
            <ResourceBar label="CPU" value={cpu} />
            <ResourceBar label="RAM" value={ram} />
            <ResourceBar label="GPU" value={gpu} />
        </div>
    )
}

function ClicksChart({ data }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!data || data.length === 0 || !canvasRef.current) return
        const values = [...data].map(c => Math.max(0, c.charCodeAt(0) - 1))
        const max = Math.max(...values, 1)
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width, H = canvas.height
        ctx.clearRect(0, 0, W, H)
        const barW = W / values.length
        values.forEach((v, i) => {
            if (v === 0) return
            const h = Math.max(2, (v / max) * H)
            const alpha = 0.35 + 0.65 * (v / max)
            ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`
            ctx.fillRect(i * barW, H - h, Math.max(1, barW - 1), h)
        })
    }, [data])

    if (!data || data.length === 0) return null
    return <canvas ref={canvasRef} width={600} height={72} className="clicks-canvas" />
}

function UserDetailPage({ stat }) {
    return (
        <div className="page">
            <div className="page-header">
                <h2>Статистика · {fmtDate(stat.start_time)}</h2>
                <div className="stat-timerange">
                    {fmt(stat.start_time)} — {fmt(stat.end_time)}
                    <span className="stat-tz">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-metrics">
                    <div className="stat-metric">
                        <span className="stat-metric-value">{fmtDuration(stat.active_time)}</span>
                        <span className="stat-metric-label">Активное время</span>
                    </div>
                    <div className="stat-metric">
                        <span className="stat-metric-value">{fmtNum(stat.mouse_clicks)}</span>
                        <span className="stat-metric-label">Клики мышью</span>
                    </div>
                    <div className="stat-metric">
                        <span className="stat-metric-value">{fmtNum(stat.keyboard_clicks)}</span>
                        <span className="stat-metric-label">Нажатия клавиш</span>
                    </div>
                    <div className="stat-metric">
                        <span className="stat-metric-value">{fmtNum(stat.mouse_movement)}</span>
                        <span className="stat-metric-label">Движение мыши</span>
                    </div>
                    <div className="stat-metric">
                        <span className="stat-metric-value">{fmtDuration(stat.idle_time)}</span>
                        <span className="stat-metric-label">Неактивное время</span>
                    </div>
                    <div className="stat-metric">
                        <span className="stat-metric-value">{stat.keyboard_to_mouse_coef > 0 ? stat.keyboard_to_mouse_coef.toFixed(2) : '—'}</span>
                        <span className="stat-metric-label">Коэф. клав/мышь</span>
                    </div>
                    {stat.number_of_breaks > 0 && (
                        <div className="stat-metric">
                            <span className="stat-metric-value">{stat.number_of_breaks}</span>
                            <span className="stat-metric-label">Перерывы</span>
                        </div>
                    )}
                </div>

                <SystemResourcesSection
                    cpu={stat.average_cpu}
                    ram={stat.average_ram}
                    gpu={stat.average_gpu}
                />

                <AppsSection apps={stat.app_statistics} />

                {stat.clicks_over_time && stat.clicks_over_time.length > 0 && (
                    <div className="clicks-section">
                        <div className="section-title">Активность кликов по времени</div>
                        <ClicksChart data={stat.clicks_over_time} />
                    </div>
                )}

                <AiEvalSection aiEval={stat.ai_eval} />

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
