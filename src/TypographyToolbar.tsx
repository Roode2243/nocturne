import { ChevronRight, Settings2 } from 'lucide-react'
import FontPicker from './FontPicker'
import {
  alignments,
  editorDefaults,
  fontSizeRange,
  lineSpacingRange,
  textStyles,
} from './typography'
import type { Formatting } from './typography'

type Props = {
  formatting: Partial<Formatting>
  onChange: (formatting: Partial<Formatting>) => void
  disabled: boolean
}

export default function TypographyToolbar({
  formatting,
  onChange,
  disabled,
}: Props) {
  const values = { ...editorDefaults, ...formatting }
  const change = (patch: Partial<Formatting>) =>
    onChange({ ...formatting, ...patch })

  return (
    <details className="typography-toolbar">
      <summary>
        <Settings2 size={16} aria-hidden="true" />
        Typography
        <ChevronRight
          className="typography-chevron"
          size={16}
          aria-hidden="true"
        />
      </summary>
      <fieldset
        className="typography-controls"
        aria-label="Poem body formatting"
        disabled={disabled}
      >
        <FontPicker
          value={formatting.fontFamily}
          onChange={(fontFamily) => change({ fontFamily })}
        />
        <label>
          Text style
          <select
            value={values.textStyle}
            onChange={(event) =>
              change({
                textStyle: textStyles[event.currentTarget.selectedIndex],
              })
            }
          >
            {textStyles.map((style) => (
              <option key={style}>{style}</option>
            ))}
          </select>
        </label>
        <label>
          Alignment
          <select
            value={values.alignment}
            onChange={(event) =>
              change({
                alignment: alignments[event.currentTarget.selectedIndex],
              })
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <label>
          Font size <span aria-hidden="true">{values.fontSize} px</span>
          <input
            type="range"
            {...fontSizeRange}
            value={values.fontSize}
            aria-valuetext={values.fontSize + ' pixels'}
            onChange={(event) =>
              change({ fontSize: event.currentTarget.valueAsNumber })
            }
          />
        </label>
        <label>
          Line spacing{' '}
          <span aria-hidden="true">{values.lineSpacing.toFixed(1)}</span>
          <input
            type="range"
            {...lineSpacingRange}
            value={values.lineSpacing}
            onChange={(event) =>
              change({ lineSpacing: event.currentTarget.valueAsNumber })
            }
          />
        </label>
        <button
          type="button"
          className="typography-reset"
          onClick={() => onChange({})}
        >
          Reset formatting
        </button>
      </fieldset>
    </details>
  )
}
