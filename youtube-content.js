(() => {
  /**
   * Extracts YouTube video information and transcript
   * Uses YoutubeTranscript library for reliable transcript extraction
   */
  
  // Extract video title
  const extractVideoTitle = () => {
    const titleElement = document.querySelector('h1.ytd-watch-metadata');
    return titleElement ? titleElement.textContent.trim() : 'Title not found';
  };
  
  // Extract video creator/channel name
  const extractChannelName = () => {
    const channelElement = document.querySelector('ytd-channel-name yt-formatted-string#text');
    return channelElement ? channelElement.textContent.trim() : 'Channel not found';
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
  
  // Format transcript data into readable text
  const formatTranscript = (transcriptData) => {
    if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
      return 'No transcript data available';
    }
    
    // Format each transcript segment
    return transcriptData.map(segment => {
      // Convert offset seconds to MM:SS format
      const minutes = Math.floor(segment.offset / 60);
      const seconds = Math.floor(segment.offset % 60);
      const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      return `[${timestamp}] ${segment.text}`;
    }).join('\n\n');
  };
  
  // Main function to extract all video data
  const extractVideoData = async () => {
    try {
      // Extract basic video metadata
      const title = extractVideoTitle();
      const channel = extractChannelName();
      const description = extractVideoDescription();
      const metadata = extractVideoMetadata();
      
      // Get the current video URL
      const videoUrl = window.location.href;
      
      // Extract transcript using the library
      const transcriptData = await window.YoutubeTranscript.fetchTranscript(videoUrl);
      const formattedTranscript = formatTranscript(transcriptData);
      
      // Return the complete video data object
      return {
        videoTitle: title,
        channelName: channel,
        videoDescription: description,
        views: metadata.views,
        publishDate: metadata.date,
        transcript: formattedTranscript,
        transcriptLanguage: transcriptData.length > 0 ? transcriptData[0].lang : 'unknown'
      };
    } catch (error) {
      console.error('Error extracting video data:', error);
      
      // Determine error type and provide appropriate message
      let errorMessage = 'Failed to extract transcript';
      
      if (error instanceof window.YoutubeTranscriptDisabledError) {
        errorMessage = 'Transcript is not available for this video. The creator may have disabled it.';
      } else if (error instanceof window.YoutubeTranscriptNotAvailableError) {
        errorMessage = 'No transcript is available for this video.';
      } else if (error instanceof window.YoutubeTranscriptTooManyRequestError) {
        errorMessage = 'YouTube is limiting transcript access due to too many requests. Please try again later.';
      } else if (error instanceof window.YoutubeTranscriptVideoUnavailableError) {
        errorMessage = 'The video appears to be unavailable or private.';
      } else {
        errorMessage = `Error getting transcript: ${error.message}`;
      }
      
      // Return what we could get, with error message for transcript
      return {
        videoTitle: extractVideoTitle(),
        channelName: extractChannelName(),
        videoDescription: extractVideoDescription(),
        views: extractVideoMetadata().views,
        publishDate: extractVideoMetadata().date,
        transcript: errorMessage,
        error: true,
        message: errorMessage
      };
    }
  };
  
  // Handle messages from popup and background scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractTranscript') {
      // Start the extraction process
      extractAndSaveVideoData();
      sendResponse({ status: 'Extracting transcript...' });
      return true; // Keep the message channel open for async response
    }
  });
  
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
      
      // Extract all video data
      const videoData = await extractVideoData();
      
      // Save to Chrome storage
      chrome.storage.local.set({ youtubeVideoData: videoData }, () => {
        console.log('YouTube video data saved to storage:', videoData);
      });
    } catch (error) {
      console.error('Error in YouTube content script:', error);
      
      // Save error message to storage
      chrome.storage.local.set({ 
        youtubeVideoData: {
          error: true,
          message: error.message || 'Unknown error occurred'
        }
      });
    }

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
  
  // Automatically extract transcript when the page loads (for context menu functionality)
  if (window.location.href.includes('youtube.com/watch')) {
    // Wait a bit for the page to stabilize
    setTimeout(extractAndSaveVideoData, 1500);
  }
})();