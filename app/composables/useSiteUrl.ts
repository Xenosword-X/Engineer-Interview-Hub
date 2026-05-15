// composables/useSiteUrl.ts
// Single source of truth for the canonical site URL.
// Set NUXT_PUBLIC_SITE_URL env var in production to override.
export function useSiteUrl(): string {
  return useRuntimeConfig().public.siteUrl as string
}
