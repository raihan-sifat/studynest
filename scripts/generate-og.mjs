import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

await sharp(join(root, 'public', 'og.svg'))
  .resize(1200, 630)
  .png()
  .toFile(join(root, 'public', 'og.png'))

console.log('Generated public/og.png (1200x630)')