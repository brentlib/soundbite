import { Filters } from 'weaviate-client';
import { getWeaviateClient } from './weaviateClient';

interface WeaviateHybridSearchRequest {
    keywords: string;
    vector: number[];
    collection?: string;
    alpha?: number;
    limit?: number;
    queryProperties?: string[];
}

interface AdjacentChunks {
    before: string | null;
    after: string | null;
}

class WeaviateService {
    async hybridSearch(request: WeaviateHybridSearchRequest) {
        try {
            const client = await getWeaviateClient();
            const collection = client.collections.get(request.collection ?? 'YoutubeVideos');

            const result = await collection.query.hybrid(request.keywords, {
                vector: request.vector,
                alpha: request.alpha ?? 0.50,
                limit: request.limit ?? 20,
                ...(request.queryProperties && { queryProperties: request.queryProperties }),
                returnMetadata: ['score', 'explainScore'],
            });

            return result.objects.map((obj) => ({
                id: obj.uuid,
                properties: obj.properties,
                score: obj.metadata?.score,
                explainScore: obj.metadata?.explainScore,
            }));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Fetches the chunk_text of the chunks immediately before and after a result chunk
    // (same video, chunk_index +/- 1) so callers can give an LLM the surrounding context.
    // Either side may be null when the result is the first or last chunk of the video.
    async fetchAdjacentChunks(
        videoId: string,
        chunkIndex: number,
        collectionName = 'YoutubeVideos'
    ): Promise<AdjacentChunks> {
        try {
            const client = await getWeaviateClient();
            const collection = client.collections.get(collectionName);

            const neighborIndices = [chunkIndex - 1, chunkIndex + 1].filter((i) => i >= 0);
            if (neighborIndices.length === 0) {
                return { before: null, after: null };
            }

            const indexFilters = neighborIndices.map((i) =>
                collection.filter.byProperty('chunk_index').equal(i)
            );

            const result = await collection.query.fetchObjects({
                filters: Filters.and(
                    collection.filter.byProperty('video_id').equal(videoId),
                    indexFilters.length === 1 ? indexFilters[0] : Filters.or(...indexFilters)
                ),
                returnProperties: ['chunk_index', 'chunk_text'],
                limit: neighborIndices.length,
            });

            let before: string | null = null;
            let after: string | null = null;
            for (const obj of result.objects) {
                const idx = obj.properties.chunk_index as number;
                const text = obj.properties.chunk_text as string;
                if (idx === chunkIndex - 1) before = text;
                else if (idx === chunkIndex + 1) after = text;
            }

            return { before, after };
        } catch (error) {
            console.error('Error in WeaviateService.fetchAdjacentChunks:', error);
            throw error;
        }
    }
}

export default WeaviateService;
