export interface WebhookIncomingMessagePayload {
  message: string;
  threadId: string;
  lastMessage: string;
  timestamp: string;
  to: {
    id: string;
    threadId: string;
    userId: string;
  }[];
}
