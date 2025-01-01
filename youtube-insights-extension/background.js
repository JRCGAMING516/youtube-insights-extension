// YouTube Data API integration
const API_KEY = ' YOUR YOUTUBE DATA API KEY HERE'; // User-provided YouTube Data API key

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchVideoInsights') {
    fetchVideoData(request.videoId)
      .then(insights => {
        sendResponse({ success: true, insights });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates we wish to send a response asynchronously
  }
});

async function fetchVideoData(videoId) {
  try {
    // Fetch video statistics
    const statsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails,status&id=${videoId}&key=${API_KEY}`
    );
    const statsData = await statsResponse.json();

    // Validate video data
    if (!statsData.items || statsData.items.length === 0) {
      throw new Error('No video data found');
    }

    const video = statsData.items[0];
    const statistics = video.statistics || {};
    const snippet = video.snippet || {};
    const contentDetails = video.contentDetails || {};
    const status = video.status || {};

    // Fetch channel details for additional context
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=${snippet.channelId}&key=${API_KEY}`
    );
    const channelData = await channelResponse.json();
    const channelStats = channelData.items[0]?.statistics || {};

    // Fetch related videos for tag suggestions
    const relatedResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&key=${API_KEY}&maxResults=5`
    );
    const relatedData = await relatedResponse.json();

    // Calculate engagement metrics
    const views = parseInt(statistics.viewCount || 0);
    const likes = parseInt(statistics.likeCount || 0);
    const comments = parseInt(statistics.commentCount || 0);
    const engagementRate = views > 0 
      ? ((likes + comments) / views * 100).toFixed(2) 
      : 0;

    return {
      // Basic Metrics
      views,
      likes,
      comments,
      engagementRate: `${engagementRate}%`,

      // Advanced Video Metrics
      videoDetails: {
        title: snippet.title,
        publishedAt: snippet.publishedAt,
        duration: contentDetails.duration,
        privacyStatus: status.privacyStatus,
        category: snippet.categoryId
      },

      // Channel Metrics
      channelDetails: {
        channelTitle: snippet.channelTitle,
        subscriberCount: parseInt(channelStats.subscriberCount || 0),
        videoCount: parseInt(channelStats.videoCount || 0),
        totalViews: parseInt(channelStats.viewCount || 0)
      },

      // Tags and Recommendations
      tags: snippet.tags || [],
      recommendedTags: relatedData.items 
        ? relatedData.items.map(item => 
            item.snippet && item.snippet.title 
              ? item.snippet.title.split(' ')[0] 
              : 'Unknown'
          ).slice(0, 5)
        : [],

      // Performance Comparisons
      performanceMetrics: {
        likesPerView: views > 0 ? (likes / views * 100).toFixed(2) : 0,
        commentsPerView: views > 0 ? (comments / views * 100).toFixed(2) : 0
      }
    };
  } catch (error) {
    console.error('YouTube API Full Error:', error);
    
    // If it's a fetch error, try to get more details
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}`);
    }
    
    throw new Error(`Failed to fetch video insights: ${error.message}`);
  }
}

// AI-Powered Tag Suggestion (Placeholder)
async function generateAITags(videoTitle, existingTags) {
  // TODO: Implement actual AI tag generation
  // This could use OpenAI, Google Cloud NLP, or a custom ML model
  return {
    aiGeneratedTags: [
      'trending',
      'viral',
      'recommended',
      'must-watch',
      'insights'
    ],
    confidence: 0.75
  };
}

// Add message listener for AI tag generation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateAITags') {
    generateAITags(request.videoTitle, request.existingTags)
      .then(aiTags => {
        sendResponse({ success: true, aiTags });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Optional: Add functionality to track user interactions or gather more data
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /youtube\.com\/watch/.test(tab.url)) {
    chrome.tabs.sendMessage(tabId, { action: 'initializeOverlay' });
  }
});

// Add error handling for API key
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    youtubeApiKey: 'AIzaSyCiF6i8rVbXp-PhpDkoUS2ybzq3_6B04zI'
  }, () => {
    console.log('Default API key set');
  });
});
