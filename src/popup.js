document.addEventListener('DOMContentLoaded', async () => {
  // Get UI elements
  const aiToggle = document.getElementById('aiToggle');
  const promptTypeSelect = document.getElementById('promptType');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const statusMessage = document.getElementById('statusMessage');
  
  // Load saved settings
  const { useClaudeAI, selectedPromptType } = await chrome.storage.local.get(['useClaudeAI', 'selectedPromptType']);
  
  // Apply saved settings to UI
  if (useClaudeAI !== undefined) {
    aiToggle.checked = useClaudeAI;
  }
  
  if (selectedPromptType) {
    promptTypeSelect.value = selectedPromptType;
  }
  
  // Save AI toggle setting when changed
  aiToggle.addEventListener('change', () => {
    chrome.storage.local.set({ useClaudeAI: aiToggle.checked });
  });
  
  // Save prompt type selection when changed
  promptTypeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedPromptType: promptTypeSelect.value });
  });
  
  // Handle summarize button click
  summarizeBtn.addEventListener('click', async () => {
    try {
      // Check if we're on a YouTube video page
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTabUrl = tabs[0].url;
      
      if (!currentTabUrl.includes('youtube.com/watch')) {
        statusMessage.textContent = 'Not a YouTube video page. Please navigate to a video.';
        statusMessage.style.color = '#ff6b6b';
        return;
      }
      
      statusMessage.textContent = 'Extracting transcript...';
      statusMessage.style.color = '#ccc';
      summarizeBtn.disabled = true;
      
      // Get current settings
      const useClaudeAI = aiToggle.checked;
      const selectedPromptType = promptTypeSelect.value;
      
      // Save settings
      await chrome.storage.local.set({ 
        useClaudeAI,
        selectedPromptType
      });
      
      // Send message to content script to extract transcript
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractTranscript' });
      
      // Wait for transcript extraction (with timeout)
      let extractionSuccess = false;
      let retryCount = 0;
      const MAX_RETRIES = 15; // Increased retry count for API method
      
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
          
          // Get correct AI URL and prompt
          const aiUrl = useClaudeAI ? config.claudeUrl : config.chatgptUrl;
          const prePrompt = config.prompts[selectedPromptType] || config.prompts.academic;
          
          // Open AI in new tab
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