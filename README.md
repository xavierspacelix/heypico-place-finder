# Places Finder

A production-ready application that integrates a Local Language Model (via Open WebUI and Ollama) with Google Maps API to search for places based on user queries.

## Prerequisites
- Docker and Docker Compose
- Google Cloud account with Places API and Maps JavaScript API enabled
- API Key for Google Maps

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/xavierspacelix/heypico-place-finder.git
   cd heypico-place-finder
   ```

2. Create a `.env` file in the `backend` directory with the following:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   PORT=3001
   OPENWEBUI_URL=http://openwebui:8080/api/v1/chat/completions
   LLM_MODEL=phi
   REDIS_HOST=redis
   REDIS_PORT=6379
   FRONTEND_URL=http://frontend:3000
   ```

3. Create a `.env` file in the `frontend` directory with:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. Pull the Phi-2 model for Ollama:
   ```bash
   docker-compose run ollama ollama pull phi
   ```

5. Start the application:
   ```bash
   docker-compose up -d
   ```

6. Access the application at `http://localhost:3000`.

## Notes
- The application uses Phi-2 as the default LLM. Replace with `tinyllama` for lower resource usage if needed.
- Redis is used for caching in production.
- Rate limiting is enabled to prevent API abuse.

## Troubleshooting
- Ensure Google Maps API Key is valid and enabled for Places API and Maps JavaScript API.
- Verify Ollama and Open WebUI are running (`http://localhost:8080` for Open WebUI).