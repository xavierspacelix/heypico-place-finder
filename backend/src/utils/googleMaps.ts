import axios from 'axios';
import { PlaceResult } from '../types';

export async function fetchPlaces(location: string, type: string): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API Key is missing');
  }

  const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(type + ' in ' + location)}&key=${apiKey}`;
  console.log(`Calling Google Maps API: ${placesUrl}`);
  const response = await axios.get(placesUrl);
  return response.data.results.slice(0, 5).map((place: any) => ({
    name: place.name,
    address: place.formatted_address,
    location: place.geometry.location,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.formatted_address)}`,
  }));
}