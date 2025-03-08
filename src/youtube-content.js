// Use CommonJS import style for better compatibility with webpack
const { YoutubeTranscript } = require('youtube-transcript');

/**
 * YouTube Content Script for extracting video information and transcript
 * Uses the youtube-transcript npm package for reliable transcript extraction
 */

// Flag to indicate script is fully loaded
let contentScriptReady = false;

// Extract video title
const extractVideoTitle = () => {
  const titleElement = document.querySelector('h1.ytd-watch-metadata');
  return titleElement ? titleElement.textContent.trim() : 'Title not found';
};

// Extract video creator/channel name
const extractChannelName = () => {
  // Updated selector to find channel name in the correct location
  const channelElement = document.querySelector('#header-text #title.ytd-video-description-infocards-section-renderer');
  
  // Fallback to original selector if the new one doesn't work
  if (!channelElement) {
    const originalChannelElement = document.querySelector('ytd-channel-name yt-formatted-string#text');
    return originalChannelElement ? originalChannelElement.textContent.trim() : 'Channel not found';
  }
  
  return channelElement.textContent.trim();
};

// Extract video description from meta tag
const extractVideoDescription = () => {
  const metaDescription = document.querySelector('meta[name="description"]');
  return metaDescription ? metaDescription.getAttribute('content') : 'Description not available';
};

// Format transcript data into a continuous text without timestamps
const formatTranscript = (transcriptData) => {
  if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
    return 'No transcript data available';
  }
  
  // Concatenate all text segments with spaces, removing timestamps
  return transcriptData.map(segment => segment.text.trim())
    .join(' ')
    .replace(/\s+/g, ' '); // Replace multiple spaces with a single space
};

// Extract YouTube comments 
const extractComments = () => {
  try {
    console.log('Extracting comments...');
    
    // Get all comment elements
    const commentElements = document.querySelectorAll('ytd-comment-thread-renderer');
    
    if (!commentElements || commentElements.length === 0) {
      console.log('No comments found or comments not loaded yet');
      return 'No comments available. Comments might be disabled for this video or not loaded yet.';
    }
    
    console.log(`Found ${commentElements.length} comments`);
    
    // Extract data from each comment (limit to top 20 comments to avoid performance issues)
    const maxComments = 20;
    const comments = [];
    
    for (let i = 0; i < Math.min(commentElements.length, maxComments); i++) {
      const commentElement = commentElements[i];
      
      // Extract author name
      const authorElement = commentElement.querySelector('#author-text');
      const author = authorElement ? authorElement.textContent.trim() : 'Unknown user';
      
      // Extract comment text - using the structure provided in the HTML snippet
      const contentTextElement = commentElement.querySelector('#content-text, yt-attributed-string[id="content-text"]');
      let commentText = 'Comment text not found';
      
      if (contentTextElement) {
        // Get all text spans
        const textSpans = contentTextElement.querySelectorAll('span.yt-core-attributed-string');
        if (textSpans && textSpans.length > 0) {
          commentText = Array.from(textSpans)
            .map(span => span.textContent.trim())
            .join(' ');
        } else {
          // Fallback - try to get text directly
          commentText = contentTextElement.textContent.trim();
        }
      }
      
      // Extract likes if available
      const likeCountElement = commentElement.querySelector('#vote-count-middle');
      const likes = likeCountElement ? likeCountElement.textContent.trim() : '0';
      
      comments.push({
        author,
        text: commentText,
        likes
      });
    }
    
    return comments;
  } catch (error) {
    console.error('Error extracting comments:', error);
    return `Error extracting comments: ${error.message}`;
  }
};

