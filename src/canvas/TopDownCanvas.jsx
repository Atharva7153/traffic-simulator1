/** Top-down HTML canvas view of the shared junction layout, city blocks, and live traffic. */
import { useRef, useEffect, useCallback } from 'react'
import { APPROACH_LAYOUT, JUNCTION_LAYOUT } from '../network/junctionLayout'
import { useSimulation } from '../simulation/useSimulation'

const { road, lane, median, island } = JUNCTION_LAYOUT
const HALF_W = road.halfWidth
const EXTENT = road.extent
const J_HALF = road.junctionHalf

const PALETTES = {
  day: {
    bg: '#252d38',
    block: '#334155',
    blockBorder: '#475569',
    bldg: '#1e293b',
    bldgBorder: '#3b82f6',
    park: '#1e3a24',
    water: '#0284c7',
    asphalt: '#1e232a',
    marking: '#f8fafc',
    markYellow: '#eab308',
    markDim: 'rgba(248,250,252,0.6)',
    zebra: '#f8fafc',
    curb: '#94a3b8',
    sidewalk: '#334155',
    island: '#475569',
    red: '#ef4444',
    amber: '#f59e0b',
    green: '#22c55e',
    sign: '#0f766e',
    text: '#f8fafc',
    info: 'rgba(241,245,249,0.85)',
  },
  sunset: {
    bg: '#2c1e21',
    block: '#442e32',
    blockBorder: '#5c3d42',
    bldg: '#26191c',
    bldgBorder: '#f97316',
    park: '#2e301d',
    water: '#0369a1',
    asphalt: '#23181a',
    marking: '#fff7ed',
    markYellow: '#f59e0b',
    markDim: 'rgba(255,247,237,0.55)',
    zebra: '#fff7ed',
    curb: '#78565b',
    sidewalk: '#442e32',
    island: '#5c3d42',
    red: '#ef4444',
    amber: '#ea580c',
    green: '#16a34a',
    sign: '#0f766e',
    text: '#fed7aa',
    info: 'rgba(254,215,170,0.85)',
  },
  night: {
    bg: '#090d16',
    block: '#111827',
    blockBorder: '#1f2937',
    bldg: '#0b0f19',
    bldgBorder: '#60a5fa',
    park: '#0a1d12',
    water: '#0369a1',
    asphalt: '#0d1117',
    marking: '#e2e8f0',
    markYellow: '#eab308',
    markDim: 'rgba(226,232,240,0.4)',
    zebra: '#e2e8f0',
    curb: '#475569',
    sidewalk: '#172033',
    island: '#1e293b',
    red: '#f87171',
    amber: '#fbbf24',
    green: '#4ade80',
    sign: '#0d9488',
    text: '#f1f5f9',
    info: 'rgba(226,232,240,0.8)',
  },
}

