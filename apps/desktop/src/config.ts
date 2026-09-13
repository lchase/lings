// Desktop is a thin client: no local server/DB, always talks to a remote Lings server.
// Configurable per build/environment via VITE_API_BASE_URL; placeholder default for scaffold.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
