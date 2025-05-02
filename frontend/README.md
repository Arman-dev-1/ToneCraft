# ToneCraft Frontend

A modern React application for adjusting text tone using AI. The frontend provides an intuitive interface for creating, editing, and managing documents with AI-assisted tone adjustment.

## Features

- **Document Management**: Create, edit, save, and delete text documents
- **AI Tone Adjustment**: Adjust the tone of your text from casual to formal
- **Partial Text Adjustment**: Select specific text portions to adjust
- **Advanced Tone Controls**: Visual grid for fine-tuning tone and verbosity
- **Preset Tones**: Quick access to common tone presets
- **Revision History**: Undo/redo document changes
- **Responsive Design**: Works on desktop and mobile devices

## Directory Structure

```
frontend/
├── public/            # Static files
├── src/               # Source code
│   ├── assets/        # Images and other assets
│   ├── components/    # Reusable UI components
│   │   ├── AlertBanner.jsx     # Alert notification component
│   │   ├── LoadingSpinner.jsx  # Loading indicator component
│   │   └── ...
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   │   ├── DocumentList.jsx    # Document list component
│   │   ├── DocumentListPage.jsx # Document list page
│   │   ├── Editor.jsx          # Document editor page
│   │   └── ...
│   ├── utils/         # Utility functions
│   │   ├── api.js     # API communication functions
│   │   └── ...
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # Application entry point
│   ├── App.css        # Global styles
│   └── index.css      # Base styles
├── .gitignore         # Git ignore file
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── README.md          # This documentation
```

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arman-dev-1/ToneCraft.git
   cd ToneCraft/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API connection:
   - Make sure the backend server is running (see ../backend/README.md)
   - The default configuration connects to the backend at http://localhost:5000
   - If your backend runs on a different URL, update the API base URL in `src/utils/api.js`

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

1. Create an optimized production build:
   ```bash
   npm run build
   ```

2. Preview the production build locally (optional):
   ```bash
   npm run preview
   ```

3. The build output will be in the `dist` directory, ready for deployment

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint to check for code issues

## Key Components

### Editor (src/pages/Editor.jsx)
The main document editing interface with tone adjustment capabilities.

### DocumentListPage (src/pages/DocumentListPage.jsx)
The home page showing all saved documents.

### Tone Grid
An intuitive 3x3 grid interface for selecting tone and verbosity levels.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request
