# All-In Search

A search engine for the [All-In Podcast](https://www.youtube.com/@allin) that understands natural language questions and answers them using the actual podcast transcripts. Ask something like "What did the hosts say about interest rate cuts?" and the app finds the relevant moments across episodes, generates a concise answer grounded in what the hosts said, and links every citation to the exact timestamp on YouTube.

**Live site:** [soundbite.dev](https://soundbite.dev)

## What it does

- **Semantic and keyword search:** Finds relevant discussions even when the hosts never used the same phrasing as the question, while still matching on exact terms when they appear.
- **Grounded answers:** Generates a written response from the retrieved transcript text only. The app attributes claims to the specific host who made them and says so plainly when the episodes don't cover the question.
- **Timestamped citations:** Every source links to the exact moment in the YouTube video so the answer is easy to verify.
- **Grouped results:** Clips are organized by episode, giving a quick overview of where and when a topic came up.

## How it works

The app uses retrieval-augmented generation (RAG). Podcast transcripts are split into timestamped chunks and stored in Weaviate, a vector database, alongside episode metadata, speaker labels, and each chunk's position within the transcript.

When a user submits a query, the backend runs two steps in parallel: it extracts keywords for lexical matching and generates a hypothetical answer passage using HyDE (Hypothetical Document Embeddings). HyDE works by asking a language model to write a short passage that *would* answer the question, then embedding that passage instead of the raw query. This produces a vector that lands closer to real transcript text in the embedding space, which improves retrieval quality.

The embedded passage and extracted keywords feed into a hybrid search that combines BM25 keyword matching with vector similarity. A language model then reranks the candidates by relevance to the original question. Before composing the final answer, the app pulls in the transcript chunk immediately before and after each selected clip so the model sees the surrounding conversation, not just an isolated excerpt.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Material UI, and `react-markdown` for rendering cited answers.
- **Backend:** Node.js, Express, and TypeScript. Per-IP rate limiting protects the API and controls model spend.
- **AI and retrieval:** OpenAI Responses API for generation, keyword extraction, HyDE, and reranking. `text-embedding-3-large` for 512-dimensional embeddings. Weaviate for hybrid vector + BM25 search.
- **Deployment:** Docker multi-stage build that compiles the client and server separately and ships them as a single image. Docker Compose orchestrates the app and Weaviate on a VPS.

---

This is an independent portfolio project and is not affiliated with or endorsed by the All-In Podcast.
