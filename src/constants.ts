export interface WebhookIncomingMessagePayload {
  message: string;
  sender_id: string;
  receiver_id: string;
  thread_id: string;
  timestamp: string;
}

export interface NewThreadRequestPayload {
  id: string;
  userId: string;
  createdAt: string;
  participants: string[];
  messages: any[];
  isActive: boolean;
  lastMessage: string | null;
  threadName: string;
  threadLinkId: string;
}
