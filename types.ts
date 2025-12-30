
export type TrackingStatus = 'WAITING' | 'NEEDS_FOLLOW_UP' | 'REPLIED' | 'DISCARDED';

export interface EmailHistoryItem {
  id: string;
  type: 'initial' | 'followup' | 'reply';
  date: number;
  content: string;
  subject?: string;
  sentiment?: string;
  summary?: string;
}

export interface EmailTracking {
  id: string;
  threadId?: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  lastActivityAt: number;
  status: TrackingStatus;
  followUpCount: number;
  history: EmailHistoryItem[];
}

export interface DashboardStats {
  active: number;
  replied: number;
  followupsNeeded: number;
  discarded: number;
}
