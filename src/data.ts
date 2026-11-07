export type Piece = {
  id: string
  user_id: string
  title: string
  body: string
  kind: 'Poem' | 'Fragment' | 'Thought'
  favorite: boolean
  created_at: string
  updated_at: string
}

export const dateLabel = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
export const density = (text: string) => wordCount(text) < 20 ? 'short' : wordCount(text) > 55 ? 'long' : ''
export const exportedMarkdown = (items: Piece[]) => items.map(item => `# ${item.title}\n\n${item.body}\n\n— ${dateLabel(item.created_at)} · ${item.kind}\n`).join('\n---\n\n')
