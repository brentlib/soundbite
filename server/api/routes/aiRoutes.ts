import { Router } from 'express';
import { LLMController } from '../controllers/llmController';
import { EmbeddingController } from '../controllers/embeddingController';
import { RagController } from '../controllers/ragController';

const router = Router();
const llmController = new LLMController();
const embeddingController = new EmbeddingController();
const ragController = new RagController();

// Chat endpoints
router.post('/llm', llmController.submitLLM.bind(llmController));

// Embedding endpoints
router.post('/embeddings', embeddingController.createEmbedding.bind(embeddingController));

// Weaviate search endpoints
router.post('/search', ragController.hybridSearch.bind(ragController));

// RAG answer endpoint
router.post('/rag-answer', ragController.answerRag.bind(ragController));

export default router;