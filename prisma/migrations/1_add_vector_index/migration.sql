-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Post_embedding_idx" ON "Post" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
