// src/api/notification.api.ts
import axios from 'axios'; // หรือ instance axios ของโปรเจกต์ เช่น import api from '@/utils/axios'
import type { Notification, UnreadCountResponse } from '@/types/notification';

export const notificationApi = {
  // ดึงยอดที่ยังไม่ได้อ่าน
  getUnreadCount() {
    return axios.get<{ data: UnreadCountResponse }>('/api/notifications/unread-count');
  },

  // ดึงรายการแจ้งเตือนทั้งหมด
  getMyNotifications() {
    return axios.get<{ data: Notification[] }>('/api/notifications/my-notifications');
  },

  // อัปเดตสถานะการอ่าน
  markAsRead(id: number) {
    return axios.put(`/api/notifications/${id}/read`);
  }
};
