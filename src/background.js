// Import promptStorage module
const promptStorage = require('./promptStorage');

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const result = await chrome.storage.local.get(['aiTabId', 'scriptInjected']);
      
      // Debug logs
      console.log('Tab updated:', tab.url);
      console.log('Checking tab:', tabId, 'against aiTabId:', result.aiTabId);
      console.log('URL includes claude.ai:', tab.url.includes('claude.ai'));
      
      if (
        tabId === result.aiTabId && 
        !result.scriptInjected && 
        tab.url.includes('claude.ai')
      ) {
        // Use the bundled Claude content script
        const scriptToInject = 'dist/claude-content.bundle.js';
        console.log('Attempting to inject script:', scriptToInject);
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [scriptToInject]
          });
          console.log('✅ Script injection successful');
          await chrome.storage.local.set({ scriptInjected: true });
        } catch (error) {
          console.error('❌ Script injection failed:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Initialize default settings and prompts if not already set
    const { customPrompts, selectedPromptType } = await chrome.storage.local.get(['customPrompts', 'selectedPromptType']);
    
    // Initialize prompts using the promptStorage module
    if (!customPrompts || Object.keys(customPrompts).length === 0) {
      console.log('Initializing default prompts...');
      await promptStorage.savePrompts(promptStorage.DEFAULT_PROMPTS);
    }
    
    if (!selectedPromptType) {
      console.log('Setting default prompt type...');
      await chrome.storage.local.set({ selectedPromptType: 'academic' });
    }
    
    console.log('Extension initialized with prompts:', 
      customPrompts ? Object.keys(customPrompts).length : 'None');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Helper function to check if a content script is loaded
const isContentScriptLoaded = async (tabId) => {
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

// Helper function to inject content script if needed
const injectContentScriptIfNeeded = async (tabId) => {
  try {
    console.log('Checking if content script is loaded in tab', tabId);
    
    // Check if content script is already loaded
    const isLoaded = await isContentScriptLoaded(tabId);
    
    if (!isLoaded) {
      console.log('Content script not loaded, injecting...');
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['dist/youtube-content.bundle.js']
      });
      
      // Wait a moment for script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } else {
      console.log('Content script already loaded');
      return true;
    }
  } catch (error) {
    console.error('Error injecting content script:', error);
    return false;
  }
};

// Add context menu for YouTube videos
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarizeYouTubeVideo',
    title: 'Summarize this YouTube Video with Claude',
    contexts: ['page'],
    documentUrlPatterns: ['*://*.youtube.com/watch?*']
  });
});

// Helper function to get prompt content
async function getPromptContent(promptType) {
  try {
    const prompts = await promptStorage.loadPrompts();
    
    if (!prompts[promptType]) {
      console.warn(`Prompt type "${promptType}" not found, using default`);
      return prompts.academic?.content || promptStorage.DEFAULT_PROMPTS.academic.content;
    }
    
    return prompts[promptType].content;
  } catch (error) {
    console.error('Error getting prompt content:', error);
    return promptStorage.DEFAULT_PROMPTS.academic.content;
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'summarizeYouTubeVideo') {
    try {
      // Make sure content script is loaded
      const injected = await injectContentScriptIfNeeded(tab.id);
      
      if (!injected) {
        console.error('Failed to inject content script');
        return;
      }
      
      // Get stored prompt settings
      const { selectedPromptType, customPrompts } = await chrome.storage.local.get([
        'selectedPromptType', 
        'customPrompts'
      ]);
      
      // Clear previous transcript data but keep settings
      const settingsToKeep = { 
        selectedPromptType, 
        customPrompts 
      };
      
      // Clear all storage
      await chrome.storage.local.clear();
      
      // Restore just the settings
      await chrome.storage.local.set(settingsToKeep);
      
      console.log('Cleared previous data, preserved settings for prompt type:', selectedPromptType);
      
      // Send message to content script to extract transcript
      chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to content script:', chrome.runtime.lastError);
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
          
          // Get the prompt content based on selected type
          const promptType = selectedPromptType || 'academic';
          const prePrompt = await getPromptContent(promptType);
          
          // Open Claude in new tab
          const newTab = await chrome.tabs.create({ url: 'https://claude.ai/new', active: false });
          
          // Store necessary data for content script
          await chrome.storage.local.set({
            aiTabId: newTab.id,
            scriptInjected: false,
            prePrompt: prePrompt
          });
          
          // Switch to the new tab
          await chrome.tabs.update(newTab.id, { active: true });
          break;
        } else {
          retryCount++;
        }
      }
      
      if (!extractionSuccess) {
        console.error('Failed to extract transcript after multiple attempts');
      }
    } catch (error) {
      console.error('Error during YouTube summarization:', error);
    }
  }
});