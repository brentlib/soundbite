import { Request, Response } from 'express';
import WeaviateService from '../classes/weaviateService';
import { generateHydeSnippet } from '../classes/hydeService';
import { extractKeywords } from '../classes/keywordExtractionService';
import EmbeddingService from '../classes/embeddingService';
import RerankerService, { RerankDocument } from '../classes/rerankerService';
import { answerRag } from '../classes/answerRagService';

const embeddingService = new EmbeddingService();
const weaviateService = new WeaviateService();
const rerankerService = new RerankerService();

export class RagController {

  async hybridSearch(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        alpha = 0.50,
        weaviateLimit = 30,
        rerankerLimit = 10
      } = req.body;

      const isNonEmptyString = (value: unknown): value is string =>
        typeof value === 'string' && value.trim().length > 0;

      if (!isNonEmptyString(query)) {
        res.status(400).json({ error: 'query is required and must be a non-empty string' });
        return;
      }

      if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) {
        res.status(400).json({ error: 'alpha must be a number between 0 and 1' });
        return;
      }

      if (typeof weaviateLimit !== 'number' || weaviateLimit <= 0 || !Number.isInteger(weaviateLimit)) {
        res.status(400).json({ error: 'limit must be a positive integer' });
        return;
      }

      if (typeof rerankerLimit !== 'number' || rerankerLimit <= 0 || !Number.isInteger(rerankerLimit)) {
        res.status(400).json({ error: 'rerankerLimit must be a positive integer' });
        return;
      }

      const [keywords, hydeSnippet] = await Promise.all([
        extractKeywords(query),
        generateHydeSnippet(query)
      ]);
      const collection = 'YoutubeVideos';

      const embeddingResponse = await embeddingService.openAiEmbeddings({ input: hydeSnippet, model: 'text-embedding-3-large', dimensions: 1024 });
      const vector = embeddingResponse.data[0].embedding;

      const searchResults = await weaviateService.hybridSearch({
        keywords,
        vector,
        collection,
        alpha,
        limit: weaviateLimit
      });

      // Rerank on the chunk text; the rest of each object rides along so we can return it intact.
      const candidates: RerankDocument[] = searchResults.map((result) => ({
        id: result.id,
        text: String((result.properties as Record<string, unknown>)?.chunk_text ?? ''),
        properties: result.properties,
        score: result.score
      }));

      const { reranked, remaining } = await rerankerService.rerank(query, candidates, rerankerLimit);

      // Reranked hits first (LLM relevance order), then the untouched tail in search-score order.
      const results = [...reranked, ...remaining].map((doc, index) => ({
        id: doc.id,
        properties: doc.properties,
        score: doc.score,
        reranked: index < reranked.length,
        // 1-based relevance rank from the reranker; null for the un-reranked search-score tail.
        rank: index < reranked.length ? index + 1 : null
      }));

      res.status(200).json(results);
    } catch (error: any) {
      console.error('Error in Weaviate search API:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async answerRag(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        searchResults
      } = req.body;

      const answer = await answerRag(query, searchResults);
      res.status(200).json({
        answer: answer
      });
    } catch (error: any) {
      console.error('Error in RAG answer API:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