function roundedRect(ctx, x, y, width, height, radius) {
  if (width < 0) {
    x += width
    width = -width
  }
  if (height < 0) {
    y += height
    height = -height
  }
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
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

/** Draws city blocks, park lawns, fountains, and building footprints */
function drawCityBlocks(ctx, colors) {
  // 1. South-West: Downtown Financial District
  ctx.fillStyle = colors.sidewalk
  roundedRect(ctx, -EXTENT - 2, 10.5, EXTENT - 8.5, EXTENT - 8.5, 1.2)
  ctx.fill()
  // Skyscraper 1 (Nexus Tower)
  ctx.fillStyle = colors.bldg
  ctx.strokeStyle = colors.bldgBorder
  ctx.lineWidth = 0.25
  roundedRect(ctx, -29, 14, 12, 12, 0.8)
  ctx.fill()
  ctx.stroke()
  // Skyscraper 2
  roundedRect(ctx, -45, 14, 11, 10, 0.8)
  ctx.fill()
  ctx.stroke()

  // 2. South-East: Grand Central Park & Hotel
  ctx.fillStyle = colors.sidewalk
  roundedRect(ctx, 10.5, 10.5, EXTENT - 8.5, EXTENT - 8.5, 1.2)
  ctx.fill()
  // Central Park Lawn
  ctx.fillStyle = colors.park
  roundedRect(ctx, 13, 13, 20, 20, 1.0)
  ctx.fill()
  // Central Park Fountain
  ctx.fillStyle = colors.water
  ctx.beginPath()
  ctx.arc(23, 23, 3.2, 0, Math.PI * 2)
  ctx.fill()
  // Grand Hotel Tower
  ctx.fillStyle = colors.bldg
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 0.25
  roundedRect(ctx, 36, 14, 11, 11, 0.8)
  ctx.fill()
  ctx.stroke()

  // 3. North-West: Retail Arcade (Z ∈ [-18.5, -11]) & Station (Z < -28.5)
  ctx.fillStyle = colors.sidewalk
  roundedRect(ctx, -EXTENT - 2, -18.2, EXTENT - 8.5, 7.2, 0.8)
  ctx.fill()
  // Retail storefronts
  ctx.fillStyle = colors.bldg
  for (let i = 0; i < 3; i++) {
    roundedRect(ctx, -14 - i * 8.5, -17.5, 7.2, 5.5, 0.5)
    ctx.fill()
  }
  // Central Station Concourse (Z < -28)
  roundedRect(ctx, -EXTENT - 2, -EXTENT - 2, EXTENT - 8.5, EXTENT - 26, 1.2)
  ctx.fill()
  ctx.fillStyle = colors.bldg
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 0.3
  roundedRect(ctx, -32, -42, 16, 9, 0.8)
  ctx.fill()
  ctx.stroke()

  // 4. North-East: Corner Plaza & Towers
  ctx.fillStyle = colors.sidewalk
  roundedRect(ctx, 10.5, -18.2, EXTENT - 8.5, 7.2, 0.8)
  ctx.fill()
  roundedRect(ctx, 10.5, -EXTENT - 2, EXTENT - 8.5, EXTENT - 26, 1.2)
  ctx.fill()
  // Tower footprints
  ctx.fillStyle = colors.bldg
  ctx.strokeStyle = colors.bldgBorder
  ctx.lineWidth = 0.25
  roundedRect(ctx, 16, -42, 11, 11, 0.8)
  ctx.fill()
  ctx.stroke()
  roundedRect(ctx, 31, -40, 11, 10, 0.8)
  ctx.fill()
  ctx.stroke()
}

function drawRoadBase(ctx, colors) {
  // First draw surrounding city zoning & blocks
  drawCityBlocks(ctx, colors)

  // Asphalt roads
  ctx.fillStyle = colors.asphalt
  ctx.fillRect(-HALF_W, -EXTENT, road.width, EXTENT - J_HALF)
  ctx.fillRect(-HALF_W, J_HALF, road.width, EXTENT - J_HALF)
  ctx.fillRect(J_HALF, -HALF_W, EXTENT - J_HALF, road.width)
  ctx.fillRect(-EXTENT, -HALF_W, EXTENT - J_HALF, road.width)
  roundedRect(ctx, -J_HALF, -J_HALF, J_HALF * 2, J_HALF * 2, 0.8)
  ctx.fill()

  // Curbs
  ctx.strokeStyle = colors.curb
  ctx.lineWidth = 0.42
  ctx.lineCap = 'square'
  for (const side of [-1, 1]) {
    drawSegment(ctx, side * (HALF_W + 0.18), -EXTENT, side * (HALF_W + 0.18), -J_HALF)
    drawSegment(ctx, side * (HALF_W + 0.18), J_HALF, side * (HALF_W + 0.18), EXTENT)
    drawSegment(ctx, -EXTENT, side * (HALF_W + 0.18), -J_HALF, side * (HALF_W + 0.18))
    drawSegment(ctx, J_HALF, side * (HALF_W + 0.18), EXTENT, side * (HALF_W + 0.18))
  }

  // Medians
  for (const sign of [-1, 1]) {
    const medY = sign === 1 ? median.start : -median.start - median.length
    roundedRect(ctx, -median.width / 2, medY, median.width, median.length, 0.7)
    ctx.fillStyle = colors.island
    ctx.fill()

    const medX = sign === 1 ? median.start : -median.start - median.length
    roundedRect(ctx, medX, -median.width / 2, median.length, median.width, 0.7)
    ctx.fill()
  }

  for (const xSign of [-1, 1]) {
    for (const zSign of [-1, 1]) drawRoundIsland(ctx, xSign * island.offset, zSign * island.offset, island.size, colors)
  }

  // Yellow Box Junction Grid in center of intersection
  ctx.strokeStyle = colors.markYellow
  ctx.lineWidth = 0.14
  ctx.strokeRect(-J_HALF + 1.5, -J_HALF + 1.5, (J_HALF - 1.5) * 2, (J_HALF - 1.5) * 2)
  for (let offset = -8; offset <= 8; offset += 3) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(-J_HALF + 1.5, -J_HALF + 1.5, (J_HALF - 1.5) * 2, (J_HALF - 1.5) * 2)
    ctx.clip()
    drawSegment(ctx, offset - 15, -15, offset + 15, 15)
    drawSegment(ctx, offset - 15, 15, offset + 15, -15)
    ctx.restore()
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

  // Double Yellow Center lines
  const medianMarkStart = median.start
  ctx.strokeStyle = colors.markYellow
  ctx.lineWidth = 0.12
  for (const sign of [-1, 1]) {
    for (const side of [-1, 1]) {
      drawSegment(ctx, lane.medianHalfWidth * side, sign * medianMarkStart, lane.medianHalfWidth * side, sign * EXTENT)
      drawSegment(ctx, sign * medianMarkStart, lane.medianHalfWidth * side, sign * EXTENT, lane.medianHalfWidth * side)
    }
  }

  // Zebra bars
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

    ctx.strokeStyle = colors.marking
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
  if (!signals) return
  for (const [direction, approach] of Object.entries(APPROACH_LAYOUT)) {
    const [x, y] = approach.signal
    const state = signals[direction] || 'red'
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
  }
}

function drawVehicle(ctx, vehicle) {
  if (!vehicle || typeof vehicle.x !== 'number' || typeof vehicle.z !== 'number') return
  const vertical = vehicle.direction === 'north' || vehicle.direction === 'south'
  const width = Math.max(0.4, vertical ? vehicle.width : vehicle.length)
  const height = Math.max(0.4, vertical ? vehicle.length : vehicle.width)
  ctx.save()
  ctx.translate(vehicle.x, vehicle.z)
  ctx.fillStyle = vehicle.color || '#3b82f6'
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

/** Draws the passing train on the railway track */
function drawTrain(ctx, railwayStatus, railwayProgress) {
  if (railwayStatus !== 'TRAIN PASSING' && railwayStatus !== 'CLEARANCE') return
  const trainX = railwayStatus === 'TRAIN PASSING' ? -95 + railwayProgress * 190 : 95
  const trainY = -23
  const coaches = [
    { offset: 0, length: 8.2, isEngine: true },
    { offset: -8.5, length: 7.6, isEngine: false },
    { offset: -16.7, length: 7.6, isEngine: false },
    { offset: -24.9, length: 7.6, isEngine: false },
    { offset: -33.1, length: 7.6, isEngine: false, isTail: true },
  ]
  const coachHeight = 2.4

  for (const c of coaches) {
    const cx = trainX + c.offset
    if (cx < -EXTENT - 15 || cx > EXTENT + 15) continue
    ctx.save()
    ctx.translate(cx, trainY)

    roundedRect(ctx, -c.length / 2, -coachHeight / 2, c.length, coachHeight, 0.4)
    ctx.fillStyle = c.isEngine ? '#0f4c81' : '#e2e8f0'
    ctx.fill()
    ctx.strokeStyle = c.isEngine ? '#f59e0b' : '#0284c7'
    ctx.lineWidth = 0.18
    ctx.stroke()

    ctx.fillStyle = c.isEngine ? '#f59e0b' : '#0284c7'
    ctx.fillRect(-c.length / 2, -0.25, c.length, 0.5)

    if (!c.isEngine) {
      ctx.fillStyle = '#fef08a'
      for (const wx of [-2.2, -1.1, 0, 1.1, 2.2]) {
        roundedRect(ctx, wx - 0.4, -coachHeight / 2 + 0.2, 0.8, 0.5, 0.1)
        ctx.fill()
        roundedRect(ctx, wx - 0.4, coachHeight / 2 - 0.7, 0.8, 0.5, 0.1)
        ctx.fill()
      }
    } else {
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(c.length / 2 - 0.8, -coachHeight / 2 + 0.3, 0.6, coachHeight - 0.6)
      ctx.fillStyle = '#fef08a'
      ctx.beginPath()
      ctx.arc(c.length / 2, -0.6, 0.3, 0, Math.PI * 2)
      ctx.arc(c.length / 2, 0.6, 0.3, 0, Math.PI * 2)
      ctx.fill()
    }

    if (c.isTail) {
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(-c.length / 2, -0.6, 0.25, 0, Math.PI * 2)
      ctx.arc(-c.length / 2, 0.6, 0.25, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

export default function TopDownCanvas() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const { signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode, railwayStatus, railwayProgress } = useSimulation()

  const stateRef = useRef({ signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode, railwayStatus, railwayProgress })
  useEffect(() => {
    stateRef.current = { signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode, railwayStatus, railwayProgress }
  }, [signals, vehicles, isRunning, railwayCrossings, crossingState, environmentMode, railwayStatus, railwayProgress])

  const draw = useCallback((canvas, ctx, container) => {
    const state = stateRef.current
    const colors = PALETTES[state.environmentMode] || PALETTES.day
    const dpr = window.devicePixelRatio || 1
    const rect = container ? container.getBoundingClientRect() : canvas.getBoundingClientRect()
    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    if (width <= 0 || height <= 0) return

    const pixelWidth = Math.round(width * dpr)
    const pixelHeight = Math.round(height * dpr)
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, width, height)

    const padding = 8
    const scale = Math.min(width, height) / ((EXTENT + padding) * 2)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(scale, scale)

    drawRoadBase(ctx, colors)
    drawLaneMarkings(ctx, colors)
    drawSignals(ctx, state.signals, colors)

    // Full railway track along Y = -23
    ctx.fillStyle = '#38332f'
    ctx.fillRect(-EXTENT - 4, -25.2, (EXTENT + 4) * 2, 4.4)
    // Rails
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 0.18
    drawSegment(ctx, -EXTENT - 4, -23.9, EXTENT + 4, -23.9)
    drawSegment(ctx, -EXTENT - 4, -22.1, EXTENT + 4, -22.1)

    // Crossing status lines and barrier gates at road
    const isClosed = ['CLOSED', 'TRAIN PASSING', 'CLEARANCE'].includes(state.railwayStatus)
    const crossingColor = state.crossingState === 'open' ? colors.green : state.crossingState === 'warning' ? colors.amber : colors.red
    ctx.save()
    ctx.lineWidth = 0.28
    if (isClosed) {
      ctx.strokeStyle = '#ef4444'
      ctx.setLineDash([1.2, 0.8])
      drawSegment(ctx, -HALF_W, -27.2, HALF_W, -27.2)
      drawSegment(ctx, -HALF_W, -18.8, HALF_W, -18.8)
      ctx.setLineDash([])
    } else {
      ctx.strokeStyle = crossingColor
      drawSegment(ctx, -HALF_W, -27.2, HALF_W, -27.2)
      drawSegment(ctx, -HALF_W, -18.8, HALF_W, -18.8)
    }
    ctx.restore()

    // Train
    drawTrain(ctx, state.railwayStatus, state.railwayProgress)

    // Vehicles
    if (Array.isArray(state.vehicles)) {
      for (const vehicle of state.vehicles) drawVehicle(ctx, vehicle)
    }

    // Compass labels
    ctx.fillStyle = colors.text
    ctx.font = 'bold 1.7px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('N', 0, -EXTENT - 4)
    ctx.fillText('S', 0, EXTENT + 4)
    ctx.fillText('E', EXTENT + 4, 0)
    ctx.fillText('W', -EXTENT - 4, 0)

    // Status label
    ctx.fillStyle = colors.info
    ctx.font = '1.45px Inter, system-ui, sans-serif'
    ctx.textAlign = 'left'
    const vehicleCount = Array.isArray(state.vehicles) ? state.vehicles.length : 0
    ctx.fillText(`${state.isRunning ? 'LIVE' : 'PAUSED'} · ${vehicleCount} active · Metropolis Junction`, -EXTENT, EXTENT + 7)
    ctx.restore()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    let isMounted = true
    const redraw = () => {
      if (!isMounted) return
      draw(canvas, context, container)
      animRef.current = requestAnimationFrame(redraw)
    }

    animRef.current = requestAnimationFrame(redraw)
    return () => {
      isMounted = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [draw])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-junction-dark">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  )
}
