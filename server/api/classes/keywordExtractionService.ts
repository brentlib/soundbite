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
export async function extractKeywords(query: string, model: string = KEYWORD_MODEL, reasoningEffort: string = 'none'): Promise<string> {
    const prompt = `Extract the highest-signal keywords from the query for a BM25 keyword search.

Rules:
- Return nouns only, including proper nouns. Never return adjectives, adverbs, or verbs.
- Return only words copied verbatim from the query. Do not add, infer, expand, paraphrase, normalize, or substitute terms.
- Exclude stop words and duplicates.
- Return up to five distinct keywords, ordered by importance. Return an empty list only if the query contains no usable nouns.

Query: ${query}`;

    const response = await llmService.openAiResponses({
        input: [{ role: 'user', content: prompt }],
        model: model,
        max_output_tokens: 100,
        reasoning_effort: reasoningEffort as 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh',
        response_format: 'json_schema',
        response_schema: KEYWORD_SCHEMA
    });

    const text = extractOutputText(response);
    const parsed: { keywords: string[] } = JSON.parse(text);
    return parsed.keywords.join(' ');
}
