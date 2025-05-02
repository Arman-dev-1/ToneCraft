# ToneCraft Backend

A Node.js Express backend service that powers the ToneCraft application, providing an API for adjusting text tone using the Mistral AI API.

## Features

- **RESTful API**: Clean API endpoints for tone adjustment
- **AI Integration**: Leverages Mistral AI for high-quality tone adjustment
- **CORS Support**: Configured for cross-origin requests
- **Error Handling**: Robust error handling and reporting
- **Configurable**: Environment-based configuration

## Directory Structure

```
backend/
├── node_modules/       # Dependencies (generated)
├── .env                # Environment variables (create this file)
├── .gitignore          # Git ignore file
├── index.js            # Main application file
├── package.json        # Dependencies and scripts
├── package-lock.json   # Dependency lock file
└── README.md           # This documentation
```

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Mistral AI API key (get one at [console.mistral.ai](https://console.mistral.ai))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arman-dev-1/ToneCraft.git
   cd ToneCraft/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   PORT=5000
   MISTRAL_API_KEY=your_mistral_api_key_here
   ```

   To get a Mistral API key:
   - Sign up at [mistral.ai](https://console.mistral.ai/)
   - Go to the API keys section in your account
   - Create a new API key
   - Copy the key to your `.env` file

### Running the Server

#### Development Mode

Start the server with hot-reload using nodemon:
```bash
npm run dev
```

#### Production Mode

Start the server in production mode:
```bash
npm start
```

The server will run at the port specified in your `.env` file (default: 5000).

## API Endpoints

### GET `/`
- **Description**: Welcome message
- **Response**: `{ message: "Welcome to ToneCraft API" }`

### GET `/api/health`
- **Description**: Health check endpoint
- **Response**: 
  ```json
  {
    "success": true,
    "status": "healthy",
    "message": "API is running normally",
    "timestamp": "2023-06-15T10:30:00.000Z"
  }
  ```

### GET `/api/data`
- **Description**: Sample data endpoint
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      { "id": 1, "name": "Item 1" },
      { "id": 2, "name": "Item 2" },
      { "id": 3, "name": "Item 3" }
    ]
  }
  ```

### POST `/api/tone`
- **Description**: Adjusts the tone of provided text
- **Request Body**:
  ```json
  {
    "text": "Your text to adjust",
    "toneLevel": 7,
    "verbosityLevel": "normal"
  }
  ```
- **Parameters**:
  - `text` (string, required): The input text to adjust
  - `toneLevel` (number, required): Number from 1 (very casual) to 10 (very formal)
  - `verbosityLevel` (string, optional): One of "concise", "normal", or "detailed". Default is "normal".

- **Response (Success)**:
  ```json
  {
    "success": true,
    "original": "Your text to adjust",
    "toneLevel": 7,
    "verbosityLevel": "normal",
    "adjustedText": "Your adjusted text result"
  }
  ```

- **Response (Error)**:
  ```json
  {
    "success": false,
    "error": "Error Type",
    "message": "Detailed error message"
  }
  ```

## Error Handling

The API implements comprehensive error handling:

- **400 Bad Request**: Missing or invalid parameters
- **401 Unauthorized**: Invalid Mistral API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Internal server errors
- **503 Service Unavailable**: Mistral API timeout

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port the server runs on | 5000 |
| MISTRAL_API_KEY | Your Mistral AI API key | (required) |

## Mistral AI Integration

The backend uses [Mistral AI](https://mistral.ai/) for text tone adjustment. The integration:

1. Sends the user's text with tone level instructions to Mistral
2. Applies pre-processing to ensure consistent results
3. Applies post-processing to clean the response
4. Returns the adjusted text to the client

## Development

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reload

### Adding New Features

To add new endpoints:
1. Define new routes in `index.js`
2. Follow the existing pattern of error handling
3. Return consistent response structures

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your Mistral API key is correct in the `.env` file
2. **CORS Errors**: By default, all origins are allowed. Modify the CORS settings as needed
3. **Connection Timeout**: The API has a 30-second timeout for Mistral API calls

### Logging

The server logs errors to the console. Check these logs for troubleshooting. 