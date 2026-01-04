
export interface FollowUpItem {
  id: string; // recipient email acts as ID
  recipientName: string;
  recipientEmail: string;
  subject: string;
  sentAt: number;
  lastReplyAt: number | null;
  threadId: string;
}

/**
 * Status of an email lead in the tracking pipeline
 */
export type TrackingStatus = 'WAITING' | 'NEEDS_FOLLOW_UP' | 'REPLIED' | 'DISCARDED';

/**
 * Represents a single event in the history of a tracked email
 */
export interface HistoryItem {
  id: string;
  type: string;
  date: number;
  content: string;
  subject?: string;
  sentiment?: string;
  summary?: string;
}

/**
 * Detailed tracking information for a specific lead
 */
export interface EmailTracking {
  id: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  lastActivityAt: number;
  status: TrackingStatus;
  followUpCount: number;
  history: HistoryItem[];
}

export interface DashboardStats {
  active: number;
  followupsNeeded: number;
  replied: number;
  discarded: number;
  pendingCount: number;
}
