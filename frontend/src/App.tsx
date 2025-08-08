import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface PlaceResult {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  mapUrl: string;
}

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Global callback function for Google Maps API
  window.initMap = function () {
    if (window.google && window.google.maps && mapRef.current) {
      try {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: -6.2088, lng: 106.8456 }, // Default: Jakarta
          zoom: 12,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#ffffff' }],
            },
            {
              featureType: 'all',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#000000' }, { weight: 2 }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#38414e' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#17263c' }],
            },
          ],
        });
        setMap(mapInstance);
        setMapError(null);
        console.log('Google Maps API loaded and map initialized');
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map. Please try again later.');
      }
    } else {
      console.error('Google Maps API not available');
      setMapError('Google Maps API failed to load.');
    }
  };

  // Update map when a place is selected
  useEffect(() => {
    if (selectedPlace && map) {
      map.setCenter(selectedPlace.location);
      new google.maps.Marker({
        position: selectedPlace.location,
        map,
        title: selectedPlace.name,
        animation: google.maps.Animation.DROP,
      });
    }
  }, [selectedPlace, map]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post<{ places: PlaceResult[] }>('/api/places', { query });
      setPlaces(response.data.places);
      if (response.data.places.length > 0) {
        setSelectedPlace(response.data.places[0]);
      }
      setMapError(null);
    } catch (error) {
      console.error('Error fetching places:', error);
      setMapError('Failed to fetch places. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-3xl font-bold text-center">Places Finder</h1>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {mapError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-pulse">
            {mapError}
          </div>
        )}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., restaurants in Jakarta"
            className="border rounded-lg p-3 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div ref={mapRef} id="map" className="w-full h-[500px] rounded-lg shadow-md"></div>
          </div>
          <div className="lg:col-span-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ul className="space-y-4">
                {places.map((place, index) => (
                  <li
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPlace(place)}
                  >
                    <h3 className="text-lg font-semibold text-blue-600">{place.name}</h3>
                    <p className="text-gray-600">{place.address}</p>
                    <a
                      href={place.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 Places Finder. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;