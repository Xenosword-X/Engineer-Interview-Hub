// composables/useBookmarks.ts
// All mutations go through server API routes so the server-side Supabase client
// (which reads HttpOnly session cookies) handles auth — bypassing the browser
// client session-sync issue in @nuxtjs/supabase v2.

export function useBookmarks() {
  const user = useSupabaseUser()

  // useState shares the bookmarked slugs set across all component instances
  const bookmarkedSlugs = useState<Set<string>>('bookmarks:slugs', () => new Set())
  const pending = ref(false)

  async function fetchBookmarks(): Promise<void> {
    if (!user.value) return
    try {
      const slugs = await $fetch<string[]>('/api/bookmarks')
      bookmarkedSlugs.value = new Set(slugs)
    } catch (e) {
      console.error('[useBookmarks] fetchBookmarks failed:', e)
    }
  }

  function isBookmarked(slug: string): boolean {
    return bookmarkedSlugs.value.has(slug)
  }

  async function toggleBookmark(slug: string): Promise<void> {
    if (!user.value || pending.value) return
    pending.value = true

    const action = isBookmarked(slug) ? 'remove' : 'add'

    // Optimistic update
    if (action === 'remove') {
      bookmarkedSlugs.value = new Set([...bookmarkedSlugs.value].filter(s => s !== slug))
    } else {
      bookmarkedSlugs.value = new Set([...bookmarkedSlugs.value, slug])
    }

    try {
      await $fetch('/api/bookmarks/toggle', {
        method: 'POST',
        body: { slug, action },
      })
    } catch (e: any) {
      // Revert optimistic update on failure
      if (action === 'remove') {
        bookmarkedSlugs.value = new Set([...bookmarkedSlugs.value, slug])
      } else {
        bookmarkedSlugs.value = new Set([...bookmarkedSlugs.value].filter(s => s !== slug))
      }
      console.error('[useBookmarks] toggleBookmark failed:', e?.data?.message ?? e)
    } finally {
      pending.value = false
    }
  }

  return { bookmarkedSlugs, pending, fetchBookmarks, toggleBookmark, isBookmarked }
}
