import { useState, useRef, useEffect } from "react"

const WEEKS = 52
const GAP   = 2
const DAY_LABEL_W = 28

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
const DAYS   = ['Пн','','Ср','','Пт','','']

function getLevel(value, max) {
    if (value === 0 || max === 0) return 0
    const ratio = value / max
    if (ratio < 0.15) return 1
    if (ratio < 0.40) return 2
    if (ratio < 0.70) return 3
    return 4
}

function ActivityCalendar({ stats }) {
    const [tooltip, setTooltip] = useState(null)
    const [cellSize, setCellSize] = useState(11)
    const wrapRef = useRef(null)

    useEffect(() => {
        if (!wrapRef.current) return
        const obs = new ResizeObserver(([entry]) => {
            const w = entry.contentRect.width
            const size = Math.max(8, Math.floor((w - DAY_LABEL_W - (WEEKS - 1) * GAP) / WEEKS))
            setCellSize(size)
        })
        obs.observe(wrapRef.current)
        return () => obs.disconnect()
    }, [])

    const activityMap = new Map()
    stats.forEach(s => {
        if (!s.start_time) return
        const day = s.start_time.slice(0, 10)
        activityMap.set(day, (activityMap.get(day) || 0) + (s.mouse_clicks || 0) + (s.keyboard_clicks || 0))
    })
    const maxActivity = Math.max(0, ...activityMap.values())

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(today)
    const dowToday = (today.getDay() + 6) % 7
    startDate.setDate(today.getDate() - dowToday - (WEEKS - 1) * 7)

    const weeks = []
    const monthLabels = []
    const cur = new Date(startDate)

    for (let w = 0; w < WEEKS; w++) {
        const cells = []
        for (let d = 0; d < 7; d++) {
            const dateStr = cur.toISOString().slice(0, 10)
            const activity = activityMap.get(dateStr) || 0
            const isFuture = cur > today
            cells.push({ dateStr, activity, level: isFuture ? -1 : getLevel(activity, maxActivity) })
            cur.setDate(cur.getDate() + 1)
        }
        const weekStart = new Date(cur)
        weekStart.setDate(weekStart.getDate() - 7)
        const prevDay = new Date(weekStart)
        prevDay.setDate(prevDay.getDate() - 1)
        const isMonthStart = weekStart.getMonth() !== prevDay.getMonth()
        monthLabels.push(isMonthStart ? MONTHS[weekStart.getMonth()] : '')
        weeks.push(cells)
    }

    const cs = { width: cellSize, height: cellSize }

    return (
        <div className="activity-calendar" ref={wrapRef}>
            <div style={{ display: 'flex', marginLeft: DAY_LABEL_W, gap: GAP, marginBottom: 4 }}>
                {monthLabels.map((m, i) => (
                    <div key={i} style={{ width: cellSize + GAP, flexShrink: 0, fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'visible' }}>
                        {m}
                    </div>
                ))}
            </div>
            <div className="cal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, width: DAY_LABEL_W - 4, marginRight: 4, flexShrink: 0 }}>
                    {DAYS.map((d, i) => (
                        <div key={i} style={{ height: cellSize, lineHeight: `${cellSize}px`, fontSize: 9, color: 'var(--text-dim)', textAlign: 'right' }}>
                            {d}
                        </div>
                    ))}
                </div>
                <div className="cal-grid">
                    {weeks.map((cells, wi) => (
                        <div key={wi} className="cal-week">
                            {cells.map((cell, di) => (
                                <div
                                    key={di}
                                    className={`cal-cell ${cell.level < 0 ? 'cal-future' : `cal-level-${cell.level}`}`}
                                    style={cs}
                                    onMouseEnter={e => setTooltip({ ...cell, x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="cal-legend" style={{ marginLeft: DAY_LABEL_W }}>
                <span>Меньше</span>
                {[0,1,2,3,4].map(l => <div key={l} className={`cal-cell cal-level-${l}`} style={cs} />)}
                <span>Больше</span>
            </div>
            {tooltip && tooltip.level >= 0 && (
                <div className="cal-tooltip" style={{ left: tooltip.x + 10, top: tooltip.y - 36 }}>
                    {tooltip.dateStr} — {tooltip.activity > 0 ? `${tooltip.activity} действий` : 'нет активности'}
                </div>
            )}
        </div>
    )
}

export default ActivityCalendar
