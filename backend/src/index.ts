import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { processUserQuery } from './utils/processQuery';
import { fetchPlaces } from './utils/googleMaps';
import { PlaceResult, UserQuery } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

app.use(helmet()); 
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Rate limiting for API
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
  })
);

app.post('/api/places', async (req: Request<{}, {}, UserQuery>, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const cacheKey = `places_${query}`;
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      console.log(`Returning cached result for query: ${query}`);
      return res.json({ places: JSON.parse(cachedResult) });
    }
    const { location, type } = await processUserQuery(query);
    const places: PlaceResult[] = await fetchPlaces(location, type);
    await redis.set(cacheKey, JSON.stringify(places), 'EX', 5 * 60);
    res.json({ places });
  } catch (error) {
    console.error('Error in /api/places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});