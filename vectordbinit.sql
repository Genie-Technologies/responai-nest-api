CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    thread_id uuid not null,
    msg text,
    embedding VECTOR(1536)
  );