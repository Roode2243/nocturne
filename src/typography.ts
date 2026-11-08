import type { CSSProperties } from 'react'
import { fontFamilies, fontStack } from './fonts'
import type { FontFamily } from './fonts'
export const textStyles = ['Regular', 'Bold', 'Italic'] as const
export const alignments = ['left', 'center', 'right'] as const

export type Formatting = {
  fontFamily: FontFamily
  fontSize: number
  textStyle: (typeof textStyles)[number]
  alignment: (typeof alignments)[number]
  lineSpacing: number
}

export const fontSizeRange = { min: 14, max: 32, step: 1 }
export const lineSpacingRange = { min: 1.2, max: 2.2, step: 0.1 }

export const editorDefaults: Formatting = {
  fontFamily: 'Inter',
  fontSize: 17,
  textStyle: 'Regular',
  alignment: 'left',
  lineSpacing: 1.8,
}

export function readFormatting(value: unknown): Partial<Formatting> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const fields = value as Record<string, unknown>
  const formatting: Partial<Formatting> = {}

  const fontFamily = fontFamilies.find((family) => family === fields.fontFamily)
  const textStyle = textStyles.find((style) => style === fields.textStyle)
  const alignment = alignments.find((side) => side === fields.alignment)
  if (fontFamily) formatting.fontFamily = fontFamily
  if (textStyle) formatting.textStyle = textStyle
  if (alignment) formatting.alignment = alignment

  const { fontSize, lineSpacing } = fields
  if (
    typeof fontSize === 'number' &&
    fontSize >= fontSizeRange.min &&
    fontSize <= fontSizeRange.max
  ) {
    formatting.fontSize = Math.round(fontSize)
  }
  if (
    typeof lineSpacing === 'number' &&
    lineSpacing >= lineSpacingRange.min &&
    lineSpacing <= lineSpacingRange.max
  ) {
    formatting.lineSpacing = Math.round(lineSpacing * 10) / 10
  }
  return formatting
}

export function bodyTypography(formatting: Partial<Formatting>): CSSProperties {
  const { fontFamily, fontSize, textStyle, alignment, lineSpacing } = formatting
  return {
    fontFamily: fontFamily && fontStack(fontFamily),
    fontSize,
    fontWeight: textStyle && (textStyle === 'Bold' ? 700 : 400),
    fontStyle: textStyle && (textStyle === 'Italic' ? 'italic' : 'normal'),
    textAlign: alignment,
    lineHeight: lineSpacing,
    letterSpacing: fontFamily && 'normal',
    fontSynthesis: fontFamily && 'weight style',
  }
}
