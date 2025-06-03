import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
   server: {
    port: 3000, 
    host: 'crm-frontend-sltp.onrender.com' // Allow external access on Render
  }

  
})
