
import axios from 'axios';

interface OpenAiEmbeddingsRequest {
    input: string | string[];
    model: 'text-embedding-3-small' | 'text-embedding-3-large';
    dimensions?: number;
}

class EmbeddingService {
    async openAiEmbeddings(request: OpenAiEmbeddingsRequest) {
        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY environment variable is not set');
            }

            const model = request.model;
            const dimensions = request.dimensions ?? 1024;

            if (model === 'text-embedding-3-small' && dimensions > 1536) {
                throw new Error('Dimensions for text-embedding-3-small must not be greater than 1536');
            }

            if (model === 'text-embedding-3-large' && dimensions > 3072) {
                throw new Error('Dimensions for text-embedding-3-large must not be greater than 3072');
            }

            const requestBody = {
                input: request.input,
                model: model,
                dimensions: dimensions
            }

            const endpoint = `https://api.openai.com/v1/embeddings`;

            const headers = {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }

            const response = await axios.post(endpoint, requestBody, { headers });
            return response.data;
        } catch (error) {
            console.error('Error in openAiEmbeddings service:', error);
            throw error;
        }
    }
}

export default EmbeddingService;