import LLMService, { extractOutputText } from './llmService';
import WeaviateService from './weaviateService';

const llmService = new LLMService();
const weaviateService = new WeaviateService();

// Reduce an ISO timestamp to a plain YYYY-MM-DD for the LLM (time-of-day is meaningless here).
function formatDate(publishedAt: unknown): string {
    if (typeof publishedAt !== 'string') return 'unknown';
    return publishedAt.slice(0, 10);
}

// Build a YouTube deep-link to the moment the chunk starts, so the LLM can cite sources.
function sourceUrl(videoId: unknown, startDuration: unknown): string {
    if (typeof videoId !== 'string') return 'unknown';
    const t = typeof startDuration === 'number' ? `&t=${startDuration}s` : '';
    return `https://www.youtube.com/watch?v=${videoId}${t}`;
}

// Renders the ranked search results into a single context block for the LLM. Only reranked
// results are surfaced (in rank order), each wrapped with the chunk immediately before and
// after it so the model sees the surrounding conversation, not just the isolated excerpt.
async function formatSearchResults(searchResults: any[]): Promise<string> {
    const ranked = searchResults
        .filter((r) => r.reranked && r.rank != null)
        .sort((a, b) => a.rank - b.rank);

    if (ranked.length === 0) {
        return 'No results.';
    }

    const blocks = await Promise.all(
        ranked.map(async (result) => {
            const p = result.properties ?? {};
            const { before, after } = await weaviateService.fetchAdjacentChunks(p.video_id, p.chunk_index);
            const speakers = Array.isArray(p.speakers) ? p.speakers.join(', ') : 'unknown';

            return [
                `[Result ${result.rank}]`,
                `Video: ${p.video_title} (published ${formatDate(p.published_at)})`,
                `Speakers: ${speakers}`,
                `Source: ${sourceUrl(p.video_id, p.start_duration)}`,
                ``,
                `Context before:\n${before ?? '(none - start of video)'}`,
                ``,
                `Excerpt:\n${p.chunk_text}`,
                ``,
                `Context after:\n${after ?? '(none - end of video)'}`,
            ].join('\n');
        })
    );

    return blocks.join('\n\n---\n\n');
}

export async function answerRag(query: string, searchResults: any[]) {
    try {
        const formattedResults = await formatSearchResults(searchResults);

        const background = `You answer questions about the All-In Podcast, a show hosted by Chamath Palihapitiya, Jason Calacanis, David Sacks, and David Friedberg covering technology, venture capital, startups, economics, and politics. Your answers are grounded entirely in transcript excerpts retrieved from episodes of the show.`;

        const instructions = `Answer the user's query using only the information contained in the search results. Do not rely on outside knowledge or invent facts.
- Ground every claim in the excerpts. The transcripts label speakers inline as "SPEAKER: Name:" - attribute points to the specific host who made them, and do not merge opposing views, since the hosts frequently disagree.
- Treat each result's Excerpt as the primary source. Use its "Context before" and "Context after" only to interpret or disambiguate the excerpt, not as standalone evidence.
- Higher-ranked results are more relevant; weight them accordingly, but draw on any result that helps answer the query.
- If the results do not contain enough information to answer, say so plainly rather than guessing or speculating.`;

        const content = `You will receive the user's query followed by a set of ranked search results, most relevant first. Each result contains: the video title and publish date, the speakers present in that segment, a Source URL (a timestamped YouTube link), the chunk immediately before and after the match (Context before / Context after), and the retrieved Excerpt itself.`;

        const output = `Respond with a clear, well-organized answer in prose, using short paragraphs (bullet points only when listing distinct items). Attribute key points to the host who made them. When you rely on an excerpt, cite it inline as a Markdown hyperlink whose visible text is the video title and whose destination is that result's Source URL, for example [Episode title](https://www.youtube.com/watch?v=abc123&t=456s), so the user can jump to the moment. Always use this linked-title form and never print a bare URL. If the excerpts are insufficient or off-topic, state that the available episodes don't cover the question rather than speculating.`;

        const systemPrompt = `--- BACKGROUND ---\n${background}\n--- INSTRUCTIONS ---\n${instructions}\n--- CONTENT ---\n${content}\n--- OUTPUT ---\n${output}`;
        const userPrompt = `Query: ${query}\n\nSearch Results:\n${formattedResults}`;

        const response = await llmService.openAiResponses({
            input: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            reasoning_effort: 'medium',
            model: 'gpt-5.4-mini',
            max_output_tokens: 7000,
        });

        const answer = extractOutputText(response);
        return answer;
    } catch (error: any) {
        console.error('Error in RAG answer service:', error);
        throw new Error(error.message || 'Internal server error');
    }
}
