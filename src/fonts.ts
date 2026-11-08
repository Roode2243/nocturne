export const fontCategories = [
  'Serif',
  'Sans Serif',
  'Handwritten',
  'Typewriter',
] as const

export const fontLibrary = {
  Lora: 'Serif',
  'Playfair Display': 'Serif',
  Merriweather: 'Serif',
  'Crimson Pro': 'Serif',
  Georgia: 'Serif',
  'DM Sans': 'Sans Serif',
  Inter: 'Sans Serif',
  Manrope: 'Sans Serif',
  'Work Sans': 'Sans Serif',
  Caveat: 'Handwritten',
  'Dancing Script': 'Handwritten',
  Kalam: 'Handwritten',
  'Patrick Hand': 'Handwritten',
  'Special Elite': 'Typewriter',
  'Courier Prime': 'Typewriter',
  'IBM Plex Mono': 'Typewriter',
  'Space Mono': 'Typewriter',
  'Courier New': 'Typewriter',
} as const

export type FontFamily = keyof typeof fontLibrary
export const fontFamilies = Object.keys(fontLibrary) as FontFamily[]

const fallbackStacks = {
  Serif: '"Times New Roman", serif',
  'Sans Serif': 'ui-sans-serif, system-ui, sans-serif',
  Handwritten: 'cursive',
  Typewriter: 'Courier, monospace',
}

export function fontStack(family: FontFamily) {
  const face = family === 'Inter' ? '"Nocturne Inter", Inter' : `"${family}"`
  return `${face}, ${fallbackStacks[fontLibrary[family]]}`
}
