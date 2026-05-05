import { useEffect, useRef, useState } from "react"

// Thermal color map: dark navy → blue → yellow → red (no green/cyan)
const COLOR_STOPS = [
    { t: 0.00, r:   0, g:   0, b:  60 },
    { t: 0.40, r:   0, g:  30, b: 255 },
    { t: 0.70, r: 255, g: 200, b:   0 },
    { t: 1.00, r: 255, g:   0, b:   0 },
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

function drawHeatMap(canvas, heatMap, width) {
    const height = Math.floor(heatMap.length / width)
    const scale  = 5
    const W      = width  * scale
    const H      = height * scale
    const radius = scale * 3.5

    // Accumulate Gaussian-like intensity for each hot cell
    const intensity = new Float32Array(W * H)

    for (let i = 0; i < heatMap.length; i++) {
        const v = heatMap.charCodeAt(i) / 255
        if (v === 0) continue
        const cx = (i % width) * scale + (scale >> 1)
        const cy = Math.floor(i / width) * scale + (scale >> 1)
        const r  = Math.ceil(radius)

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const px = cx + dx
                const py = cy + dy
                if (px < 0 || px >= W || py < 0 || py >= H) continue
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist > radius) continue
                // Linear falloff from center
                intensity[py * W + px] += v * (1 - dist / radius)
            }
        }
    }

    // Find max for normalization
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
        const t        = Math.min(1, intensity[i] / maxVal)
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
        drawHeatMap(canvasRef.current, heatMap, width)
    }, [heatMap, width])

    useEffect(() => {
        if (!expanded || !heatMap || heatMap.length === 0) return
        drawHeatMap(fullCanvasRef.current, heatMap, width)
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
