import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import aiRoutes from './api/routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Log incoming payload sizes
app.use((req: Request, _res: Response, next: Function) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const payloadSize = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    const sizeKB = (payloadSize / 1024).toFixed(2);
    console.log(`[payload] ${req.method} ${req.path} - ${sizeKB} KB (${payloadSize} bytes)`);
  }
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Model Broker!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/ai', aiRoutes);

// Initialize workers and start server
async function start() {
  try {

    // start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // graceful shutdown handler
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('HTTP server closed');
      });

      try {
        console.log('Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();