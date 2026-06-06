/** Set VITE_DAILY_PLAYER_API_URL when the daily guess API is live (no trailing slash). */
export const DAILY_PLAYER_API_URL =
  import.meta.env.VITE_DAILY_PLAYER_API_URL?.replace(/\/$/, "") ?? "";
