# KidMate App

A React Native application for managing child pickup services with location tracking.

## Features

- Child pickup management
- Journey tracking with drop-off location selection
- Google Places API integration for location search
- Real-time status updates
- Payment integration

## Setup

### Prerequisites

- Node.js and npm
- Expo CLI
- Google Places API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/davido15/kidmate-app.git
cd kidmate-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google Places API key:
   - Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Create a `.env` file in the root directory
   - Add your API key:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

4. Start the development server:
```bash
npx expo start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Security Notes

- Never commit API keys to version control
- The `.gitignore` file is configured to exclude sensitive files
- API keys are loaded from environment variables

## Project Structure

```
app/
├── components/          # Reusable components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── api/               # API client and endpoints
├── auth/              # Authentication utilities
└── config/            # Configuration files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 