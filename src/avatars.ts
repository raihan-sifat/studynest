export interface AvatarOption {
  id: string
  name: string
  src: string
}

export const AVATARS: AvatarOption[] = [
  { id: 'sunny', name: 'Sunny', src: '/avatars/sunny.svg' },
  { id: 'ocean', name: 'Ocean', src: '/avatars/ocean.svg' },
  { id: 'berry', name: 'Berry', src: '/avatars/berry.svg' },
  { id: 'leaf', name: 'Leaf', src: '/avatars/leaf.svg' },
  { id: 'coral', name: 'Coral', src: '/avatars/coral.svg' },
  { id: 'wave', name: 'Wave', src: '/avatars/wave.svg' },
  { id: 'citrus', name: 'Citrus', src: '/avatars/citrus.svg' },
  { id: 'grape', name: 'Grape', src: '/avatars/grape.svg' },
]

export function isBuiltInAvatar(url: string | null | undefined): boolean {
  if (!url) return false
  return AVATARS.some((avatar) => avatar.src === url)
}