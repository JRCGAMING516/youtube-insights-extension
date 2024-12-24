# YouTube Insights Chrome Extension

## Features
- Comprehensive YouTube video analytics
- Real-time performance metrics
- Channel and video insights
- Engagement rate calculation
- Tag recommendations
- AI-powered tag generation (placeholder)

## Detailed Analytics Breakdown
- Performance Metrics
  - Views
  - Likes
  - Comments
  - Engagement Rate

- Video Details
  - Title
  - Publication Date
  - Duration
  - Privacy Status

- Channel Insights
  - Subscriber Count
  - Total Videos
  - Total Channel Views

- Performance Per View
  - Likes per View
  - Comments per View

## Prerequisites
- Chrome Browser
- YouTube Data API Key (free from Google Cloud Console)

## Installation
1. Obtain a YouTube Data API Key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable YouTube Data API v3
   - Create credentials (API Key)

2. Configure the Extension:
   - Open `background.js`
   - Replace `'YOUR_YOUTUBE_DATA_API_KEY'` with your actual API key

3. Load the Extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

## Security Warning
⚠️ **IMPORTANT**: Never share your API key publicly. If you believe your key has been exposed:
1. Go to Google Cloud Console
2. Navigate to Credentials
3. Create a new API key
4. Invalidate the old key

## Development
- Requires Chrome Browser
- Manifest V3 compatible
- Node.js and npm for packaging

## Packaging
```bash
npm install
npm run package
```

## Roadmap
- [x] Add more detailed analytics
- [ ] Implement advanced AI tag suggestion
- [ ] Create interactive dashboard
- [ ] Add historical performance tracking
- [ ] Integrate with content creator tools

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Troubleshooting
- Ensure API key is correctly set
- Check Chrome Developer Console for any errors
- Verify YouTube Data API is enabled in Google Cloud Console
