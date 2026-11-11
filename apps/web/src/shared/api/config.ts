const DEFAULT_API_BASE_URL = "/api"

export function resolveApiBaseUrl(explicitBaseUrl?: string): string {
  const configured = explicitBaseUrl ?? import.meta.env.VITE_API_BASE_URL
  const baseUrl = configured?.trim() || DEFAULT_API_BASE_URL

  return baseUrl === "/" ? "" : baseUrl.replace(/\/+$/, "")
}
