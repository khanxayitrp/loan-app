import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true, // อนุญาตให้เชื่อมต่อจากอุปกรณ์อื่นในเครือข่ายได้
    proxy: {
      '/api': {
        target: 'http://localhost:15520',
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true, // ใช้ polling เพื่อให้การเปลี่ยนแปลงไฟล์ถูกตรวจจับได้ดีขึ้นในบางสภาพแวดล้อม
    },
  },
  // ========================================================
  // 🌟 ส่วนที่เพิ่มเข้ามาเพื่อจัดการ Code Splitting & Performance
  // ========================================================
  build: {
    chunkSizeWarningLimit: 800, // ปรับลดความอ่อนไหวของ Warning ขึ้นเล็กน้อย
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ตรวจสอบเฉพาะไฟล์ที่มาจาก node_modules
          if (id.includes('node_modules')) {
            // 1. แยกกลุ่ม Vue Ecosystem (Vue, Vue-Router, Pinia)
            if (
              id.includes('vue') ||
              id.includes('@vue') ||
              id.includes('pinia') ||
              id.includes('vue-router')
            ) {
              return 'vue-vendor';
            }
            // 2. แยก Chart.js ออกไป (ขนาดใหญ่)
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'chartjs';
            }
            // 3. แยก XLSX และ Papaparse ออกไป (ใช้ประมวลผลไฟล์ โหลดหนัก)
            if (id.includes('xlsx') || id.includes('papaparse')) {
              return 'excel-tools';
            }
            // 4. Library ยิบย่อยอื่นๆ รวมไว้ใน vendor ก้อนเดียว
            return 'vendor';
          }
        }
      }
    }
  }
})
