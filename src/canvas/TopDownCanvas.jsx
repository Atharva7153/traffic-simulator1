/**
 * TopDownCanvas.jsx — 2D top-down HTML canvas rendering of the traffic junction.
 * Satisfies the official competition requirement for an HTML canvas-based view.
 * Consumes the same shared simulation state as the 3D view.
 *
 * Draws: roads, lane markings, stop lines, zebra crossings, signal indicators,
 *        direction labels, and vehicles from the shared simulation model.
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
const PALETTES = {
  day: { bg: '#e5efe8', asphalt: '#3b4245', marking: '#fafaf6', markDim: 'rgba(250,250,246,0.42)', zebra: 'rgba(250,250,246,0.72)', curb: '#b7c2bc', sidewalk: '#d4ded7', red: '#dc2626', amber: '#d97706', green: '#16a34a', labelText: '#0f766e', info: 'rgba(46,67,72,0.8)' },
  sunset: { bg: '#f2e4d4', asphalt: '#484342', marking: '#fffaf0', markDim: 'rgba(255,250,240,0.4)', zebra: 'rgba(255,250,240,0.68)', curb: '#c7b4a0', sidewalk: '#e5d3bf', red: '#dc2626', amber: '#c66a08', green: '#15803d', labelText: '#a64b2a', info: 'rgba(75,58,48,0.8)' },
  night: { bg: '#17232c', asphalt: '#303b42', marking: '#dce5e8', markDim: 'rgba(220,229,232,0.32)', zebra: 'rgba(220,229,232,0.52)', curb: '#53636c', sidewalk: '#29363e', red: '#fb5555', amber: '#f6ba49', green: '#4ade80', labelText: '#67e8f9', info: 'rgba(203,213,225,0.72)' },
}

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
  const { signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode } = useSimulation()
  const signalsRef = useRef(signals)
  const vehiclesRef = useRef(vehicles)
  const runningRef = useRef(isRunning)
  const crossingsRef = useRef(railwayCrossings)
  const crossingStateRef = useRef(crossingState)
  const environmentRef = useRef(environmentMode)

  useEffect(() => {
    signalsRef.current = signals
  }, [signals])

  useEffect(() => {
    vehiclesRef.current = vehicles
    runningRef.current = isRunning
  }, [vehicles, isRunning])

  useEffect(() => {
    crossingsRef.current = railwayCrossings
    crossingStateRef.current = crossingState
    environmentRef.current = environmentMode
  }, [railwayCrossings, crossingState, environmentMode])

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
    ctx.fillStyle = colors.bg
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
    const colors = PALETTES[environmentRef.current] || PALETTES.day

    // --- Sidewalk corners ---
    const cornerSize = ARM_LEN - 10
    ctx.fillStyle = colors.sidewalk
    for (const [sx, sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
      drawRoundedRect(ctx, sx * (HALF_J + 2), sy * (HALF_J + 2),
        sx * cornerSize, sy * cornerSize, 0)
      ctx.fill()
    }

    // --- Road surfaces ---
    ctx.fillStyle = colors.asphalt
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
    ctx.strokeStyle = colors.curb
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
    ctx.strokeStyle = colors.marking
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
    ctx.strokeStyle = colors.markDim
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
    ctx.strokeStyle = colors.marking
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
    ctx.fillStyle = colors.zebra
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
      const col = state === 'green' ? colors.green : state === 'amber' ? colors.amber : colors.red
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

    // --- Optional railway crossings ---
    const railColors = { open: colors.green, warning: colors.amber, closed: colors.red }
    for (const crossing of crossingsRef.current) {
      const position = crossing.direction === 'north' ? [0, -23] : crossing.direction === 'south' ? [0, 23]
        : crossing.direction === 'east' ? [23, 0] : [-23, 0]
      const x = position[0] * 5
      const y = position[1] * 5
      const vertical = crossing.direction === 'north' || crossing.direction === 'south'
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 2
      if (vertical) {
        for (const offset of [-4, 4]) { ctx.beginPath(); ctx.moveTo(x - HALF_R, y + offset); ctx.lineTo(x + HALF_R, y + offset); ctx.stroke() }
      } else {
        for (const offset of [-4, 4]) { ctx.beginPath(); ctx.moveTo(x + offset, y - HALF_R); ctx.lineTo(x + offset, y + HALF_R); ctx.stroke() }
      }
      ctx.strokeStyle = railColors[crossingStateRef.current] || colors.green
      ctx.lineWidth = 3
      if (vertical) {
        for (const offset of [-8, 8]) { ctx.beginPath(); ctx.moveTo(x - HALF_R + 3, y + offset); ctx.lineTo(x + HALF_R - 3, y + offset); ctx.stroke() }
      } else {
        for (const offset of [-8, 8]) { ctx.beginPath(); ctx.moveTo(x + offset, y - HALF_R + 3); ctx.lineTo(x + offset, y + HALF_R - 3); ctx.stroke() }
      }
    }
    // --- Direction labels ---
    ctx.font = 'bold 14px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = colors.labelText
    ctx.fillText('N', 0, -(HALF_J + ARM_LEN + 12))
    ctx.fillText('S', 0, HALF_J + ARM_LEN + 12)
    ctx.fillText('E', HALF_J + ARM_LEN + 12, 0)
    ctx.fillText('W', -(HALF_J + ARM_LEN + 12), 0)

    // --- Vehicles from the shared model (world units scaled to canvas units) ---
    for (const v of vehiclesRef.current) {
      const vertical = v.direction === 'north' || v.direction === 'south'
      const w = (vertical ? v.width : v.length) * 5
      const h = (vertical ? v.length : v.width) * 5
      const x = v.x * 5
      const y = v.z * 5
      ctx.save()
      ctx.translate(x, y)
      ctx.fillStyle = v.color
      drawRoundedRect(ctx, -w / 2, -h / 2, w, h, Math.min(3, w / 4))
      ctx.fill()
      if (v.type === 'ambulance') {
        ctx.strokeStyle = '#dc2626'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(-w / 2, -h / 2 + h * 0.42, w, Math.max(2, h * 0.1))
      }
      // Small highlight toward the leading end of the vehicle.
      ctx.fillStyle = 'rgba(147,197,253,0.3)'
      if (v.direction === 'north') ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, Math.max(2, h * 0.16))
      else if (v.direction === 'south') ctx.fillRect(-w / 2 + 2, h / 2 - Math.max(2, h * 0.16) - 2, w - 4, Math.max(2, h * 0.16))
      else if (v.direction === 'east') ctx.fillRect(-w / 2 + 2, -h / 2 + 2, Math.max(2, w * 0.16), h - 4)
      else ctx.fillRect(w / 2 - Math.max(2, w * 0.16) - 2, -h / 2 + 2, Math.max(2, w * 0.16), h - 4)
      ctx.restore()
    }

    // --- Info text ---
    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.fillStyle = colors.info
    ctx.textAlign = 'left'
    const infoY = (HALF_J + ARM_LEN + 8)
    ctx.fillText(
      `${runningRef.current ? 'LIVE' : 'PAUSED'} · ${vehiclesRef.current.length} active vehicles · straight-through movements`,
      -(HALF_J + ARM_LEN), infoY + 20,
    )

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
