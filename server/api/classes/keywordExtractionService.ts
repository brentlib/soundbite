import LLMService, { extractOutputText } from './llmService';

const KEYWORD_MODEL = 'gpt-5.4-mini';

const llmService = new LLMService();

const KEYWORD_SCHEMA = {
    name: 'extracted_keywords',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            keywords: {
                type: 'array',
                items: { type: 'string' }
            }
        },
        required: ['keywords'],
        additionalProperties: false
    }
};

// Extracts a keyword string from the query, suitable for the BM25 side of a hybrid search.
export async function extractKeywords(query: string): Promise<string> {
    const prompt = `Extract the most important search keywords/phrases from the following query, suitable for a BM25 keyword search. Return 3-8 keywords, no stop words, no duplicates.\n\nQuery: ${query}`;

    const response = await llmService.openAiResponses({
        input: [{ role: 'user', content: prompt }],
        model: KEYWORD_MODEL,
        max_output_tokens: 150,
        reasoning_effort: 'none',
        response_format: 'json_schema',
        response_schema: KEYWORD_SCHEMA
    });

    const text = extractOutputText(response);
    const parsed: { keywords: string[] } = JSON.parse(text);
    return parsed.keywords.join(' ');
}