// Main function to extract all video data
const extractVideoData = async () => {
  try {
    // Extract basic video metadata
    const title = extractVideoTitle();
    const channel = extractChannelName();
    const description = extractVideoDescription();
    
    // Get the current video URL with any parameters
    const fullVideoUrl = window.location.href;
    
    // Extract just the video ID for consistent identification
    const videoId = new URLSearchParams(window.location.search).get('v');
    
    console.log('Extracting transcript for video ID:', videoId);
    console.log('From URL:', fullVideoUrl);
    
    // Clear any existing transcript data first
    await clearExistingTranscriptData();
    
    // Extract transcript using the npm package - this is the key part that uses the package
    const transcriptData = await YoutubeTranscript.fetchTranscript(fullVideoUrl);
    const formattedTranscript = formatTranscript(transcriptData);
    
    console.log('Transcript data extracted:', transcriptData.length, 'segments');
    
    // Extract comments
    console.log('Starting comment extraction...');
    const comments = extractComments();
    console.log('Comment extraction complete, found:', Array.isArray(comments) ? comments.length : 'error');
    
    // Return the complete video data object
    return {
      videoId: videoId, // Include the video ID for verification
      videoTitle: title,
      channelName: channel,
      videoDescription: description,
      transcript: formattedTranscript,
      comments: comments, // Add the comments to the data structure
      transcriptLanguage: transcriptData.length > 0 ? transcriptData[0].lang : 'unknown',
      extractedAt: new Date().toISOString() // Add timestamp for debugging
    };
  } catch (error) {
    console.error('Error extracting video data:', error);
    
    // Determine error type and provide appropriate message
    let errorMessage = 'Failed to extract transcript';
    
    if (error.message && error.message.includes('Transcript is disabled')) {
      errorMessage = 'Transcript is not available for this video. The creator may have disabled it.';
    } else if (error.message && error.message.includes('No transcript available')) {
      errorMessage = 'No transcript is available for this video.';
    } else if (error.message && error.message.includes('too many requests')) {
      errorMessage = 'YouTube is limiting transcript access due to too many requests. Please try again later.';
    } else if (error.message && error.message.includes('unavailable')) {
      errorMessage = 'The video appears to be unavailable or private.';
    } else {
      errorMessage = `Error getting transcript: ${error.message}`;
    }
    
    // Return what we could get, with error message for transcript
    return {
      videoId: new URLSearchParams(window.location.search).get('v'),
      videoTitle: extractVideoTitle(),
      channelName: extractChannelName(),
      videoDescription: extractVideoDescription(),
      transcript: errorMessage,
      comments: extractComments(), // Still try to extract comments
      error: true,
      message: errorMessage,
      extractedAt: new Date().toISOString() // Add timestamp for debugging
    };
  }
};

// Function to clear existing transcript data 
const clearExistingTranscriptData = async () => {
  return new Promise((resolve) => {
    // Get and log existing data for debugging
    chrome.storage.local.get(['youtubeVideoData'], (result) => {
      if (result.youtubeVideoData) {
        console.log('Clearing existing transcript data:', 
          result.youtubeVideoData.videoId || 'Unknown ID');
      } else {
        console.log('No existing transcript data found');
      }
      
      // Remove specifically the youtubeVideoData object
      chrome.storage.local.remove('youtubeVideoData', () => {
        console.log('Existing transcript data cleared');
        resolve();
      });
    });
  });
};

// Function to extract and save video data
const extractAndSaveVideoData = async () => {
  try {
    // Wait for the page to be fully loaded if needed
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve);
      });
    }
    
    // Give a moment for YouTube's dynamic content to load if needed
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Starting video data extraction...');
    
    // Extract all video data
    const videoData = await extractVideoData();
    
    // Save to Chrome storage
    chrome.storage.local.set({ youtubeVideoData: videoData }, () => {
      console.log('YouTube video data saved to storage for video:', videoData.videoId);
      console.log('Data extraction timestamp:', videoData.extractedAt);
    });
  } catch (error) {
    console.error('Error in YouTube content script:', error);
    
    // Save error message to storage
    chrome.storage.local.set({ 
      youtubeVideoData: {
        error: true,
        message: error.message || 'Unknown error occurred',
        extractedAt: new Date().toISOString()
      }
    });
  }

  // Verify storage
  chrome.storage.local.get(['youtubeVideoData'], function(result) {
    console.log('VERIFICATION - Stored data:', result.youtubeVideoData);
    // Log if transcript was found
    if (result.youtubeVideoData && result.youtubeVideoData.transcript) {
      console.log('✅ Transcript successfully extracted');
    } else {
      console.log('❌ Transcript extraction failed');
    }
    // Log if comments were found
    if (result.youtubeVideoData && Array.isArray(result.youtubeVideoData.comments)) {
      console.log('✅ Comments successfully extracted:', result.youtubeVideoData.comments.length);
    } else {
      console.log('❌ Comment extraction failed or no comments found');
    }
  });
};

// Handle messages from popup and background scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  // Respond to ping messages to verify content script is loaded
  if (message.action === 'ping') {
    console.log('Ping received, responding with pong');
    sendResponse({ status: 'pong', ready: contentScriptReady });
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === 'extractTranscript') {
    console.log('Extract transcript request received');
    // Start the extraction process
    extractAndSaveVideoData();
    sendResponse({ status: 'Extracting transcript...' });
    return true; // Keep the message channel open for async response
  }
});

// Initialize and mark as ready when loaded
const initialize = async () => {
  try {
    console.log('YouTube transcript extractor content script initializing...');
    
    // Mark script as ready
    contentScriptReady = true;
    console.log('YouTube transcript extractor content script ready');
    
    // If on a YouTube video page, pre-extract the transcript
    if (window.location.href.includes('youtube.com/watch')) {
      console.log('YouTube video page detected, preparing for transcript extraction');
      // Wait a bit for the page to stabilize
      setTimeout(extractAndSaveVideoData, 1500);
    }
  } catch (error) {
    console.error('Error initializing content script:', error);
  }
};

// Log when content script loads
console.log('YouTube transcript extractor content script loaded');

// Initialize the content script
initialize();