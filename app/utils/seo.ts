// utils/seo.ts

// Strip Markdown syntax to produce a plain-text excerpt suitable for
// <meta name="description"> and OpenGraph descriptions.
export function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/m, '')                 // frontmatter block
    .replace(/::callout[\s\S]*?::/g, '')             // MDC callout blocks
    .replace(/```[\s\S]*?```/g, '')                  // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')                     // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')            // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')         // links -> text only
    .replace(/^#{1,6}\s+/gm, '')                     // heading markers
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')    // bold / italic
    .replace(/^>\s?/gm, '')                          // blockquote markers
    .replace(/^[-*+]\s+/gm, '')                      // unordered list markers
    .replace(/^\d+\.\s+/gm, '')                      // ordered list markers
    .replace(/\s+/g, ' ')                            // collapse whitespace
    .trim()
}

export function excerpt(md: string, max = 155): string {
  const text = stripMarkdown(md)
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}
