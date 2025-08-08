export interface UserQuery {
  query: string;
}

export interface PlaceResult {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  mapUrl: string;
}

export interface OllamaResponse {
  message: { content: string };
}