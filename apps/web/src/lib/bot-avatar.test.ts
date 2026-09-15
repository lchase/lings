import { describe, expect, it } from 'vitest'
import { generateLowPolyAvatar } from './bot-avatar'

describe('generateLowPolyAvatar', () => {
  it('is deterministic for a given seed', () => {
    expect(generateLowPolyAvatar('bot-1')).toEqual(
      generateLowPolyAvatar('bot-1'),
    )
  })

  it('produces a different mesh for a different seed', () => {
    expect(generateLowPolyAvatar('bot-1')).not.toEqual(
      generateLowPolyAvatar('bot-2'),
    )
  })

  it('returns a fixed-size grid of triangles', () => {
    const triangles = generateLowPolyAvatar('bot-1')
    expect(triangles).toHaveLength(32) // 4x4 cells, 2 triangles each
  })

  it('emits valid polygon points and hsl fills', () => {
    for (const triangle of generateLowPolyAvatar('bot-1')) {
      const pair = String.raw`-?\d+(\.\d+)?,-?\d+(\.\d+)?`
      expect(triangle.points).toMatch(new RegExp(`^${pair} ${pair} ${pair}$`))
      expect(triangle.fill).toMatch(/^hsl\(\d+(\.\d+)?, 65%, 55%\)$/)
    }
  })
})
