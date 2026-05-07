import { useState } from "react"

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

    const activityMap = new Map()
    stats.forEach(s => {
        if (!s.start_time) return
        const day = s.start_time.slice(0, 10)
        activityMap.set(day, (activityMap.get(day) || 0) + (s.mouse_clicks || 0) + (s.keyboard_clicks || 0))
    })

    const maxActivity = Math.max(0, ...activityMap.values())

    // Build 52-week grid anchored to today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Find Monday of the week 51 weeks ago
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 363)
    const dow = (startDate.getDay() + 6) % 7  // 0=Mon
    startDate.setDate(startDate.getDate() - dow)

    const weeks = []
    let monthLabels = []
    const cur = new Date(startDate)

    for (let w = 0; w < 52; w++) {
        const cells = []
        for (let d = 0; d < 7; d++) {
            const dateStr = cur.toISOString().slice(0, 10)
            const activity = activityMap.get(dateStr) || 0
            const level = getLevel(activity, maxActivity)
            const isFuture = cur > today
            cells.push({ dateStr, activity, level: isFuture ? -1 : level })
            cur.setDate(cur.getDate() + 1)
        }
        // Month label: show when month changes at start of week
        const weekStart = new Date(cur)
        weekStart.setDate(weekStart.getDate() - 7)
        const prevWeek = new Date(weekStart)
        prevWeek.setDate(prevWeek.getDate() - 1)
        monthLabels.push(
            weekStart.getMonth() !== prevWeek.getMonth()
                ? MONTHS[weekStart.getMonth()]
                : ''
        )
        weeks.push(cells)
    }

    return (
        <div className="activity-calendar">
            <div className="cal-month-row">
                {monthLabels.map((m, i) => (
                    <div key={i} className="cal-month-label">{m}</div>
                ))}
            </div>
            <div className="cal-body">
                <div className="cal-day-labels">
                    {DAYS.map((d, i) => <div key={i} className="cal-day-label">{d}</div>)}
                </div>
                <div className="cal-grid">
                    {weeks.map((cells, wi) => (
                        <div key={wi} className="cal-week">
                            {cells.map((cell, di) => (
                                <div
                                    key={di}
                                    className={`cal-cell ${cell.level < 0 ? 'cal-future' : `cal-level-${cell.level}`}`}
                                    onMouseEnter={e => setTooltip({ ...cell, x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="cal-legend">
                <span>Меньше</span>
                {[0,1,2,3,4].map(l => <div key={l} className={`cal-cell cal-level-${l}`} />)}
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
