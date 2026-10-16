/**
 * textures.js — High-performance procedural canvas textures for the 3D metropolis environment.
 * Generates crisp, realistic textures with zero external asset loading:
 * - Asphalt tarmac with stone aggregate grain
 * - Concrete sidewalk paving slabs with mortar grid joints
 * - Lush organic park grass turf
 * - Railway crushed-stone ballast bed
 * - Skyscraper reflective glass curtain wall grid
 * - Modern running-bond brickwork
 * - Plaza stone pavers
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Cached texture singletons
let asphaltTexture = null
let sidewalkTexture = null
let grassTexture = null
let ballastTexture = null
let glassCurtainTexture = null
let brickTexture = null
let stonePaverTexture = null

/** Asphalt Tarmac Texture with fine aggregate stone grain */
export function getAsphaltTexture() {
  if (asphaltTexture) return asphaltTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Base dark asphalt
  ctx.fillStyle = '#22262a'
  ctx.fillRect(0, 0, 512, 512)

  // Aggregate stone noise specks
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = Math.random() * 2.2 + 0.5
    const shade = Math.random()
    if (shade < 0.35) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
    } else if (shade < 0.65) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.12)'
    }
    ctx.fillRect(x, y, size, size)
  }

  // Subtle longitudinal tire-wear grain
  for (let y = 0; y < 512; y += 4) {
    if (Math.random() > 0.4) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)'
      ctx.fillRect(0, y, 512, 2)
    }
  }

  asphaltTexture = new CanvasTexture(canvas)
  asphaltTexture.wrapS = RepeatWrapping
  asphaltTexture.wrapT = RepeatWrapping
  asphaltTexture.colorSpace = SRGBColorSpace
  return asphaltTexture
}

/** Sidewalk Concrete Paving Slabs with mortar joints */
export function getSidewalkTexture() {
  if (sidewalkTexture) return sidewalkTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Concrete base
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(0, 0, 512, 512)

  const tileSize = 64
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      // Slab body with slight tone variation
      const v = (Math.random() - 0.5) * 14
      const hex = Math.floor(212 + v).toString(16).padStart(2, '0')
      ctx.fillStyle = `#${hex}${hex}${hex}`
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4)

      // Bevel highlight top-left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.fillRect(x + 2, y + 2, tileSize - 4, 2)
      ctx.fillRect(x + 2, y + 2, 2, tileSize - 4)

      // Mortar groove bottom-right
      ctx.fillStyle = 'rgba(51, 65, 85, 0.4)'
      ctx.fillRect(x + tileSize - 2, y + 2, 2, tileSize - 2)
      ctx.fillRect(x + 2, y + tileSize - 2, tileSize - 2, 2)
    }
  }

  // Fine concrete porous grain
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * 512
    const ry = Math.random() * 512
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'
    ctx.fillRect(rx, ry, 1.5, 1.5)
  }

  sidewalkTexture = new CanvasTexture(canvas)
  sidewalkTexture.wrapS = RepeatWrapping
  sidewalkTexture.wrapT = RepeatWrapping
  sidewalkTexture.colorSpace = SRGBColorSpace
  return sidewalkTexture
}

/** Natural Lawn Grass Turf Texture */
export function getGrassTexture() {
  if (grassTexture) return grassTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Base lush turf green
  ctx.fillStyle = '#2d5a27'
  ctx.fillRect(0, 0, 512, 512)

  // Grass blade strands & organic patches
  const shades = ['#3f7a36', '#4d8a43', '#244b20', '#56984b', '#1e3d1a', '#346b2d']
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const length = Math.random() * 5 + 2
    ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)]
    ctx.fillRect(x, y, 1.4, length)
  }

  grassTexture = new CanvasTexture(canvas)
  grassTexture.wrapS = RepeatWrapping
  grassTexture.wrapT = RepeatWrapping
  grassTexture.colorSpace = SRGBColorSpace
  return grassTexture
}

