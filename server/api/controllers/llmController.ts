import { Request, Response } from 'express';
import LLMService, { InputItem } from '../classes/llmService';
import { generateHydeSnippet } from '../classes/hydeService';
import { extractKeywords } from '../classes/keywordExtractionService';

const llmService = new LLMService();

export class LLMController {

  /**
   * Generate a response from OpenAI
   * POST /api/ai/llm
   */
  async submitLLM(req: Request, res: Response): Promise<void> {
    try {
      const {
        input,
        model,
        max_output_tokens = 1000,
        reasoning_effort = 'low',
        response_format = 'text',
        response_schema,
        tools,
        tool_choice
      } = req.body;

      const response = await llmService.openAiResponses({
        input: input as InputItem[],
        model,
        max_output_tokens,
        response_format,
        ...(response_schema && { response_schema }),
        ...(reasoning_effort && { reasoning_effort }),
        ...(tools && { tools }),
        ...(tool_choice && { tool_choice })
      });

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in LLM API:', error);

      if (error.response) {
        res.status(error.response.status || 500).json({
          error: error.response.data?.error?.message || 'Error from LLM API',
          details: error.response.data
        });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  }

  async xaiResponses(req: Request, res: Response): Promise<void> {
    try {
      const { input, model, max_output_tokens, reasoning_effort, response_format } = req.body;
      const response = await llmService.xAiResponses({
        input: input as InputItem[],
        model,
        max_output_tokens,
        reasoning_effort,
        response_format
      });
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in xAI API:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async hydeResponses(req: Request, res: Response): Promise<void> {
    try {
      const { query, model, reasoningEffort } = req.body;
      const generationStartedAt = Date.now();
      const response = await generateHydeSnippet(query, model, reasoningEffort);
      const generationLatencyMs = Date.now() - generationStartedAt;
      const qualityScore = await llmService.evaluateResponseQuality({
        useCase: 'hyde',
        input: query,
        output: response
      });

      res.status(200).json({ response, qualityScore, generationLatencyMs });
    } catch (error: any) {
      console.error('Error in HyDE API:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async keywordExtractionResponses(req: Request, res: Response): Promise<void> {
    try {
      const { query, model, reasoningEffort } = req.body;
      const generationStartedAt = Date.now();
      const response = await extractKeywords(query, model, reasoningEffort);
      const generationLatencyMs = Date.now() - generationStartedAt;
      const qualityScore = await llmService.evaluateResponseQuality({
        useCase: 'keyword_extraction',
        input: query,
        output: response
      });

      res.status(200).json({ response, qualityScore, generationLatencyMs });
    } catch (error: any) {
      console.error('Error in Keyword Extraction API:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
