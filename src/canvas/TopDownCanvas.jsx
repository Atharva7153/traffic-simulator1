/**
 * TopDownCanvas.jsx — 2D top-down HTML canvas rendering of the traffic junction.
 * Satisfies the official competition requirement for an HTML canvas-based view.
 * Consumes the same shared simulation state as the 3D view.
 *
 * Draws: roads, lane markings, stop lines, zebra crossings, signal indicators,
 *        direction labels, and placeholder vehicle positions.
 */
import { useRef, useEffect, useCallback } from 'react'
import { useSimulation } from '../simulation/useSimulation'

// Layout constants (canvas logical units)
const ROAD_W = 60      // road width in px
const ARM_LEN = 160    // road arm length
const JUNCTION = ROAD_W // junction box size
const HALF_J = JUNCTION / 2
const HALF_R = ROAD_W / 2

// Colors
const C = {
  bg:        '#0f1520',
  asphalt:   '#23262e',
  marking:   '#d4d4c8',
  markDim:   'rgba(212,212,200,0.35)',
  zebra:     'rgba(212,212,200,0.55)',
  curb:      '#4b5563',
  sidewalk:  '#1e222d',
  red:       '#ef4444',
  amber:     '#f59e0b',
  green:     '#22c55e',
  labelText: '#06b6d4',
  info:      'rgba(100,116,139,0.7)',
}

