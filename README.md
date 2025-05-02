# ToneCraft

A full-stack application with React frontend and Node.js Express backend that adjusts the tone of text using the Mistral AI API. ToneCraft helps users refine their writing by providing AI-powered tone adjustments from casual to formal with various verbosity levels.

![ToneCraft UI](https://placeholder.com/tonecraft-screenshot.png)

## Features

- ✍️ **Document Management**: Create, edit, and manage text documents
- 🎭 **Tone Adjustment**: Adjust the tone of text from casual to formal (scale of 1-10)
- 📝 **Selective Adjustment**: Choose to adjust specific text selections or entire documents
- 🧩 **Intuitive Interface**: Visual grid for selecting tone and verbosity
- 🔄 **Revision History**: Track changes with undo/redo functionality
- 📱 **Responsive Design**: Works on both desktop and mobile devices

## Project Structure

- `frontend/`: React application built with Vite
- `backend/`: Node.js Express server with Mistral AI integration

## Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Mistral AI API key

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
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

4. Start the development server:
   ```
   nodemon index.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

## How It Works

ToneCraft leverages the Mistral AI API to adjust the tone of text based on user preferences:

1. Users input their text in the document editor
2. Users select tone level (1-10) and verbosity (concise, normal, detailed)
3. The text is sent to the backend API which forwards it to Mistral AI
4. The AI processes the text and returns the tone-adjusted version
5. Users can accept the changes or try different settings

## Detailed Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Technology Stack

### Frontend
- React
- React Router
- Vite
- CSS (custom styling)
- LocalStorage (for document persistence)

### Backend
- Node.js
- Express
- Mistral AI API
- CORS
- dotenv (for environment variables)

## Development

### Running Tests

Currently, this project does not have automated tests. Contributions adding tests are welcome!

### Building for Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```

The frontend build output will be in the `frontend/dist` directory, ready for deployment.

## Deployment

The application can be deployed in various ways:

- **Frontend**: Deploy the contents of `frontend/dist` to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)
- **Backend**: Deploy to a Node.js hosting service (Heroku, DigitalOcean, AWS, etc.)

Remember to set the appropriate environment variables on your backend hosting service.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Mistral AI](https://mistral.ai/) for the powerful AI API
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework 