document.addEventListener('DOMContentLoaded', async () => {
  // Get UI elements
  const promptTypeSelect = document.getElementById('promptType');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const statusMessage = document.getElementById('statusMessage');
  
  // Load saved settings
  const { selectedPromptType } = await chrome.storage.local.get(['selectedPromptType']);
  
  // Apply saved settings to UI
  if (selectedPromptType) {
    promptTypeSelect.value = selectedPromptType;
  }
  
  // Save prompt type selection when changed
  promptTypeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedPromptType: promptTypeSelect.value });
  });
  
  // Helper function to check if the content script is accessible
  const isContentScriptReady = (tabId) => {
    return new Promise((resolve) => {
      try {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Content script not ready:', chrome.runtime.lastError);
            resolve(false);
          } else {
            console.log('Content script is ready, received:', response);
            resolve(true);
          }
        });
      } catch (error) {
        console.error('Error checking content script:', error);
        resolve(false);
      }
    });
  };

  // Inject content script manually if needed
  const injectContentScript = async (tabId) => {
    try {
      console.log('Attempting to inject content script manually...');
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['dist/youtube-content.bundle.js']
      });
      return true;
    } catch (error) {
      console.error('Failed to inject content script:', error);
      return false;
    }
  };
  
  // Handle summarize button click
  summarizeBtn.addEventListener('click', async () => {
    try {
      // Check if we're on a YouTube video page
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      const currentTabUrl = currentTab.url;
      
      if (!currentTabUrl.includes('youtube.com/watch')) {
        statusMessage.textContent = 'Not a YouTube video page. Please navigate to a video.';
        statusMessage.style.color = '#ff6b6b';
        return;
      }
      
      statusMessage.textContent = 'Checking connection to page...';
      statusMessage.style.color = '#ccc';
      summarizeBtn.disabled = true;
      
      // Check if content script is ready - try a few times
      let contentScriptReady = await isContentScriptReady(currentTab.id);
      
      // If not ready, try to manually inject it
      if (!contentScriptReady) {
        statusMessage.textContent = 'Initializing transcript extractor...';
        const injected = await injectContentScript(currentTab.id);
        
        // Wait a moment for the script to initialize
        if (injected) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          contentScriptReady = await isContentScriptReady(currentTab.id);
        }
      }
      
      if (!contentScriptReady) {
        statusMessage.textContent = 'Failed to connect to YouTube page. Please refresh the page and try again.';
        statusMessage.style.color = '#ff6b6b';
        summarizeBtn.disabled = false;
        return;
      }
      
      // Proceed with transcript extraction
      statusMessage.textContent = 'Extracting transcript...';
      
      // Always use Claude
      const selectedPromptType = promptTypeSelect.value;
      
      // Save settings but clear old transcript data
      const settingsToKeep = { 
        selectedPromptType
      };
      
      // Clear all local storage but preserve settings
      await chrome.storage.local.clear();
      await chrome.storage.local.set(settingsToKeep);
      
      // Send message to content script to extract transcript
      chrome.tabs.sendMessage(currentTab.id, { action: 'extractTranscript' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending extractTranscript command:', chrome.runtime.lastError);
          statusMessage.textContent = 'Communication error. Please refresh the page and try again.';
          statusMessage.style.color = '#ff6b6b';
          summarizeBtn.disabled = false;
          return;
        }
        
        console.log('Extract transcript command sent, response:', response);
      });
      
      // Wait for transcript extraction (with timeout)
      let extractionSuccess = false;
      let retryCount = 0;
      const MAX_RETRIES = 15;
      
      while (!extractionSuccess && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { youtubeVideoData } = await chrome.storage.local.get(['youtubeVideoData']);
        
        if (youtubeVideoData) {
          extractionSuccess = true;
          
          if (youtubeVideoData.error) {
            statusMessage.textContent = youtubeVideoData.message || 'Failed to extract transcript';
            statusMessage.style.color = '#ff6b6b';
            summarizeBtn.disabled = false;
            return;
          }
          
          // Fetch config for AI URL and prompt
          const response = await fetch(chrome.runtime.getURL('config.json'));
          const config = await response.json();
          
          // Always use Claude
          const aiUrl = config.claudeUrl;
          const prePrompt = config.prompts[selectedPromptType] || config.prompts.academic;
          
          // Open Claude in new tab
          const newTab = await chrome.tabs.create({ url: aiUrl, active: false });
          
          // Save necessary data for content script
          await chrome.storage.local.set({
            aiTabId: newTab.id,
            scriptInjected: false,
            prePrompt
          });
          
          // Activate the new tab
          await chrome.tabs.update(newTab.id, { active: true });
          
          // Close the popup
          window.close();
        } else {
          retryCount++;
        }
      }
      
      if (!extractionSuccess) {
        statusMessage.textContent = 'Timeout: Failed to extract transcript. Please try again.';
        statusMessage.style.color = '#ff6b6b';
        summarizeBtn.disabled = false;
      }
    } catch (error) {
      console.error('Error:', error);
      statusMessage.textContent = `Error: ${error.message || 'Unknown error occurred'}`;
      statusMessage.style.color = '#ff6b6b';
      summarizeBtn.disabled = false;
    }
  });
  
  // Check if we're on a YouTube video page and enable/disable button accordingly
  const checkYouTubeVideoPage = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTabUrl = tabs[0].url;
      
      if (!currentTabUrl.includes('youtube.com/watch')) {
        summarizeBtn.disabled = true;
        statusMessage.textContent = 'Please navigate to a YouTube video page';
        statusMessage.style.color = '#ff6b6b';
      } else {
        summarizeBtn.disabled = false;
        statusMessage.textContent = 'Ready to summarize';
        statusMessage.style.color = '#4caf50';
      }
    } catch (error) {
      console.error('Error checking page:', error);
    }
  };
  
  // Check initial page state
  checkYouTubeVideoPage();
});