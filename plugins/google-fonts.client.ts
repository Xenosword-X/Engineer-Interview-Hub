// Load Google Fonts asynchronously so the stylesheet is not render-blocking.
// The font-display:swap in the URL ensures text is immediately visible in the
// system fallback font; the swap to Inter/JetBrains happens after load.
export default defineNuxtPlugin(() => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Serif+Display&display=swap'
  document.head.appendChild(link)
})
