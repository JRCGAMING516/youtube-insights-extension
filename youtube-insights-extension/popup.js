document.addEventListener('DOMContentLoaded', () => {
  // Create a container for insights
  const insightsContainer = document.createElement('div');
  insightsContainer.id = 'insights-container';
  document.body.appendChild(insightsContainer);

  // Query the active tab to get current YouTube video
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab.url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(currentTab.url).search);
      const videoId = urlParams.get('v');
      
      if (videoId) {
        // Request video insights from background script
        chrome.runtime.sendMessage(
          { action: 'fetchVideoInsights', videoId },
          (response) => {
            if (response.success) {
              displayVideoInsights(response.insights);
            } else {
              displayError(response.error);
            }
          }
        );
      } else {
        displayError('No video ID found');
      }
    } else {
      displayError('Not on a YouTube video page');
    }
  });
});

function displayVideoInsights(insights) {
  const container = document.getElementById('insights-container');
  container.innerHTML = `
    <style>
      #insights-container {
        font-family: Arial, sans-serif;
        padding: 15px;
        min-width: 400px;
        max-width: 500px;
      }
      .insight-section {
        margin-bottom: 10px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 5px;
      }
      .insight-title {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 1.1em;
        color: #333;
      }
      .insight-value {
        color: #666;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .tag {
        background-color: #4CAF50;
        color: white;
        padding: 3px 8px;
        border-radius: 3px;
        font-size: 0.8em;
      }
      .performance-metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
    </style>
    <div class="insight-section">
      <div class="insight-title">Performance Metrics</div>
      <div class="insight-value">
        <div class="performance-metric">
          <span>Views:</span>
          <span>${insights.views.toLocaleString()}</span>
        </div>
        <div class="performance-metric">
          <span>Likes:</span>
          <span>${insights.likes.toLocaleString()}</span>
        </div>
        <div class="performance-metric">
          <span>Comments:</span>
          <span>${insights.comments.toLocaleString()}</span>
        </div>
        <div class="performance-metric">
          <span>Engagement Rate:</span>
          <span>${insights.engagementRate}</span>
        </div>
      </div>
    </div>

    <div class="insight-section">
      <div class="insight-title">Video Details</div>
      <div class="insight-value">
        <div class="performance-metric">
          <span>Title:</span>
          <span>${insights.videoDetails.title}</span>
        </div>
        <div class="performance-metric">
          <span>Published:</span>
          <span>${new Date(insights.videoDetails.publishedAt).toLocaleDateString()}</span>
        </div>
        <div class="performance-metric">
          <span>Duration:</span>
          <span>${insights.videoDetails.duration}</span>
        </div>
        <div class="performance-metric">
          <span>Privacy:</span>
          <span>${insights.videoDetails.privacyStatus}</span>
        </div>
      </div>
    </div>

    <div class="insight-section">
      <div class="insight-title">Channel Insights</div>
      <div class="insight-value">
        <div class="performance-metric">
          <span>Channel:</span>
          <span>${insights.channelDetails.channelTitle}</span>
        </div>
        <div class="performance-metric">
          <span>Subscribers:</span>
          <span>${insights.channelDetails.subscriberCount.toLocaleString()}</span>
        </div>
        <div class="performance-metric">
          <span>Total Videos:</span>
          <span>${insights.channelDetails.videoCount}</span>
        </div>
        <div class="performance-metric">
          <span>Total Channel Views:</span>
          <span>${insights.channelDetails.totalViews.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="insight-section">
      <div class="insight-title">Performance Per View</div>
      <div class="insight-value">
        <div class="performance-metric">
          <span>Likes per View:</span>
          <span>${insights.performanceMetrics.likesPerView}%</span>
        </div>
        <div class="performance-metric">
          <span>Comments per View:</span>
          <span>${insights.performanceMetrics.commentsPerView}%</span>
        </div>
      </div>
    </div>

    <div class="insight-section">
      <div class="insight-title">Video Tags</div>
      <div class="tags">
        ${insights.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>

    <div class="insight-section">
      <div class="insight-title">Recommended Tags</div>
      <div class="tags">
        ${insights.recommendedTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>

    <button id="generate-ai-tags">Generate AI Tags</button>
  `;

  // Add event listener for AI tag generation
  document.getElementById('generate-ai-tags').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'generateAITags',
      videoTitle: insights.videoDetails.title,
      existingTags: insights.tags
    }, (response) => {
      if (response.success) {
        const aiTagsContainer = document.createElement('div');
        aiTagsContainer.innerHTML = `
          <div class="insight-section">
            <div class="insight-title">AI Generated Tags (Confidence: ${response.aiTags.confidence * 100}%)</div>
            <div class="tags">
              ${response.aiTags.aiGeneratedTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        `;
        container.appendChild(aiTagsContainer);
      }
    });
  });
}

function displayError(message) {
  const container = document.getElementById('insights-container');
  container.innerHTML = `
    <style>
      #insights-container {
        font-family: Arial, sans-serif;
        padding: 15px;
        min-width: 300px;
        color: red;
      }
    </style>
    <div>Error: ${message}</div>
    <div>Ensure you are on a YouTube video page</div>
  `;
}
