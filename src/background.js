chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const response = await fetch(chrome.runtime.getURL('config.json'));
      const config = await response.json();
      const result = await chrome.storage.local.get(['aiTabId', 'scriptInjected', 'useClaudeAI']);
      
      // Debug logs moved after result is defined
      console.log('Tab updated:', tab.url);
      console.log('Checking tab:', tabId, 'against aiTabId:', result.aiTabId);
      console.log('URL includes claude.ai:', tab.url.includes('claude.ai'));
      
      if (
        tabId === result.aiTabId && 
        !result.scriptInjected && 
        ((result.useClaudeAI && tab.url.includes('claude.ai')) || 
         (!result.useClaudeAI && tab.url.includes('chatgpt.com')))
      ) {
        // Use the bundled versions from the dist directory
        const scriptToInject = result.useClaudeAI ? 'dist/claude-content.bundle.js' : 'dist/gpt-content.bundle.js';
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
  // Initialize default settings if not already set
  const defaultSettings = {
    useClaudeAI: true,
    selectedPromptType: 'academic'
  };
  
  const result = await chrome.storage.local.get(Object.keys(defaultSettings));
  
  // Apply default settings for any missing values
  const settingsToUpdate = {};
  for (const [key, defaultValue] of Object.entries(defaultSettings)) {
    if (result[key] === undefined) {
      settingsToUpdate[key] = defaultValue;
    }
  }
  
  if (Object.keys(settingsToUpdate).length > 0) {
    await chrome.storage.local.set(settingsToUpdate);
  }
});

// Add context menu for YouTube videos
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarizeYouTubeVideo',
    title: 'Summarize this YouTube Video',
    contexts: ['page'],
    documentUrlPatterns: ['*://*.youtube.com/watch?*']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'summarizeYouTubeVideo') {
    try {
      // Send message to content script to extract transcript
      chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' });
      
      // Get settings
      const { useClaudeAI, selectedPromptType } = await chrome.storage.local.get(['useClaudeAI', 'selectedPromptType']);
      
      // Get config
      const response = await fetch(chrome.runtime.getURL('config.json'));
      const config = await response.json();
      
      // Clear previous data but keep settings
      const currentSettings = await chrome.storage.local.get(['useClaudeAI', 'selectedPromptType']);
      await chrome.storage.local.clear();
      await chrome.storage.local.set(currentSettings);
      
      // Get URL for selected AI service
      const aiUrl = useClaudeAI ? config.claudeUrl : config.chatgptUrl;
      
      // Get the appropriate prompt based on selected type
      const prePrompt = config.prompts[selectedPromptType] || config.prompts.academic;
      
      // Open AI service in new tab
      const newTab = await chrome.tabs.create({ url: aiUrl, active: false });
      
      // Store necessary data for content script
      await chrome.storage.local.set({
        aiTabId: newTab.id,
        scriptInjected: false,
        useClaudeAI: useClaudeAI,
        prePrompt: prePrompt
      });
      
      // Switch to the new tab
      await chrome.tabs.update(newTab.id, { active: true });
    } catch (error) {
      console.error('Error during YouTube summarization:', error);
    }
  }
});