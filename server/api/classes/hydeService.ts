import LLMService, { extractOutputText } from './llmService';

const HYDE_MODEL = 'gpt-5.4-mini';

const llmService = new LLMService();

// Generates a hypothetical passage that would answer the query (HyDE), meant to be
// embedded and used as the vector side of a hybrid search instead of embedding the raw query.
export async function generateHydeSnippet(query: string, model: string = HYDE_MODEL, reasoningEffort: string = 'none'): Promise<string> {

    const background = `We are using HyDE as part of a RAG process. We need a hypothetical document generated from the user's query to use in the RAG system.`;
    const instructions = `Write a single paragraph that could appear in a document that addresses the user's query. Write it as a factual excerpt from a reference source - an encyclopedia entry, manual, report, or article - not as a reply to a user. 
    
    Rules:
    - Address the query directly and confidently. Do not hedge, flag uncertainty, ask for clarification, or mention yourself.
    - One tight paragraph, 4-6 sentences.
    - Be dense and specific: use the concrete names, dates, terms, and facts that a real source document on this topic would contain.
    - Plain prose only. No greeting, no preamble ("Here is..."), no headings, no bullet points, no closing remark.`;

    const systemPrompt = `--- BACKGROUND ---\n${background}\n--- INSTRUCTIONS ---\n${instructions}`;
    const userPrompt = `Query: ${query}`;

    const response = await llmService.openAiResponses({
        input: [
            { role: 'system', content: systemPrompt},
            { role: 'user', content: userPrompt }
        ],
        model: model,
        max_output_tokens: 450,
        reasoning_effort: reasoningEffort as 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh',
        response_format: 'text'
    });

    return extractOutputText(response);
}