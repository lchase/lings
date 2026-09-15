import { generateLowPolyAvatar } from '../lib/bot-avatar'

type BotAvatarProps = {
  seed: string
  size?: number
}

// Pure render of the deterministic mesh from bot-avatar.ts — swapping seed
// re-renders instantly with no async work (see
// .scratch/lings/issues/09-bots-entity-and-chat.md).
export default function BotAvatar({ seed, size = 64 }: BotAvatarProps) {
  const triangles = generateLowPolyAvatar(seed)
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="rounded-full"
      role="img"
      aria-label="Bot avatar"
    >
      {triangles.map((triangle, i) => (
        <polygon key={i} points={triangle.points} fill={triangle.fill} />
      ))}
    </svg>
  )
}
