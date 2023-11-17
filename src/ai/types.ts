export type MsgEmbdngContext = {
  embedding: string;
  msg: string;
  thread_id: string;
};

export type ChatMessage = {
  role: string;
  content: string;
};
