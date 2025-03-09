// Import promptStorage module
const promptStorage = require('./promptStorage');

document.addEventListener('DOMContentLoaded', async () => {
  // Get UI elements
  const promptTypeSelect = document.getElementById('promptType');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const statusMessage = document.getElementById('statusMessage');
  const customizePromptsBtn = document.getElementById('customizePromptsBtn');
  const promptSettingsPanel = document.getElementById('promptSettingsPanel');
  const promptsList = document.getElementById('promptsList');
  const addNewPromptBtn = document.getElementById('addNewPromptBtn');
  const addPromptForm = document.getElementById('addPromptForm');
  const newPromptId = document.getElementById('newPromptId');
  const newPromptName = document.getElementById('newPromptName');
  const newPromptContent = document.getElementById('newPromptContent');
  const saveNewPromptBtn = document.getElementById('saveNewPromptBtn');
  const cancelNewPromptBtn = document.getElementById('cancelNewPromptBtn');
  
  // Import/Export elements
  const exportPromptsBtn = document.getElementById('exportPromptsBtn');
  const importPromptsBtn = document.getElementById('importPromptsBtn');
  const resetPromptsBtn = document.getElementById('resetPromptsBtn');
  const fileInput = document.getElementById('fileInput');
  const importOptions = document.getElementById('importOptions');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  const cancelImportBtn = document.getElementById('cancelImportBtn');
  const notificationArea = document.getElementById('notificationArea');
  
  // Store selected file for import
  let selectedFile = null;
  
  // Populate prompt select dropdown
  async function populatePromptSelect() {
    try {
      const prompts = await promptStorage.loadPrompts();
      const { selectedPromptType } = await chrome.storage.local.get(['selectedPromptType']);
      
      // Clear existing options
      promptTypeSelect.innerHTML = '';
      
      // Add options for each prompt
      Object.entries(prompts).forEach(([id, prompt]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = prompt.name;
        promptTypeSelect.appendChild(option);
      });
      
      // Set selected option
      if (selectedPromptType && prompts[selectedPromptType]) {
        promptTypeSelect.value = selectedPromptType;
      } else {
        // Set first option as default if previous selection is invalid
        const firstKey = Object.keys(prompts)[0];
        promptTypeSelect.value = firstKey;
        await chrome.storage.local.set({ selectedPromptType: firstKey });
      }
    } catch (error) {
      console.error('Error populating prompt select:', error);
      showNotification('Failed to load prompts: ' + error.message, 'error');
    }
  }
  
  // Refresh the prompt settings panel
  async function refreshPromptsPanel() {
    try {
      const prompts = await promptStorage.loadPrompts();
      
      // Clear current list
      promptsList.innerHTML = '';
      
      // Add each prompt to the list
      Object.entries(prompts).forEach(([id, prompt]) => {
        const promptItem = document.createElement('div');
        promptItem.className = 'prompt-item';
        promptItem.dataset.id = id;
        
        const header = document.createElement('div');
        header.className = 'prompt-item-header';
        
        const nameElem = document.createElement('div');
        nameElem.className = 'prompt-name';
        nameElem.textContent = prompt.name;
        
        const actionsElem = document.createElement('div');
        actionsElem.className = 'prompt-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => togglePromptEditor(id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deletePrompt(id));
        
        // Only allow deletion if there's more than one prompt
        if (Object.keys(prompts).length <= 1) {
          deleteBtn.disabled = true;
          deleteBtn.title = 'Cannot delete the only prompt';
        }
        
        actionsElem.appendChild(editBtn);
        actionsElem.appendChild(deleteBtn);
        
        header.appendChild(nameElem);
        header.appendChild(actionsElem);
        
        promptItem.appendChild(header);
        
        // Create editor (hidden by default)
        const editorContainer = document.createElement('div');
        editorContainer.className = 'prompt-editor-container hidden';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'prompt-name-input';
        nameInput.value = prompt.name;
        nameInput.placeholder = 'Prompt Display Name';
        
        const editor = document.createElement('textarea');
        editor.className = 'prompt-editor';
        editor.value = prompt.content;
        
        const editorActions = document.createElement('div');
        editorActions.className = 'button-group';
        
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Changes';
        saveBtn.className = 'save-prompt-btn';
        saveBtn.addEventListener('click', () => savePromptChanges(id, nameInput.value, editor.value));
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.addEventListener('click', () => togglePromptEditor(id));
        
        editorActions.appendChild(saveBtn);
        editorActions.appendChild(cancelBtn);
        
        editorContainer.appendChild(nameInput);
        editorContainer.appendChild(editor);
        editorContainer.appendChild(editorActions);
        
        promptItem.appendChild(editorContainer);
        promptsList.appendChild(promptItem);
      });
    } catch (error) {
      console.error('Error refreshing prompts panel:', error);
      showNotification('Failed to refresh prompts: ' + error.message, 'error');
    }
  }
  
  // Toggle prompt editor visibility
  function togglePromptEditor(promptId) {
    const promptItem = promptsList.querySelector(`.prompt-item[data-id="${promptId}"]`);
    if (promptItem) {
      const editorContainer = promptItem.querySelector('.prompt-editor-container');
      editorContainer.classList.toggle('hidden');
    }
  }
  
  // Save edited prompt
  async function savePromptChanges(promptId, newName, newContent) {
    try {
      if (!newName.trim() || !newContent.trim()) {
        showNotification('Prompt name and content cannot be empty', 'error');
        return;
      }
      
      const prompts = await promptStorage.loadPrompts();
      
      if (prompts && prompts[promptId]) {
        prompts[promptId] = {
          name: newName.trim(),
          content: newContent.trim()
        };
        
        await promptStorage.savePrompts(prompts);
        
        // Update UI
        refreshPromptsPanel();
        populatePromptSelect();
        
        // Close editor
        togglePromptEditor(promptId);
        showNotification('Prompt updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving prompt changes:', error);
      showNotification('Failed to save changes: ' + error.message, 'error');
    }
  }
  
  // Delete a prompt
  async function deletePrompt(promptId) {
    try {
      const prompts = await promptStorage.loadPrompts();
      const { selectedPromptType } = await chrome.storage.local.get(['selectedPromptType']);
      
      // Don't allow deleting the only prompt
      if (Object.keys(prompts).length <= 1) {
        showNotification('Cannot delete the only prompt', 'error');
        return;
      }
      
      // Confirm deletion
      if (!confirm(`Are you sure you want to delete the "${prompts[promptId].name}" prompt?`)) {
        return;
      }
      
      // Delete the prompt
      delete prompts[promptId];
      
      // If the deleted prompt was selected, select the first available one
      let newSelectedType = selectedPromptType;
      if (promptId === selectedPromptType) {
        newSelectedType = Object.keys(prompts)[0];
      }
      
      // Save changes
      await promptStorage.savePrompts(prompts);
      await chrome.storage.local.set({ selectedPromptType: newSelectedType });
      
      // Update UI
      refreshPromptsPanel();
      populatePromptSelect();
      showNotification('Prompt deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showNotification('Failed to delete prompt: ' + error.message, 'error');
    }
  }
  
  // Add a new prompt
  async function addNewPrompt() {
    try {
      const id = newPromptId.value.trim().replace(/\s+/g, '_').toLowerCase();
      const name = newPromptName.value.trim();
      const content = newPromptContent.value.trim();
      
      // Validate input
      if (!id) {
        showNotification('Prompt ID is required', 'error');
        return;
      }
      
      if (!name) {
        showNotification('Display name is required', 'error');
        return;
      }
      
      if (!content) {
        showNotification('Prompt content is required', 'error');
        return;
      }
      
      const prompts = await promptStorage.loadPrompts();
      
      // Check if ID already exists
      if (prompts[id]) {
        showNotification('A prompt with this ID already exists. Please choose a different ID.', 'error');
        return;
      }
      
      // Add new prompt
      prompts[id] = {
        name,
        content
      };
      
      // Save changes
      await promptStorage.savePrompts(prompts);
      
      // Update UI
      refreshPromptsPanel();
      populatePromptSelect();
      
      // Reset form and hide it
      newPromptId.value = '';
      newPromptName.value = '';
      newPromptContent.value = '';
      addPromptForm.classList.add('hidden');
      
      showNotification('New prompt added successfully', 'success');
    } catch (error) {
      console.error('Error adding new prompt:', error);
      showNotification('Failed to add new prompt: ' + error.message, 'error');
    }
  }
  
  // Toggle add prompt form
  function toggleAddPromptForm() {
    addPromptForm.classList.toggle('hidden');
    
    // If showing the form, hide import options
    if (!addPromptForm.classList.contains('hidden')) {
      importOptions.classList.add('hidden');
    }
  }
  
  // Toggle settings panel
  function toggleSettingsPanel() {
    promptSettingsPanel.classList.toggle('hidden');
    
    if (!promptSettingsPanel.classList.contains('hidden')) {
      refreshPromptsPanel();
    }
  }
  
  // Export prompts to a file
  async function exportPrompts() {
    try {
      const prompts = await promptStorage.loadPrompts();
      const success = await promptStorage.exportPromptsToFile(prompts);
      
      if (success) {
        showNotification('Prompts exported successfully', 'success');
      }
    } catch (error) {
      console.error('Error exporting prompts:', error);
      showNotification('Failed to export prompts: ' + error.message, 'error');
    }
  }
  
  // Handle file selection for import
  function handleFileSelect(event) {
    selectedFile = event.target.files[0];
    
    if (selectedFile) {
      // Show import options
      importOptions.classList.remove('hidden');
      
      // Hide add prompt form if it's open
      addPromptForm.classList.add('hidden');
    }
  }
  
  // Import prompts from a file
  async function importPrompts() {
    try {
      if (!selectedFile) {
        showNotification('No file selected', 'error');
        return;
      }
      
      // Get selected import mode
      const importMode = document.querySelector('input[name="importMode"]:checked').value;
      const overwrite = importMode === 'overwrite';
      
      // Import prompts from file
      const importedPrompts = await promptStorage.importPromptsFromFile(selectedFile);
      
      // Merge with existing prompts
      const mergedPrompts = await promptStorage.mergePrompts(importedPrompts, overwrite);
      
      // Update UI
      refreshPromptsPanel();
      populatePromptSelect();
      
      // Hide import options
      importOptions.classList.add('hidden');
      
      // Clear selected file
      fileInput.value = '';
      selectedFile = null;
      
      showNotification(`Prompts imported successfully (${Object.keys(importedPrompts).length} prompts)`, 'success');
    } catch (error) {
      console.error('Error importing prompts:', error);
      showNotification('Failed to import prompts: ' + error.message, 'error');
    }
  }
  
  // Reset prompts to default
  async function resetPrompts() {
    try {
      // Confirm reset
      if (!confirm('Are you sure you want to reset all prompts to default? This will delete all custom prompts.')) {
        return;
      }
      
      // Reset prompts
      await promptStorage.resetPromptsToDefault();
      
      // Update UI
      refreshPromptsPanel();
      populatePromptSelect();
      
      showNotification('Prompts reset to default', 'success');
    } catch (error) {
      console.error('Error resetting prompts:', error);
      showNotification('Failed to reset prompts: ' + error.message, 'error');
    }
  }
  
  // Cancel import process
  function cancelImport() {
    // Hide import options
    importOptions.classList.add('hidden');
    
    // Clear selected file
    fileInput.value = '';
    selectedFile = null;
  }
  
  // Show a notification
  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Clear previous notifications
    notificationArea.innerHTML = '';
    
    // Add notification to the notification area
    notificationArea.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  // Save prompt type selection when changed
  promptTypeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedPromptType: promptTypeSelect.value });
  });
  
  // Settings panel toggle
  customizePromptsBtn.addEventListener('click', toggleSettingsPanel);
  
  // Add new prompt button
  addNewPromptBtn.addEventListener('click', toggleAddPromptForm);
  
  // Save new prompt button
  saveNewPromptBtn.addEventListener('click', addNewPrompt);
  
  // Cancel new prompt button
  cancelNewPromptBtn.addEventListener('click', toggleAddPromptForm);
  
  // Export prompts button
  exportPromptsBtn.addEventListener('click', exportPrompts);
  
  // Import prompts button
  importPromptsBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  // File input change
  fileInput.addEventListener('change', handleFileSelect);
  
  // Confirm import button
  confirmImportBtn.addEventListener('click', importPrompts);
  
  // Cancel import button
  cancelImportBtn.addEventListener('click', cancelImport);
  
  // Reset prompts button
  resetPromptsBtn.addEventListener('click', resetPrompts);
  
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
      
      // Get the selected prompt type
      const selectedPromptType = promptTypeSelect.value;
      
      // Save settings but clear old transcript data
      const customPrompts = await promptStorage.loadPrompts();
      const settingsToKeep = { 
        selectedPromptType,
        customPrompts
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
          
          // Get the custom prompts
          const customPrompts = await promptStorage.loadPrompts();
          
          // Get the selected prompt content
          const selectedPrompt = customPrompts[selectedPromptType];
          if (!selectedPrompt) {
            statusMessage.textContent = 'Invalid prompt selected';
            statusMessage.style.color = '#ff6b6b';
            summarizeBtn.disabled = false;
            return;
          }
          
          // Open Claude in new tab
          const newTab = await chrome.tabs.create({ url: 'https://claude.ai/new', active: false });
          
          // Save necessary data for content script
          await chrome.storage.local.set({
            aiTabId: newTab.id,
            scriptInjected: false,
            prePrompt: selectedPrompt.content
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
  
  // Initialize popup
  async function initializePopup() {
    try {
      // Ensure prompts are loaded
      await populatePromptSelect();
      
      // Check if we're on a YouTube page
      await checkYouTubeVideoPage();
    } catch (error) {
      console.error('Error initializing popup:', error);
      showNotification('Error initializing: ' + error.message, 'error');
    }
  }
  
  // Initialize popup when loaded
  initializePopup();
});