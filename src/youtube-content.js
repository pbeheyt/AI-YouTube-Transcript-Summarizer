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

// Extract video description
const extractVideoDescription = () => {
  const descriptionElement = document.querySelector('ytd-text-inline-expander > yt-formatted-string');
  return descriptionElement ? descriptionElement.textContent.trim() : 'Description not available';
};

// Extract video metadata (views, date)
const extractVideoMetadata = () => {
  const metadataElement = document.querySelector('#info-container ytd-video-primary-info-renderer #info');
  if (!metadataElement) return { views: 'Unknown', date: 'Unknown' };
  
  const infoText = metadataElement.textContent.trim();
  
  // Try to extract views and date with regex
  const viewsMatch = infoText.match(/(\d+,?\d*)\s+views?/i);
  const dateMatch = infoText.match(/([A-Za-z]+\s+\d+,?\s*\d*)/);
  
  return {
    views: viewsMatch ? viewsMatch[1] : 'Unknown',
    date: dateMatch ? dateMatch[1] : 'Unknown'
  };
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

// Main function to extract all video data
const extractVideoData = async () => {
  try {
    // Extract basic video metadata
    const title = extractVideoTitle();
    const channel = extractChannelName();
    const description = extractVideoDescription();
    const metadata = extractVideoMetadata();
    
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
    
    // Return the complete video data object
    return {
      videoId: videoId, // Include the video ID for verification
      videoTitle: title,
      channelName: channel,
      videoDescription: description,
      views: metadata.views,
      publishDate: metadata.date,
      transcript: formattedTranscript,
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
      views: extractVideoMetadata().views,
      publishDate: extractVideoMetadata().date,
      transcript: errorMessage,
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
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