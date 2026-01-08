import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages用の設定: リポジトリ名をbaseに設定
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/morning-dashboard/',
})
