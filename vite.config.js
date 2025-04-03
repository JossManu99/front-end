import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Si tu aplicación se despliega en la raíz, deja la base como '/'
  // Si se despliega en un subdirectorio, por ejemplo '/mi-app/', cambia este valor.
  base: '/',
  plugins: [react()],
})
