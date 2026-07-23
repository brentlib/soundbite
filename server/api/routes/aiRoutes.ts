import { Router } from 'express';
import { RagController } from '../controllers/ragController';
// import { LLMController } from '../controllers/llmController';
import { searchLimiter, ragLimiter } from '../middleware/rateLimit';

const router = Router();
const ragController = new RagController();
// const llmController = new LLMController();

// Weaviate hybrid search
router.post('/search', searchLimiter, ragController.hybridSearch.bind(ragController));

// RAG answer endpoint (LLM generation)
router.post('/rag-answer', ragLimiter, ragController.answerRag.bind(ragController));

// EXPERIMENTAL ENDPOINTS
// router.post('/hyde', llmController.hydeResponses.bind(llmController));
// router.post('/keyword-extraction', llmController.keywordExtractionResponses.bind(llmController));
// router.post('/xai', llmController.xaiResponses.bind(llmController));

export default router;
