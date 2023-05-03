export interface WebhookIncomingMessagePayload {
  message: string;
  sender_id: string;
  receiver_id: string;
  thread_id: string;
  thread_name: string;
  timestamp: string;
  participant_user_ids: string[];
}

export interface NewThreadRequestPayload {
  userId: string;
  createdAt: string;
  lastMessage: string | null;
  threadName: string;
}