/** Crushed Basalt Stone Ballast Texture for Railway */
export function getBallastTexture() {
  if (ballastTexture) return ballastTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Dark stone bed
  ctx.fillStyle = '#2b2622'
  ctx.fillRect(0, 0, 512, 512)

  // Angular stone pebbles
  const stoneColors = ['#423b35', '#36302b', '#4f4740', '#1f1b18', '#5a5149', '#635951']
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const w = Math.random() * 6 + 3
    const h = Math.random() * 5 + 2
    ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)]
    ctx.beginPath()
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()

    // Pebble shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(x - w / 2, y + h / 2, w, 1.5)
  }

  ballastTexture = new CanvasTexture(canvas)
  ballastTexture.wrapS = RepeatWrapping
  ballastTexture.wrapT = RepeatWrapping
  ballastTexture.colorSpace = SRGBColorSpace
  return ballastTexture
}

/** Skyscraper Reflective Glass Curtain Wall with Aluminium Mullions */
export function getGlassCurtainTexture() {
  if (glassCurtainTexture) return glassCurtainTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Dark structural frame
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, 512, 512)

  const cols = 8
  const rows = 16
  const cellW = 512 / cols
  const cellH = 512 / rows

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * cellW
      const y = r * cellH

      // Glass pane gradient (sky reflection sheen)
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH)
      grad.addColorStop(0, '#38bdf8')
      grad.addColorStop(0.5, '#0284c7')
      grad.addColorStop(1, '#0369a1')
      ctx.fillStyle = grad
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4)

      // Glass specular reflection slash
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
      ctx.beginPath()
      ctx.moveTo(x + 2, y + 2)
      ctx.lineTo(x + cellW * 0.45, y + 2)
      ctx.lineTo(x + 2, y + cellH * 0.65)
      ctx.closePath()
      ctx.fill()
    }
  }

  glassCurtainTexture = new CanvasTexture(canvas)
  glassCurtainTexture.wrapS = RepeatWrapping
  glassCurtainTexture.wrapT = RepeatWrapping
  glassCurtainTexture.colorSpace = SRGBColorSpace
  return glassCurtainTexture
}

/** Modern Running-Bond Brickwork Texture */
export function getBrickTexture() {
  if (brickTexture) return brickTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  // Mortar background
  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(0, 0, 512, 512)

  const brickH = 24
  const brickW = 64
  const brickColors = ['#9a3412', '#b45309', '#c2410c', '#852b11', '#a23b16']

  let row = 0
  for (let y = 0; y < 512; y += brickH) {
    const shift = (row % 2) * (brickW / 2)
    for (let x = -brickW; x < 512 + brickW; x += brickW) {
      const color = brickColors[Math.floor(Math.random() * brickColors.length)]
      ctx.fillStyle = color
      ctx.fillRect(x + shift + 2, y + 2, brickW - 4, brickH - 4)

      // Subtle brick texture noise
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(x + shift + 2, y + 2, brickW - 4, 2)
    }
    row++
  }

  brickTexture = new CanvasTexture(canvas)
  brickTexture.wrapS = RepeatWrapping
  brickTexture.wrapT = RepeatWrapping
  brickTexture.colorSpace = SRGBColorSpace
  return brickTexture
}

/** Plaza Interlocking Stone Pavers Texture */
export function getStonePaverTexture() {
  if (stonePaverTexture) return stonePaverTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#94a3b8'
  ctx.fillRect(0, 0, 512, 512)

  const pw = 48
  const ph = 32
  const tones = ['#d1d5db', '#cbd5e1', '#e2e8f0', '#b0b8c4']

  for (let y = 0; y < 512; y += ph) {
    const offset = ((y / ph) % 2) * (pw / 2)
    for (let x = -pw; x < 512 + pw; x += pw) {
      ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)]
      ctx.fillRect(x + offset + 2, y + 2, pw - 4, ph - 4)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.fillRect(x + offset + 2, y + 2, pw - 4, 2)
      ctx.fillStyle = 'rgba(15,23,42,0.25)'
      ctx.fillRect(x + offset + 2, y + ph - 4, pw - 4, 2)
    }
  }

  stonePaverTexture = new CanvasTexture(canvas)
  stonePaverTexture.wrapS = RepeatWrapping
  stonePaverTexture.wrapT = RepeatWrapping
  stonePaverTexture.colorSpace = SRGBColorSpace
  return stonePaverTexture
}
