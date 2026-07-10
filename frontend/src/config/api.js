// Central place for the backend API base URL.
// Override by creating frontend/.env with:
//   VITE_API_URL=http://localhost:5000/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";