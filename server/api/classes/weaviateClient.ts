import weaviate, { WeaviateClient } from 'weaviate-client';

let clientPromise: Promise<WeaviateClient> | null = null;

async function createClient(): Promise<WeaviateClient> {
    const mode = process.env.WEAVIATE_CONNECTION_MODE ?? 'local';

    if (mode === 'cloud') {
        const clusterUrl = process.env.WEAVIATE_CLUSTER_URL;
        const apiKey = process.env.WEAVIATE_API_KEY;
        if (!clusterUrl || !apiKey) {
            throw new Error('Weaviate cloud mode selected but WEAVIATE_CLUSTER_URL / WEAVIATE_API_KEY are not set');
        }
        // Skeleton for deployed Weaviate - fill in further options (headers, timeout) once cluster details are known
        return weaviate.connectToWeaviateCloud(clusterUrl, {
            authCredentials: new weaviate.ApiKey(apiKey),
        });
    }

    // Note: host-mapped ports from docker-compose (8090/50052) differ from the
    // client library's own defaults (8080/50051) - these defaults must match the mapped ports.
    return weaviate.connectToLocal({
        host: process.env.WEAVIATE_HOST ?? 'localhost',
        port: Number(process.env.WEAVIATE_PORT ?? 8090),
        grpcPort: Number(process.env.WEAVIATE_GRPC_PORT ?? 50052),
    });
}

export async function getWeaviateClient(): Promise<WeaviateClient> {
    if (!clientPromise) {
        clientPromise = createClient().catch((error) => {
            clientPromise = null;
            throw error;
        });
    }
    return clientPromise;
}
