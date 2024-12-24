// Content script to interact with YouTube page
function extractVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

function injectInsightsOverlay(insights) {
  // Remove existing overlay if present
  const existingOverlay = document.getElementById('youtube-insights-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'youtube-insights-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    z-index: 10000;
    width: 250px;
  `;

  // Populate overlay with insights
  overlay.innerHTML = `
    <h3>Video Insights</h3>
    <p>Views: ${insights.views.toLocaleString()}</p>
    <p>Likes: ${insights.likes.toLocaleString()}</p>
    <p>Comments: ${insights.comments.toLocaleString()}</p>
    <div>
      <strong>Tags:</strong>
      <div>${insights.tags.map(tag => `<span style="background:blue; margin:2px; padding:2px; border-radius:3px;">${tag}</span>`).join('')}</div>
    </div>
    <div>
      <strong>Recommended Tags:</strong>
      <div>${insights.recommendedTags.map(tag => `<span style="background:green; margin:2px; padding:2px; border-radius:3px;">${tag}</span>`).join('')}</div>
    </div>
  `;

  document.body.appendChild(overlay);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'initializeOverlay') {
    const videoId = extractVideoId();
    if (videoId) {
      chrome.runtime.sendMessage(
        { action: 'fetchVideoInsights', videoId }, 
        response => {
          if (response.success) {
            injectInsightsOverlay(response.insights);
          }
        }
      );
    }
  }
});

// Automatically trigger insights when page loads
document.addEventListener('DOMContentLoaded', () => {
  const videoId = extractVideoId();
  if (videoId) {
    chrome.runtime.sendMessage(
      { action: 'fetchVideoInsights', videoId }, 
      response => {
        if (response.success) {
          injectInsightsOverlay(response.insights);
        }
      }
    );
  }
});
