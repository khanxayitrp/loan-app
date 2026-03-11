// src/utils/url.ts
export const getFullImageUrl = (relativePath: string | null | undefined): string | undefined => {
  if (!relativePath) return undefined

  // ตรวจสอบว่าเป็น URL เต็มอยู่แล้วหรือไม่
  if (relativePath.startsWith('http')) {
    return relativePath
  }

  // สร้าง full URL จาก BASE_URL
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:15520'
  return `${baseUrl}${relativePath}`
}
