export type AvatarTriangle = { points: string; fill: string }

const GRID = 4
const SIZE = 100

// xmur3 string hash -> 32-bit seed, feeding mulberry32 below. Together they
// give a deterministic PRNG keyed purely off an arbitrary seed string, so
// the same avatar_seed always reproduces the same mesh (SPEC.md "Bots &
// delegation": no image-gen call, no stored image — regenerate just picks a
// new random seed and re-renders client-side).
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Deterministic low-poly avatar: a GRID x GRID mesh of jittered points over
// a 0-100 viewBox, each cell split into two triangles with a seeded-hue
// fill. Pure function of `seed` — same seed always yields the same mesh.
export function generateLowPolyAvatar(seed: string): AvatarTriangle[] {
  const rand = mulberry32(xmur3(seed)())
  const baseHue = rand() * 360
  const cellSize = SIZE / GRID
  const jitter = cellSize * 0.35

  const points: { x: number; y: number }[][] = []
  for (let row = 0; row <= GRID; row++) {
    const rowPoints: { x: number; y: number }[] = []
    for (let col = 0; col <= GRID; col++) {
      rowPoints.push({
        x: col * cellSize + (rand() - 0.5) * jitter,
        y: row * cellSize + (rand() - 0.5) * jitter,
      })
    }
    points.push(rowPoints)
  }

  const triangles: AvatarTriangle[] = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const a = points[row][col]
      const b = points[row][col + 1]
      const c = points[row + 1][col]
      const d = points[row + 1][col + 1]
      const hueA = (baseHue + rand() * 60 - 30 + 360) % 360
      const hueB = (baseHue + rand() * 60 - 30 + 360) % 360
      triangles.push({
        points: `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`,
        fill: `hsl(${hueA.toFixed(1)}, 65%, 55%)`,
      })
      triangles.push({
        points: `${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`,
        fill: `hsl(${hueB.toFixed(1)}, 65%, 55%)`,
      })
    }
  }
  return triangles
}