// Placeholder vehicle positions (same layout as 3D scene, scaled)
const DEMO_VEHICLES = [
  // North approach (heading south, so y < 0)
  { x: 12, y: -(HALF_J + 35), w: 8, h: 18, color: '#3b82f6', rot: 0 },
  { x: 12, y: -(HALF_J + 60), w: 9, h: 20, color: '#f8fafc', rot: 0 },
  { x: 12, y: -(HALF_J + 85), w: 7, h: 14, color: '#15803d', rot: 0 },
  { x: -12, y: -(HALF_J + 45), w: 8, h: 18, color: '#dc2626', rot: 0 },
  // South approach
  { x: -12, y: (HALF_J + 40), w: 8, h: 18, color: '#6b21a8', rot: Math.PI },
  { x: -12, y: (HALF_J + 65), w: 7, h: 14, color: '#15803d', rot: Math.PI },
  { x: 12, y: (HALF_J + 50), w: 9, h: 20, color: '#0f766e', rot: Math.PI },
  // East approach
  { x: (HALF_J + 60), y: 12, w: 18, h: 38, color: '#b91c1c', rot: 0, isBus: true },
  { x: (HALF_J + 35), y: 12, w: 8, h: 18, color: '#ea580c', rot: 0 },
  { x: (HALF_J + 40), y: -12, w: 7, h: 14, color: '#15803d', rot: 0 },
  // West approach
  { x: -(HALF_J + 40), y: -12, w: 8, h: 18, color: '#374151', rot: 0 },
  { x: -(HALF_J + 65), y: -12, w: 8, h: 18, color: '#fbbf24', rot: 0 },
  { x: -(HALF_J + 48), y: 12, w: 9, h: 20, color: '#1e40af', rot: 0 },
]

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export default function TopDownCanvas() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const { signals } = useSimulation()
  const signalsRef = useRef(signals)

  useEffect(() => {
    signalsRef.current = signals
  }, [signals])

  const draw = useCallback((canvas, ctx) => {
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const cw = rect.width
    const ch = rect.height

    // Set canvas resolution
    canvas.width = cw * dpr
    canvas.height = ch * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, cw, ch)

    // Center origin
    const cx = cw / 2
    const cy = ch / 2
    // Scale to fit — the scene spans roughly ±(HALF_J + ARM_LEN)
    const sceneSpan = (HALF_J + ARM_LEN + 20) * 2
    const scale = Math.min(cw, ch) / sceneSpan
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(scale, scale)

    const sig = signalsRef.current

    // --- Sidewalk corners ---
    const cornerSize = ARM_LEN - 10
    ctx.fillStyle = C.sidewalk
    for (const [sx, sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
      drawRoundedRect(ctx, sx * (HALF_J + 2), sy * (HALF_J + 2),
        sx * cornerSize, sy * cornerSize, 0)
      ctx.fill()
    }

    // --- Road surfaces ---
    ctx.fillStyle = C.asphalt
    // North arm
    ctx.fillRect(-HALF_R, -(HALF_J + ARM_LEN), ROAD_W, ARM_LEN)
    // South arm
    ctx.fillRect(-HALF_R, HALF_J, ROAD_W, ARM_LEN)
    // East arm
    ctx.fillRect(HALF_J, -HALF_R, ARM_LEN, ROAD_W)
    // West arm
    ctx.fillRect(-(HALF_J + ARM_LEN), -HALF_R, ARM_LEN, ROAD_W)
    // Central junction
    ctx.fillRect(-HALF_J - 2, -HALF_J - 2, JUNCTION + 4, JUNCTION + 4)

    // --- Curbs ---
    ctx.strokeStyle = C.curb
    ctx.lineWidth = 2
    // NS curbs
    for (const xSign of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(xSign * HALF_R, -(HALF_J + ARM_LEN))
      ctx.lineTo(xSign * HALF_R, -HALF_J)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(xSign * HALF_R, HALF_J)
      ctx.lineTo(xSign * HALF_R, HALF_J + ARM_LEN)
      ctx.stroke()
    }
    // EW curbs
    for (const ySign of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(-(HALF_J + ARM_LEN), ySign * HALF_R)
      ctx.lineTo(-HALF_J, ySign * HALF_R)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(HALF_J, ySign * HALF_R)
      ctx.lineTo(HALF_J + ARM_LEN, ySign * HALF_R)
      ctx.stroke()
    }

    // --- Dashed center lines ---
    ctx.strokeStyle = C.marking
    ctx.lineWidth = 1.5
    ctx.setLineDash([8, 5])
    // NS
    for (const seg of [[0, -(HALF_J + ARM_LEN), 0, -HALF_J - 8], [0, HALF_J + 8, 0, HALF_J + ARM_LEN]]) {
      ctx.beginPath(); ctx.moveTo(seg[0], seg[1]); ctx.lineTo(seg[2], seg[3]); ctx.stroke()
    }
    // EW
    for (const seg of [[-(HALF_J + ARM_LEN), 0, -(HALF_J + 8), 0], [HALF_J + 8, 0, HALF_J + ARM_LEN, 0]]) {
      ctx.beginPath(); ctx.moveTo(seg[0], seg[1]); ctx.lineTo(seg[2], seg[3]); ctx.stroke()
    }
    ctx.setLineDash([])

    // --- Edge lines (dim) ---
    ctx.strokeStyle = C.markDim
    ctx.lineWidth = 0.8
    // NS edge lines
    for (const x of [-HALF_R + 3, HALF_R - 3]) {
      ctx.beginPath(); ctx.moveTo(x, -(HALF_J + ARM_LEN)); ctx.lineTo(x, -HALF_J); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, HALF_J); ctx.lineTo(x, HALF_J + ARM_LEN); ctx.stroke()
    }
    // EW edge lines
    for (const y of [-HALF_R + 3, HALF_R - 3]) {
      ctx.beginPath(); ctx.moveTo(-(HALF_J + ARM_LEN), y); ctx.lineTo(-HALF_J, y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(HALF_J, y); ctx.lineTo(HALF_J + ARM_LEN, y); ctx.stroke()
    }

    // --- Stop lines ---
    ctx.strokeStyle = C.marking
    ctx.lineWidth = 2.5
    const stopOff = HALF_J + 3
    // N stop line
    ctx.beginPath(); ctx.moveTo(-HALF_R + 3, -stopOff); ctx.lineTo(HALF_R - 3, -stopOff); ctx.stroke()
    // S stop line
    ctx.beginPath(); ctx.moveTo(-HALF_R + 3, stopOff); ctx.lineTo(HALF_R - 3, stopOff); ctx.stroke()
    // E stop line
    ctx.beginPath(); ctx.moveTo(stopOff, -HALF_R + 3); ctx.lineTo(stopOff, HALF_R - 3); ctx.stroke()
    // W stop line
    ctx.beginPath(); ctx.moveTo(-stopOff, -HALF_R + 3); ctx.lineTo(-stopOff, HALF_R - 3); ctx.stroke()

    // --- Zebra crossings ---
    ctx.fillStyle = C.zebra
    const zebraOff = HALF_J + 10
    const stripeW = 5
    const stripeCount = 6
    const spacing = (ROAD_W - 8) / stripeCount
    // N & S zebra
    for (const yDir of [-1, 1]) {
      for (let i = 0; i < stripeCount; i++) {
        const sx = -HALF_R + 4 + i * spacing
        ctx.fillRect(sx, yDir * zebraOff - stripeW / 2, spacing * 0.65, stripeW)
      }
    }
    // E & W zebra
    for (const xDir of [-1, 1]) {
      for (let i = 0; i < stripeCount; i++) {
        const sy = -HALF_R + 4 + i * spacing
        ctx.fillRect(xDir * zebraOff - stripeW / 2, sy, stripeW, spacing * 0.65)
      }
    }

    // --- Signal indicators ---
    const sigRadius = 5
    const sigOff = HALF_J + 4
    const drawSignal = (x, y, state) => {
      const col = state === 'green' ? C.green : state === 'amber' ? C.amber : C.red
      // Glow
      ctx.beginPath()
      ctx.arc(x, y, sigRadius + 4, 0, Math.PI * 2)
      ctx.globalAlpha = 0.25
      ctx.fillStyle = col
      ctx.fill()
      ctx.globalAlpha = 1.0
      // Dot
      ctx.beginPath()
      ctx.arc(x, y, sigRadius, 0, Math.PI * 2)
      ctx.fillStyle = col
      ctx.fill()
      // Border
      ctx.strokeStyle = '#ffffff22'
      ctx.lineWidth = 1
      ctx.stroke()
    }
    drawSignal(HALF_R + 5, -sigOff, sig.north)   // North signal (right side of road)
    drawSignal(-(HALF_R + 5), sigOff, sig.south)  // South signal
    drawSignal(sigOff, HALF_R + 5, sig.east)      // East signal
    drawSignal(-sigOff, -(HALF_R + 5), sig.west)  // West signal

    // --- Direction labels ---
    ctx.font = 'bold 14px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = C.labelText
    ctx.fillText('N', 0, -(HALF_J + ARM_LEN + 12))
    ctx.fillText('S', 0, HALF_J + ARM_LEN + 12)
    ctx.fillText('E', HALF_J + ARM_LEN + 12, 0)
    ctx.fillText('W', -(HALF_J + ARM_LEN + 12), 0)

    // --- Demo vehicles ---
    for (const v of DEMO_VEHICLES) {
      ctx.save()
      ctx.translate(v.x, v.y)
      if (v.rot) ctx.rotate(v.rot)
      ctx.fillStyle = v.color
      const hw = (v.isBus ? v.h : v.w) / 2
      const hh = (v.isBus ? v.w : v.h) / 2
      drawRoundedRect(ctx, -hw, -hh, hw * 2, hh * 2, 2)
      ctx.fill()
      // Windshield hint
      ctx.fillStyle = 'rgba(147,197,253,0.3)'
      ctx.fillRect(-hw + 1.5, -hh + 2, hw * 2 - 3, 3)
      ctx.restore()
    }

    // --- Info text ---
    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.fillStyle = C.info
    ctx.textAlign = 'left'
    const infoY = (HALF_J + ARM_LEN + 8)
    ctx.fillText('Phase 1 — Static demo layout. Vehicles are placeholders.', -(HALF_J + ARM_LEN), infoY + 20)

    ctx.restore()
  }, [])

  // Resize observer + animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')

    const redraw = () => {
      draw(canvas, ctx)
      animRef.current = requestAnimationFrame(redraw)
    }

    // ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    })
    resizeObserver.observe(container)

    animRef.current = requestAnimationFrame(redraw)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      resizeObserver.disconnect()
    }
  }, [draw])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  )
}
