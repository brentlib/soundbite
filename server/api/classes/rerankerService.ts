import LLMService, { extractOutputText } from './llmService';

const RERANKER_MODEL = 'gpt-5.4-mini';
const MAX_DOC_CHARS = 1500;

export interface RerankDocument {
    id: string;
    text: string;
    [key: string]: unknown;
}

export interface RerankResult {
    // The topK most relevant documents, ordered most-relevant first.
    reranked: RerankDocument[];
    // Everything the reranker did not select, left in the order it came in (search score).
    remaining: RerankDocument[];
}

// The model only ever references candidates by their integer index, never by the real
// document id - so a mistyped/hallucinated id can't corrupt the result set. It returns an
// ordered list of the indices it considers most relevant, best first.
const RANKING_SCHEMA = {
    name: 'reranking',
    strict: true,
    schema: {
        type: 'object',
        properties: {
            ranking: {
                type: 'array',
                description: 'Candidate indices, ordered from most to least relevant.',
                items: { type: 'integer' }
            }
        },
        required: ['ranking'],
        additionalProperties: false
    }
};

class RerankerService {
    private llmService = new LLMService();

    // Selects the topK most relevant documents for the query and returns them ranked
    // best-first. Documents not selected are returned separately, in their original order.
    async rerank(query: string, documents: RerankDocument[], topK: number): Promise<RerankResult> {
        try {
            if (documents.length === 0) {
                return { reranked: [], remaining: [] };
            }

            // Can't select more than we were given.
            const k = Math.min(topK, documents.length);

            const serializedDocs = documents
                .map((doc, index) => `[${index}] ${doc.text.slice(0, MAX_DOC_CHARS)}`)
                .join('\n\n');

            const instructions = `You are reranking candidate documents for a search query.
From the ${documents.length} candidates below, choose the ${k} MOST relevant to the query and return their indices ordered from most to least relevant.

Rules:
- Return exactly ${k} indices.
- Use only indices from the candidate list (0 to ${documents.length - 1}).
- Each index must appear at most once.
- Order matters: the first index is the single most relevant document.
- Rank only your ${k} selected documents. Do not include the less-relevant candidates.`;

            const prompt = `${instructions}\n\nQuery: ${query}\n\nCandidates:\n${serializedDocs}`;

            const response = await this.llmService.openAiResponses({
                input: [{ role: 'user', content: prompt }],
                model: RERANKER_MODEL,
                reasoning_effort: 'low',
                response_format: 'json_schema',
                response_schema: RANKING_SCHEMA
            });

            const parsed: { ranking: number[] } = JSON.parse(extractOutputText(response));

            // Validate every index the model returned against the candidates we actually sent,
            // so a hallucinated, duplicated, or out-of-range index can never enter the result.
            const selected: number[] = [];
            const seen = new Set<number>();
            for (const index of parsed.ranking) {
                if (!Number.isInteger(index) || index < 0 || index >= documents.length) continue;
                if (seen.has(index)) continue;
                seen.add(index);
                selected.push(index);
                if (selected.length === k) break;
            }

            const reranked = selected.map((index) => documents[index]);
            const remaining = documents.filter((_, index) => !seen.has(index));

            // Partition invariant: every input document lands in exactly one bucket, none invented.
            return { reranked, remaining };
        } catch (error) {
            console.error('Error in RerankerService.rerank:', error);
            throw error;
        }
    }
}

export default RerankerService;
