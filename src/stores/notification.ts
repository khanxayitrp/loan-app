// src/stores/notification.ts
import { defineStore } from 'pinia';
import { notificationApi } from '@/api/notification';
import type { Notification } from '@/types/notification';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    isLoading: false,
  }),

  actions: {
    async fetchUnreadCount() {
      try {
        const response = await notificationApi.getUnreadCount();

        // 🟢 ປ່ຽນໃຫ້ກົງກັບທີ່ Backend ສົ່ງມາ (unread_count)
        this.unreadCount = response.data?.data?.unread_count || 0;

      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    },

    // src/stores/notification.ts

    // src/stores/notification.ts

    async fetchNotifications() {
      this.isLoading = true;
      try {
        const response = await notificationApi.getMyNotifications();

        // ດຶງຂໍ້ມູນອອກມາຈາກ axios response
        const resData: any = response.data?.data;

        // 🟢 ກວດສອບໂຄງສ້າງ ແລະ ດຶງເອົາສະເພາະ Array ມາເກັບໄວ້
        if (resData && Array.isArray(resData.data)) {
          // ກໍລະນີ Backend ສົ່ງມາເປັນ Pagination Object: { data: [], total: 1 }
          this.notifications = resData.data;
        } else if (Array.isArray(resData)) {
          // ກໍລະນີ Backend ສົ່ງມາເປັນ Array ກົງໆ: []
          this.notifications = resData;
        } else {
          // ຖ້າບໍ່ກົງກັບເງື່ອນໄຂໃດເລີຍ ໃຫ້ຕັ້ງຄ່າເປັນ Array ວ່າງ
          this.notifications = [];
        }

      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        this.notifications = [];
      } finally {
        this.isLoading = false;
      }
    },

    async markAsRead(id: number) {
      try {
        await notificationApi.markAsRead(id);

        // อัปเดต State ในฝั่ง Frontend ทันที
        const notif = this.notifications.find(n => n.id === id);
        if (notif && !notif.read_at) {
          notif.read_at = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }
});
