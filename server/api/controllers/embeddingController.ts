import { Request, Response } from 'express';
import EmbeddingService from '../classes/embeddingService';

const embeddingService = new EmbeddingService();

const EMBEDDING_MODELS = ['text-embedding-3-small', 'text-embedding-3-large'] as const;
type EmbeddingModel = typeof EMBEDDING_MODELS[number];

export class EmbeddingController {

  async createEmbedding(req: Request, res: Response): Promise<void> {
    try {
      const { 
        input,
        model = 'text-embedding-3-large',
        dimensions = 512
      } = req.body;

      // Validation: input must be a non-empty string or a non-empty array of non-empty strings
      const isNonEmptyString = (value: unknown): value is string =>
        typeof value === 'string' && value.trim().length > 0;

      const isValidInput =
        isNonEmptyString(input) ||
        (Array.isArray(input) && input.length > 0 && input.every(isNonEmptyString));

      if (!isValidInput) {
        res.status(400).json({
          error: 'Input is required and must be a non-empty string or a non-empty array of non-empty strings'
        });
        return;
      }

      // Validation: model must be valid
      if (!EMBEDDING_MODELS.includes(model)) {
        res.status(400).json({ 
          error: `Model must be one of: ${EMBEDDING_MODELS.join(', ')}` 
        });
        return;
      }

      // Validation: dimensions must be a positive number if provided
      if (dimensions !== undefined) {
        if (typeof dimensions !== 'number' || dimensions <= 0 || !Number.isInteger(dimensions)) {
          res.status(400).json({ error: 'Dimensions must be a positive integer' });
          return;
        }
      }

      const response = await embeddingService.openAiEmbeddings({
        input,
        model: model as EmbeddingModel,
        dimensions
      });

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in Embedding API:', error);

      if (error.response) {
        res.status(error.response.status || 500).json({
          error: error.response.data?.error?.message || 'Error from Embedding API',
          details: error.response.data
        });
      } else if (error.message) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}