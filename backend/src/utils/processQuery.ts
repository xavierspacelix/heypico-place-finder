import axios from 'axios';
import { OllamaResponse } from '../types';

export async function processUserQuery(query: string): Promise<{ location: string; type: string }> {
  console.log(`Processing query with Open WebUI: ${query}`);
  try {
    const response = await axios.post<OllamaResponse>(
      process.env.OPENWEBUI_URL || 'http://openwebui:8080/api/v1/chat/completions',
      {
        model: process.env.LLM_MODEL || 'phi',
        messages: [
          {
            role: 'system',
            content: 'Extract the location and type of place (e.g., restaurant, tourist attraction) from the user query. Return in JSON format: {"location": "city", "type": "place_type"}.',
          },
          { role: 'user', content: query },
        ],
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const result = JSON.parse(response.data.message.content);
    console.log(`Open WebUI result: ${JSON.stringify(result)}`);
    return { location: result.location || 'Jakarta', type: result.type || 'restaurant' };
  } catch (error: unknown) {
    console.error('Error calling Open WebUI:', error);
    console.log('Falling back to regex parsing');
    const lowerQuery = query.toLowerCase();
    let location = 'Jakarta';
    let type = 'restaurant';

    const typeMap: { [key: string]: string } = {
      restaurant: 'restaurant',
      eat: 'restaurant',
      cafe: 'cafe',
      coffee: 'cafe',
      tourist: 'tourist_attraction',
      attraction: 'tourist_attraction',
      'place to go': 'tourist_attraction',
      park: 'park',
      museum: 'museum',
    };

    for (const [keyword, placeType] of Object.entries(typeMap)) {
      if (lowerQuery.includes(keyword)) {
        type = placeType;
        break;
      }
    }

    const locationMatch = lowerQuery.match(/in\s+([a-zA-Z\s]+)(?=\s|$)/);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }

    console.log(`Fallback result: { location: "${location}", type: "${type}" }`);
    return { location, type };
  }
}