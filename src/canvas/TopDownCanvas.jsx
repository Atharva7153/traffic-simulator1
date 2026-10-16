/** Top-down HTML canvas view of the shared junction layout and live traffic. */
import { useRef, useEffect, useCallback } from 'react'
import { APPROACH_LAYOUT, JUNCTION_LAYOUT } from '../network/junctionLayout'
import { useSimulation } from '../simulation/useSimulation'

const { road, lane, median, island } = JUNCTION_LAYOUT
const HALF_W = road.halfWidth
const EXTENT = road.extent
const J_HALF = road.junctionHalf

const PALETTES = {
  day: { bg: '#dce7dc', asphalt: '#42494b', marking: '#f7f4e9', markDim: 'rgba(247,244,233,0.6)', zebra: '#f7f4e9', curb: '#d6d8d0', sidewalk: '#c9d1ca', island: '#b9bbb2', red: '#dc2626', amber: '#d97706', green: '#16a34a', sign: '#126d72', text: '#24474b', info: 'rgba(35,57,61,0.83)' },
  sunset: { bg: '#e9d8c5', asphalt: '#494546', marking: '#fff8e8', markDim: 'rgba(255,248,232,0.55)', zebra: '#fff8e8', curb: '#c9b9a5', sidewalk: '#dfd0bd', island: '#bcb3a6', red: '#dc2626', amber: '#bf6d0b', green: '#15803d', sign: '#126d72', text: '#614a3e', info: 'rgba(75,58,48,0.82)' },
  night: { bg: '#17242d', asphalt: '#303a40', marking: '#dce5e8', markDim: 'rgba(220,229,232,0.4)', zebra: '#dce5e8', curb: '#58666b', sidewalk: '#29383d', island: '#657174', red: '#fb5555', amber: '#f6ba49', green: '#4ade80', sign: '#164e58', text: '#d5e7e7', info: 'rgba(218,230,233,0.8)' },
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.arcTo(x + width, y, x + width, y + r, r)
  ctx.lineTo(x + width, y + height - r)
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
  ctx.lineTo(x + r, y + height)
  ctx.arcTo(x, y + height, x, y + height - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function drawSegment(ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function drawRoundIsland(ctx, x, y, size, colors) {
  roundedRect(ctx, x - size / 2, y - size / 2, size, size, 0.52)
  ctx.fillStyle = colors.curb
  ctx.fill()
  roundedRect(ctx, x - size / 2 + 0.2, y - size / 2 + 0.2, size - 0.4, size - 0.4, 0.42)
  ctx.fillStyle = colors.island
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y, 0.13, 0, Math.PI * 2)
  ctx.fillStyle = '#efd36d'
  ctx.fill()
}

function drawArrow(ctx, x, y, angle, color, turnOnly = false) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-angle)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 0.13
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (turnOnly) {
    ctx.beginPath()
    ctx.moveTo(0, 0.95)
    ctx.lineTo(0, 0.05)
    ctx.quadraticCurveTo(0, -0.42, -0.48, -0.42)
    ctx.lineTo(-0.82, -0.42)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-0.82, -0.42)
    ctx.lineTo(-0.48, -0.68)
    ctx.moveTo(-0.82, -0.42)
    ctx.lineTo(-0.48, -0.16)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, -0.94)
    ctx.lineTo(0, 0.62)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-0.5, -0.36)
    ctx.lineTo(0, -0.98)
    ctx.lineTo(0.5, -0.36)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawRoadBase(ctx, colors) {
  ctx.fillStyle = colors.sidewalk
  for (const xSign of [-1, 1]) {
    for (const zSign of [-1, 1]) {
      roundedRect(ctx, xSign * 18 - 7, zSign * 18 - 7, 14, 14, 0.65)
      ctx.fill()
    }
  }

  ctx.fillStyle = colors.asphalt
  ctx.fillRect(-HALF_W, -EXTENT, road.width, EXTENT - J_HALF)
  ctx.fillRect(-HALF_W, J_HALF, road.width, EXTENT - J_HALF)
  ctx.fillRect(J_HALF, -HALF_W, EXTENT - J_HALF, road.width)
  ctx.fillRect(-EXTENT, -HALF_W, EXTENT - J_HALF, road.width)
  roundedRect(ctx, -J_HALF, -J_HALF, J_HALF * 2, J_HALF * 2, 0.8)
  ctx.fill()

  // Restrained deterministic aggregate texture, clipped to the asphalt union.
  ctx.save()
  ctx.beginPath()
  ctx.rect(-HALF_W, -EXTENT, road.width, EXTENT - J_HALF)
  ctx.rect(-HALF_W, J_HALF, road.width, EXTENT - J_HALF)
  ctx.rect(J_HALF, -HALF_W, EXTENT - J_HALF, road.width)
  ctx.rect(-EXTENT, -HALF_W, EXTENT - J_HALF, road.width)
  roundedRect(ctx, -J_HALF, -J_HALF, J_HALF * 2, J_HALF * 2, 0.8)
  ctx.clip()
  for (let index = 0; index < 140; index += 1) {
    const x = ((index * 37) % 97) - 48
    const y = ((index * 61) % 91) - 45
    ctx.fillStyle = index % 2 ? 'rgba(245,246,235,0.035)' : 'rgba(8,12,14,0.055)'
    ctx.fillRect(x, y, 0.34, 0.25)
  }
  ctx.restore()

  ctx.strokeStyle = colors.curb
  ctx.lineWidth = 0.42
  ctx.lineCap = 'square'
  for (const side of [-1, 1]) {
    drawSegment(ctx, side * (HALF_W + 0.18), -EXTENT, side * (HALF_W + 0.18), -J_HALF)
    drawSegment(ctx, side * (HALF_W + 0.18), J_HALF, side * (HALF_W + 0.18), EXTENT)
    drawSegment(ctx, -EXTENT, side * (HALF_W + 0.18), -J_HALF, side * (HALF_W + 0.18))
    drawSegment(ctx, J_HALF, side * (HALF_W + 0.18), EXTENT, side * (HALF_W + 0.18))
  }

  for (const sign of [-1, 1]) {
    roundedRect(ctx, -median.width / 2, sign * median.start, median.width, median.length * sign, 0.7)
    ctx.fillStyle = colors.island
    ctx.fill()
    roundedRect(ctx, sign * median.start, -median.width / 2, median.length * sign, median.width, 0.7)
    ctx.fill()
    for (const along of [median.start + 1, EXTENT - 2]) {
      ctx.beginPath()
      ctx.arc(0, along * sign, 0.16, 0, Math.PI * 2)
      ctx.fillStyle = '#efd36d'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(along * sign, 0, 0.16, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (const xSign of [-1, 1]) {
    for (const zSign of [-1, 1]) drawRoundIsland(ctx, xSign * island.offset, zSign * island.offset, island.size, colors)
  }
}

function drawLaneMarkings(ctx, colors) {
  ctx.lineCap = 'butt'
  ctx.strokeStyle = colors.markDim
  ctx.lineWidth = 0.09
  ctx.setLineDash([1.55, 1.15])
  for (const sign of [-1, 1]) {
    for (const side of [-1, 1]) {
      drawSegment(ctx, lane.separatorOffset * side, sign * (JUNCTION_LAYOUT.crosswalkOffset + 3), lane.separatorOffset * side, sign * EXTENT)
      drawSegment(ctx, sign * (JUNCTION_LAYOUT.crosswalkOffset + 3), lane.separatorOffset * side, sign * EXTENT, lane.separatorOffset * side)
    }
  }
  ctx.setLineDash([])

  const edgeStart = JUNCTION_LAYOUT.crosswalkOffset + 3
  ctx.strokeStyle = colors.markDim
  ctx.lineWidth = 0.09
  for (const sign of [-1, 1]) {
    drawSegment(ctx, lane.edgeOffset, sign * edgeStart, lane.edgeOffset, sign * EXTENT)
    drawSegment(ctx, -lane.edgeOffset, sign * edgeStart, -lane.edgeOffset, sign * EXTENT)
    drawSegment(ctx, sign * edgeStart, lane.edgeOffset, sign * EXTENT, lane.edgeOffset)
    drawSegment(ctx, sign * edgeStart, -lane.edgeOffset, sign * EXTENT, -lane.edgeOffset)
  }

  const medianMarkStart = median.start
  ctx.strokeStyle = '#e8c85b'
  ctx.lineWidth = 0.12
  for (const sign of [-1, 1]) {
    for (const side of [-1, 1]) {
      drawSegment(ctx, lane.medianHalfWidth * side, sign * medianMarkStart, lane.medianHalfWidth * side, sign * EXTENT)
      drawSegment(ctx, sign * medianMarkStart, lane.medianHalfWidth * side, sign * EXTENT, lane.medianHalfWidth * side)
    }
  }

  // Zebra bars sit before the stop bars on all four approaches.
  ctx.fillStyle = colors.zebra
  const stripeDepth = 0.23
  for (const direction of ['north', 'south', 'east', 'west']) {
    const sign = direction === 'north' || direction === 'west' ? -1 : 1
    const vertical = direction === 'north' || direction === 'south'
    for (let index = -3; index <= 3; index += 1) {
      const offset = index * 0.37
      if (vertical) ctx.fillRect(-HALF_W + 0.65, sign * JUNCTION_LAYOUT.crosswalkOffset + offset - stripeDepth / 2, road.width - 1.3, stripeDepth)
      else ctx.fillRect(sign * JUNCTION_LAYOUT.crosswalkOffset + offset - stripeDepth / 2, -HALF_W + 0.65, stripeDepth, road.width - 1.3)
    }

    ctx.fillStyle = colors.marking
    ctx.lineWidth = 0.34
    if (vertical) drawSegment(ctx, -HALF_W + 0.75, sign * JUNCTION_LAYOUT.stopLineOffset, HALF_W - 0.75, sign * JUNCTION_LAYOUT.stopLineOffset)
    else drawSegment(ctx, sign * JUNCTION_LAYOUT.stopLineOffset, -HALF_W + 0.75, sign * JUNCTION_LAYOUT.stopLineOffset, HALF_W - 0.75)
    ctx.fillStyle = colors.zebra
  }

  for (const [direction, approach] of Object.entries(APPROACH_LAYOUT)) {
    const vertical = direction === 'north' || direction === 'south'
    const incomingSign = direction === 'north' || direction === 'west' ? -1 : 1
    const active = vertical
      ? [approach.spawn[0], incomingSign * 24]
      : [incomingSign * 24, approach.spawn[1]]
    const turn = vertical
      ? [Math.sign(approach.spawn[0]) * lane.turnOffset, incomingSign * 24]
      : [incomingSign * 24, Math.sign(approach.spawn[1]) * lane.turnOffset]
    const closed = vertical
      ? [turn[0], incomingSign * (JUNCTION_LAYOUT.stopLineOffset + 1.2)]
      : [incomingSign * (JUNCTION_LAYOUT.stopLineOffset + 1.2), turn[1]]
    drawArrow(ctx, active[0], active[1], approach.straightArrow, colors.marking)
    drawArrow(ctx, turn[0], turn[1], approach.turnArrow, 'rgba(198,192,170,0.8)', true)
    ctx.save()
    ctx.translate(closed[0], closed[1])
    ctx.rotate(Math.PI / 4)
    ctx.strokeStyle = '#f0d778'
    ctx.lineWidth = 0.16
    drawSegment(ctx, -0.55, -0.55, 0.55, 0.55)
    drawSegment(ctx, -0.55, 0.55, 0.55, -0.55)
    ctx.restore()
  }
}

function drawSignals(ctx, signals, colors) {
  for (const [direction, approach] of Object.entries(APPROACH_LAYOUT)) {
    const [x, y] = approach.signal
    const state = signals[direction]
    const lamp = state === 'green' ? colors.green : state === 'amber' ? colors.amber : colors.red
    roundedRect(ctx, x - 0.62, y - 0.38, 1.24, 0.76, 0.12)
    ctx.fillStyle = '#253238'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 0.22, 0, Math.PI * 2)
    ctx.fillStyle = lamp
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 0.34, 0, Math.PI * 2)
    ctx.strokeStyle = `${lamp}66`
    ctx.lineWidth = 0.12
    ctx.stroke()
    ctx.fillStyle = colors.sign
    roundedRect(ctx, x - 1.25, y + 0.62, 2.5, 0.46, 0.07)
    ctx.fill()
    ctx.fillStyle = '#fffdf5'
    ctx.font = 'bold 0.22px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('STRAIGHT ONLY', x, y + 0.85)
  }
}

function drawVehicle(ctx, vehicle) {
  const vertical = vehicle.direction === 'north' || vehicle.direction === 'south'
  const width = vertical ? vehicle.width : vehicle.length
  const height = vertical ? vehicle.length : vehicle.width
  ctx.save()
  ctx.translate(vehicle.x, vehicle.z)
  ctx.fillStyle = vehicle.color
  roundedRect(ctx, -width / 2, -height / 2, width, height, Math.min(0.42, width / 4))
  ctx.fill()
  if (vehicle.type === 'ambulance') {
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 0.1
    ctx.stroke()
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(-width / 2, -height / 2 + height * 0.42, width, Math.max(0.16, height * 0.1))
  }
  ctx.fillStyle = 'rgba(210,231,239,0.48)'
  if (vehicle.direction === 'north') ctx.fillRect(-width / 2 + 0.08, -height / 2 + 0.1, width - 0.16, Math.max(0.2, height * 0.16))
  else if (vehicle.direction === 'south') ctx.fillRect(-width / 2 + 0.08, height / 2 - Math.max(0.2, height * 0.16) - 0.1, width - 0.16, Math.max(0.2, height * 0.16))
  else if (vehicle.direction === 'east') ctx.fillRect(-width / 2 + 0.08, -height / 2 + 0.1, Math.max(0.2, width * 0.16), height - 0.2)
  else ctx.fillRect(width / 2 - Math.max(0.2, width * 0.16) - 0.08, -height / 2 + 0.1, Math.max(0.2, width * 0.16), height - 0.2)
  ctx.restore()
}

export default function TopDownCanvas() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const { signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode } = useSimulation()
  const stateRef = useRef({ signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode })
  useEffect(() => {
    stateRef.current = { signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode }
  }, [signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode])

  const draw = useCallback((canvas, ctx) => {
    const state = stateRef.current
    const colors = PALETTES[state.environmentMode] || PALETTES.day
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    if (!width || !height) return
    const pixelWidth = Math.round(width * dpr)
    const pixelHeight = Math.round(height * dpr)
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, width, height)

    const padding = 9
    const scale = Math.min(width, height) / ((EXTENT + padding) * 2)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(scale, scale)

    drawRoadBase(ctx, colors)
    drawLaneMarkings(ctx, colors)
    drawSignals(ctx, state.signals, colors)

    const crossingColors = { open: colors.green, warning: colors.amber, closed: colors.red }
    for (const crossing of state.railwayCrossings || []) {
      const [x, y] = crossing.direction === 'north' ? [0, -23]
        : crossing.direction === 'south' ? [0, 23]
          : crossing.direction === 'east' ? [23, 0] : [-23, 0]
      const vertical = crossing.direction === 'north' || crossing.direction === 'south'
      ctx.strokeStyle = '#d9e1df'
      ctx.lineWidth = 0.15
      if (vertical) {
        for (const offset of [-0.8, 0.8]) drawSegment(ctx, -HALF_W, y + offset, HALF_W, y + offset)
      } else {
        for (const offset of [-0.8, 0.8]) drawSegment(ctx, x + offset, -HALF_W, x + offset, HALF_W)
      }
      ctx.strokeStyle = crossingColors[state.crossingState] || colors.green
      ctx.lineWidth = 0.18
      if (vertical) {
        for (const offset of [-1.5, 1.5]) drawSegment(ctx, -HALF_W + 0.7, y + offset, HALF_W - 0.7, y + offset)
      } else {
        for (const offset of [-1.5, 1.5]) drawSegment(ctx, x + offset, -HALF_W + 0.7, x + offset, HALF_W - 0.7)
      }
    }

    for (const vehicle of state.vehicles) drawVehicle(ctx, vehicle)

    ctx.fillStyle = colors.text
    ctx.font = 'bold 1.7px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('N', 0, -EXTENT - 4)
    ctx.fillText('S', 0, EXTENT + 4)
    ctx.fillText('E', EXTENT + 4, 0)
    ctx.fillText('W', -EXTENT - 4, 0)

    ctx.fillStyle = colors.info
    ctx.font = '1.45px Inter, system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${state.isRunning ? 'LIVE' : 'PAUSED'} · ${state.vehicles.length} active · straight-through traffic`, -EXTENT, EXTENT + 7)
    ctx.fillText('Turn pockets marked inactive · queue lanes stay clear of islands', -EXTENT, EXTENT + 9.1)
    ctx.restore()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return undefined
    const context = canvas.getContext('2d')
    const redraw = () => {
      draw(canvas, context)
      animRef.current = requestAnimationFrame(redraw)
    }
    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
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
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
