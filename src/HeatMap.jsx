import { useEffect, useRef, useState } from "react"

const COLOR_STOPS = [
    { t: 0.00, r:   0, g:   0, b:   4 },
    { t: 0.30, r:  10, g:  15, b: 120 },
    { t: 0.58, r:  90, g:  20, b: 180 },
    { t: 0.80, r: 249, g: 142, b:   9 },
    { t: 1.00, r: 252, g: 255, b: 164 },
]

function thermalColor(t) {
    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        const a = COLOR_STOPS[i], b = COLOR_STOPS[i + 1]
        if (t <= b.t) {
            const s = (t - a.t) / (b.t - a.t)
            return [
                Math.round(a.r + s * (b.r - a.r)),
                Math.round(a.g + s * (b.g - a.g)),
                Math.round(a.b + s * (b.b - a.b)),
            ]
        }
    }
    return [255, 0, 0]
}

// W, H — размер выходного канваса в пикселях
// Блобы всегда круглые: радиус считается в пикселях одинаково по X и Y
function drawHeatMap(canvas, heatMap, gridW, W, H) {
    const gridH  = Math.floor(heatMap.length / gridW)
    const cellW  = W / gridW
    const cellH  = H / gridH
    // Радиус блоба — круговой, привязан к меньшей стороне ячейки
    const radius = Math.min(cellW, cellH) * 3.5
    const r      = Math.ceil(radius)

    const intensity = new Float32Array(W * H)

    for (let i = 0; i < heatMap.length; i++) {
        const v = heatMap.charCodeAt(i) / 255
        if (v === 0) continue
        const cx = Math.round((i % gridW) * cellW + cellW / 2)
        const cy = Math.round(Math.floor(i / gridW) * cellH + cellH / 2)

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const px = cx + dx
                const py = cy + dy
                if (px < 0 || px >= W || py < 0 || py >= H) continue
                // dist в пикселях — одинаково по обоим осям → круглые блобы
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist > radius) continue
                intensity[py * W + px] += v * (1 - dist / radius)
            }
        }
    }

    let maxVal = 0
    for (let i = 0; i < intensity.length; i++) {
        if (intensity[i] > maxVal) maxVal = intensity[i]
    }
    if (maxVal === 0) maxVal = 1

    canvas.width  = W
    canvas.height = H
    const ctx       = canvas.getContext('2d')
    const imageData = ctx.createImageData(W, H)
    const data      = imageData.data

    for (let i = 0; i < W * H; i++) {
        const t         = Math.min(1, intensity[i] / maxVal)
        const [r, g, b] = thermalColor(t)
        data[i * 4]     = r
        data[i * 4 + 1] = g
        data[i * 4 + 2] = b
        data[i * 4 + 3] = 255
    }

    ctx.putImageData(imageData, 0, 0)
}

function HeatMap({ heatMap, width }) {
    const canvasRef     = useRef(null)
    const fullCanvasRef = useRef(null)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        if (!heatMap || heatMap.length === 0) return
        const scale = 5
        drawHeatMap(canvasRef.current, heatMap, width, width * scale, Math.floor(heatMap.length / width) * scale)
    }, [heatMap, width])

    useEffect(() => {
        if (!expanded || !heatMap || heatMap.length === 0) return
        // Рисуем в точном разрешении экрана — заполняет весь экран без CSS-деформации
        drawHeatMap(fullCanvasRef.current, heatMap, width, window.screen.width, window.screen.height)
    }, [expanded, heatMap, width])

    useEffect(() => {
        if (!expanded) return
        const onKey = (e) => { if (e.key === 'Escape') setExpanded(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [expanded])

    if (!heatMap || heatMap.length === 0)
        return <div className="no-data">Нет данных тепловой карты</div>

    return (
        <>
            <canvas
                ref={canvasRef}
                onClick={() => setExpanded(true)}
                style={{ width: '100%', imageRendering: 'auto', cursor: 'zoom-in' }}
            />
            {expanded && (
                <div className="heatmap-overlay" onClick={() => setExpanded(false)}>
                    <canvas
                        ref={fullCanvasRef}
                        style={{ width: '100vw', height: '100vh', imageRendering: 'auto', display: 'block' }}
                    />
                </div>
            )}
        </>
    )
}

export default HeatMap
