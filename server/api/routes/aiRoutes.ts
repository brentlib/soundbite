import { Router } from 'express';
import { RagController } from '../controllers/ragController';
import { searchLimiter, ragLimiter } from '../middleware/rateLimit';

const router = Router();
const ragController = new RagController();

// Weaviate hybrid search
router.post('/search', searchLimiter, ragController.hybridSearch.bind(ragController));

// RAG answer endpoint (LLM generation)
router.post('/rag-answer', ragLimiter, ragController.answerRag.bind(ragController));

export default router;
