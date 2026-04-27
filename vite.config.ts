import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In CI, GITHUB_REPOSITORY is "owner/repo-name" — use the repo name as the base path.
// Locally it falls back to "/" so `npm run dev` and `npm run preview` work unchanged.
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
