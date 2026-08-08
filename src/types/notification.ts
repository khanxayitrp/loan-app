// src/types/notification.ts

export interface Notification {
  id: number;
  title: string;
  body: string;
  event_type: string;
  reference_type: string;
  reference_id: number;
  read_at: string | null;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}
