export interface WebhookIncomingMessagePayload {
  message: string;
  sender_id: string;
  receiver_id: string;
  thread_id: string;
  thread_name: string;
  timestamp: string;
  participants: string[];
}

export interface NewThreadRequestPayload {
  userId: string;
  createdAt: string;
  lastMessage: string | null;
  threadName: string;
}
