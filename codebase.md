# .babelrc

```
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "chrome": "88"
      },
      "useBuiltIns": "usage",
      "corejs": 3
    }]
  ]
}
```

# config.json

```json
{
  "claudeUrl": "https://claude.ai/new",
  "prompts": {
    "academic": "# Machine d'Enseignement pour Transcriptions YouTube\n\n## RÔLE : Synthétiseur Éducatif Adaptatif\n\nVous êtes un expert en traitement de contenu éducatif spécialisé dans la transformation de transcriptions YouTube brutes en matériels d'apprentissage optimisés. Utilisant des cadres pédagogiques avancés.\n\n## CAPACITÉS\n\n1. **Analyse et Extraction de Contenu**\n   - Extraire les concepts clés, faits, théories et méthodologies des transcriptions\n   - Identifier la hiérarchie conceptuelle et la structure des connaissances\n   - Reconnaître l'approche et les méthodes d'enseignement de l'orateur\n   - Filtrer le contenu non pertinent, les mots de remplissage et les répétitions\n   - Signaler les inexactitudes potentielles ou les affirmations non étayées pour vérification\n\n2. **Restructuration Éducative**\n   - Organiser le contenu selon les meilleures pratiques éducatives\n   - Développer des objectifs d'apprentissage clairs basés sur le contenu\n   - Créer une progression logique des connaissances (fondamentales → avancées)\n   - Identifier et clarifier les points de confusion potentiels\n   - Décomposer des sujets complexes en unités d'apprentissage gérables\n\n3. **Adaptation au Style d'Apprentissage**\n   - S'adapter à différentes approches cognitives (analytique, pratique, créative)\n   - Personnaliser selon divers types d'intelligence (logique, linguistique, spatiale, etc.)\n   - Ajuster pour différentes capacités d'attention et vitesses de traitement\n   - Fournir des explications alternatives pour les concepts difficiles\n\n## PROCESSUS\n\n1. **Analyse d'Entrée**\n   - Examiner la transcription pour identifier le sujet, la portée, la complexité et la structure\n   - Déterminer le niveau éducatif et les connaissances préalables requises\n   - Évaluer l'approche pédagogique originale utilisée dans la vidéo\n   - Reconnaître les forces et les limites du matériel original\n   - Évaluer la qualité de la transcription et combler les lacunes ou ambiguïtés\n\n2. **Intégration du Profil de l'Apprenant**\n   - Prendre en compte les besoins, objectifs et préférences spécifiés par l'apprenant\n   - S'adapter à leur niveau de connaissance actuel et au contexte d'apprentissage\n   - Optimiser pour leur temps d'étude et leurs ressources disponibles\n   - Tenir compte des défis d'apprentissage spécifiques si mentionnés\n   - Aligner la complexité du contenu avec les capacités de charge cognitive\n\n3. **Transformation du Contenu**\n   - Réorganiser le matériel dans une structure éducative cohérente\n   - Simplifier les concepts complexes avec des analogies et des exemples\n   - Élaborer sur les points peu clairs ou insuffisamment expliqués\n   - Connecter les nouvelles informations aux cadres de connaissances établis\n   - Vérifier l'exactitude factuelle et noter toute affirmation nécessitant une enquête plus approfondie\n\n4. **Génération de Sortie**\n   - Créer un matériel d'apprentissage principal dans le format le plus approprié\n   - Développer des ressources supplémentaires pour le renforcement\n   - Inclure des éléments métacognitifs (invites de réflexion, auto-évaluation)\n   - Fournir des conseils pour une exploration et une application plus approfondies\n\n5. **Évaluation de la Qualité**\n   - Évaluer l'efficacité éducative des matériels générés\n   - Identifier les lacunes ou explications peu claires restantes\n   - Vérifier que les inexactitudes signalées sont correctement traitées\n   - S'assurer que tous les objectifs d'apprentissage sont adéquatement couverts\n\n## GESTION DE LA QUALITÉ DES TRANSCRIPTIONS\n\nLors du travail avec des transcriptions de qualité variable :\n\n1. **Pour les Transcriptions de Haute Qualité** : Procéder avec le processus standard, en se concentrant sur l'optimisation éducative.\n\n2. **Pour les Transcriptions Incomplètes** : \n   - Identifier les lacunes de connaissances et les noter explicitement\n   - Suggérer des ressources supplémentaires pour les informations manquantes\n   - Maintenir la cohérence en connectant logiquement le contenu disponible\n\n3. **Pour les Transcriptions Techniques/Complexes** :\n   - Décomposer la terminologie complexe avec des explications supplémentaires\n   - Utiliser des analogies simplifiées et des représentations visuelles\n   - Fournir un glossaire des termes techniques\n   - Créer des niveaux de complexité progressive pour différentes capacités d'apprentissage\n\n4. **Pour le Contenu Potentiellement Inexact** :\n   - Signaler les affirmations qui semblent douteuses ou non fondées\n   - Noter quand les déclarations sont en conflit avec les connaissances établies\n   - Suggérer des sources de vérification le cas échéant\n   - Distinguer entre les faits établis et les opinions du locuteur\n\n## STRUCTURE DE SORTIE\n\n1. **Objectifs d'Apprentissage** - Ce que vous apprendrez de ce matériel\n2. **Concepts Clés** - Idées essentielles présentées avec des explications claires\n3. **Carte Conceptuelle** - Représentation visuelle ASCII de la façon dont les idées se connectent\n4. **Analyse Détaillée** - Explication organisée du contenu\n5. **Résumé** - Revue concise des points les plus importants\n6. **Application** - Comment utiliser ces connaissances de façon pratique\n7. **Auto-Évaluation** - Questions pour vérifier la compréhension",
    "shortSummary": "# YouTube Video Summary\n\nPlease provide a concise, clear summary of this YouTube video transcript. Your summary should:\n\n1. Capture the main points and key takeaways in 3-5 bullet points\n2. Be approximately 150-250 words total\n3. Maintain the original speaker's core message and intent\n4. Filter out filler words, repetitions, and tangential content\n5. Present information in a logical, easy-to-follow structure\n\nFocus on delivering maximum value and clarity in minimum space.",
    "detailedSummary": "# Detailed YouTube Video Analysis\n\nPlease analyze this YouTube video transcript comprehensively. Your analysis should include:\n\n## 1. Executive Summary (100-150 words)\nA concise overview of the main topic and key points.\n\n## 2. Key Points\nThe 5-7 most important ideas or arguments presented, with brief explanations.\n\n## 3. Content Breakdown\nA section-by-section analysis of the video's content, organized by main topics.\n\n## 4. Notable Quotes\nThe most significant or insightful direct quotes from the transcript.\n\n## 5. Context & Background\nRelevant contextual information that helps understand the content better.\n\n## 6. Analysis & Insights\nYour interpretation of the content's significance, accuracy, and value.\n\n## 7. Potential Applications\nHow the information could be applied practically."
  }
}
```

# images/icon16.png

This is a binary file of the type: Image

# images/icon48.png

This is a binary file of the type: Image

# images/icon128.png

This is a binary file of the type: Image

# manifest.json

```json
{
  "manifest_version": 3,
  "name": "YouTube Transcript Summarizer for Claude",
  "version": "1.0",
  "permissions": [
    "contextMenus",
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "https://*.youtube.com/*",
    "https://claude.ai/*"
  ],
  "background": {
    "service_worker": "dist/background.bundle.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "images/icon128.png"
  },
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["*://*.youtube.com/watch?*"],
      "js": ["dist/youtube-content.bundle.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["config.json", "dist/*.bundle.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

# package.json

```json
{
  "devDependencies": {
    "@babel/core": "^7.26.9",
    "@babel/preset-env": "^7.26.9",
    "babel-loader": "^10.0.0",
    "core-js": "^3.41.0",
    "webpack": "^5.98.0",
    "webpack-cli": "^6.0.1"
  },
  "dependencies": {
    "youtube-transcript": "^1.2.1"
  },
  "scripts": {
    "build": "webpack",
    "watch": "webpack --watch"
  },
  "name": "ai-youtube-transcript-summarizer",
  "version": "1.0.0",
  "main": "webpack.config.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pbeheyt/AI-YouTube-Transcript-Summarizer.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/pbeheyt/AI-YouTube-Transcript-Summarizer/issues"
  },
  "homepage": "https://github.com/pbeheyt/AI-YouTube-Transcript-Summarizer#readme",
  "description": ""
}

```

# popup.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI YouTube Transcript Summarizer</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap');

    body {
      font-family: 'Roboto', sans-serif;
      background: linear-gradient(135deg, #1a1a1b, #2a2a2b);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: #ffffff;
    }

    .container {
      background-color: #3c3c3c;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      text-align: center;
      width: 280px;
    }

    .title {
      font-size: 16px;
      margin-bottom: 15px;
      color: #9C27B0;
    }

    .logo {
      margin-bottom: 10px;
      font-weight: bold;
      color: #9C27B0;
      font-size: 18px;
    }

    .prompt-select-container {
      margin-bottom: 15px;
      text-align: left;
    }

    .prompt-select-label {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .prompt-select {
      width: 100%;
      padding: 8px 10px;
      border-radius: 5px;
      background-color: #2a2a2b;
      color: white;
      border: 1px solid #555;
      font-size: 14px;
      appearance: none;
    }

    .prompt-select:focus {
      outline: none;
      border-color: #9C27B0;
    }

    button {
      background: #9C27B0;
      color: #ffffff;
      padding: 12px 10px;
      font-size: 14px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      width: 100%;
      white-space: normal;
    }

    button:hover {
      background: #7B1FA2;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .status-message {
      margin-top: 10px;
      font-size: 12px;
      color: #ccc;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="title">YouTube Transcript Summarizer</h1>
    
    <div class="logo">Claude AI</div>
    
    <div class="prompt-select-container">
      <label for="promptType" class="prompt-select-label">Summary Type:</label>
      <select id="promptType" class="prompt-select">
        <option value="academic">Academic Analysis</option>
        <option value="shortSummary">Quick Summary</option>
        <option value="detailedSummary">Detailed Analysis</option>
      </select>
    </div>
    
    <button type="button" id="summarizeBtn">Summarize This Video</button>
    
    <div id="statusMessage" class="status-message"></div>
  </div>
  <!-- Updated to use bundled JS file -->
  <script src="dist/popup.bundle.js"></script>
</body>
</html>
```

# src/background.js

```js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const response = await fetch(chrome.runtime.getURL('config.json'));
      const config = await response.json();
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
  // Initialize default settings if not already set
  const defaultSettings = {
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
    title: 'Summarize this YouTube Video with Claude',
    contexts: ['page'],
    documentUrlPatterns: ['*://*.youtube.com/watch?*']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'summarizeYouTubeVideo') {
    try {
      // Clear any previous transcript data first
      const settingsToKeep = await chrome.storage.local.get(['selectedPromptType']);
      
      // Clear all storage
      await chrome.storage.local.clear();
      
      // Restore just the settings
      await chrome.storage.local.set(settingsToKeep);
      
      console.log('Cleared previous data, preserved settings:', settingsToKeep);
      
      // Send message to content script to extract transcript
      chrome.tabs.sendMessage(tab.id, { action: 'extractTranscript' });
      
      // Get settings
      const { selectedPromptType } = settingsToKeep;
      
      // Get config
      const response = await fetch(chrome.runtime.getURL('config.json'));
      const config = await response.json();
      
      // Always use Claude URL
      const aiUrl = config.claudeUrl;
      
      // Get the appropriate prompt based on selected type
      const prePrompt = config.prompts[selectedPromptType] || config.prompts.academic;
      
      // Open Claude in new tab
      const newTab = await chrome.tabs.create({ url: aiUrl, active: false });
      
      // Store necessary data for content script
      await chrome.storage.local.set({
        aiTabId: newTab.id,
        scriptInjected: false,
        prePrompt: prePrompt
      });
      
      // Switch to the new tab
      await chrome.tabs.update(newTab.id, { active: true });
    } catch (error) {
      console.error('Error during YouTube summarization:', error);
    }
  }
});
```

# src/claude-content.js

```js
(() => {
    function insertText(text) {
        let editorElement = document.querySelector('p[data-placeholder="How can Claude help you today?"]');
        
        if (!editorElement) {
            editorElement = document.querySelector('[contenteditable="true"]');
        }
        
        if (!editorElement) {
            console.error('Claude editor element not found');
            return false;
        }
  
        // Clear existing content
        editorElement.innerHTML = '';
        
        // Split the text into lines and create paragraphs
        const lines = text.split('\n');
        lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line;
            editorElement.appendChild(p);
            
            // Add a line break between paragraphs
            if (index < lines.length - 1) {
                editorElement.appendChild(document.createElement('br'));
            }
        });
  
        // Remove empty states
        editorElement.classList.remove('is-empty', 'is-editor-empty');
  
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        editorElement.dispatchEvent(inputEvent);
  
        // Find and click the send button with the new selector
        setTimeout(() => {
            // Try multiple possible button selectors
            const sendButton = 
                document.querySelector('button[aria-label="Send message"]') ||
                document.querySelector('button[aria-label="Send Message"]') ||
                document.querySelector('button svg path[d*="M208.49,120.49"]')?.closest('button');
  
            if (sendButton) {
                console.log('Send button found, clicking...');
                
                // Ensure the button is enabled
                sendButton.disabled = false;
                
                // Create and dispatch multiple events for better compatibility
                ['mousedown', 'mouseup', 'click'].forEach(eventType => {
                    const event = new MouseEvent(eventType, {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        buttons: 1
                    });
                    sendButton.dispatchEvent(event);
                });
            } else {
                console.error('Send button not found');
            }
        }, 1000); // Increased delay to ensure content is properly inserted
  
        return true;
    }
  
    // Format YouTube video data
    const formatYouTubeData = (data) => {
        if (data.error) {
            return `Error: ${data.message || 'Unknown error occurred while extracting YouTube data'}`;
        }
        
        const title = data.videoTitle || 'No title available';
        const channel = data.channelName || 'Unknown channel';
        const description = data.videoDescription || 'No description available';
        const views = data.views || 'Unknown';
        const date = data.publishDate || 'Unknown date';
        const transcript = data.transcript || 'No transcript available';
        
        return `YouTube Video Information:
  Title: ${title}
  Channel: ${channel}
  Views: ${views}
  Published: ${date}
  
  Description:
  ${description}
  
  Transcript:
  ${transcript}`;
    };
  
    const handleProcess = async () => {
        try {
            const result = await chrome.storage.local.get(['prePrompt', 'youtubeVideoData']);
            
            console.log('Retrieved data:', result);
  
            if (!result.prePrompt) {
                throw new Error('No prePrompt found in storage');
            }
  
            if (!result.youtubeVideoData) {
                throw new Error('YouTube data missing from storage');
            }
  
            const youtubeContent = formatYouTubeData(result.youtubeVideoData);
            const fullText = `${result.prePrompt}\n\n${youtubeContent}`;
            
            console.log('Attempting to insert text into Claude...');
  
            const success = insertText(fullText);
            
            if (success) {
                console.log('Message successfully inserted into Claude');
            } else {
                throw new Error('Failed to insert message into Claude');
            }
        } catch (error) {
            console.error('Error in handling Claude process:', error);
        }
    };
  
    // Initialize process when the page is ready
    const observerConfig = { childList: true, subtree: true };
    let retryCount = 0;
    const MAX_RETRIES = 10;
  
    const observer = new MutationObserver(() => {
        const editorElement = document.querySelector('p[data-placeholder="How can Claude help you today?"]') || 
                            document.querySelector('[contenteditable="true"]');
        
        if (editorElement) {
            console.log('Claude editor element found');
            observer.disconnect();
            handleProcess();
        } else {
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
                observer.disconnect();
                console.error('Failed to find Claude editor element after maximum retries');
            }
        }
    });
  
    const startObserver = () => {
        if (document.readyState === 'complete') {
            observer.observe(document.body, observerConfig);
        } else {
            window.addEventListener('load', () => {
                observer.observe(document.body, observerConfig);
            });
        }
    };
  
    startObserver();
  })();
```

# src/popup.js

```js
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
      
      // Always use Claude
      const useClaudeAI = true;
      const selectedPromptType = promptTypeSelect.value;
      
      // Save settings but clear old transcript data
      // This is the key fix - we preserve only the settings
      const settingsToKeep = { 
        selectedPromptType
      };
      
      // Clear all local storage but preserve settings
      await chrome.storage.local.clear();
      await chrome.storage.local.set(settingsToKeep);
      
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
```

# src/youtube-content.js

```js
// Use CommonJS import style for better compatibility with webpack
const { YoutubeTranscript } = require('youtube-transcript');

/**
 * YouTube Content Script for extracting video information and transcript
 * Uses the youtube-transcript npm package for reliable transcript extraction
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

// Log when content script loads
console.log('YouTube transcript extractor content script loaded');

// Automatically extract transcript when the page loads (for context menu functionality)
if (window.location.href.includes('youtube.com/watch')) {
  console.log('YouTube video page detected, preparing for transcript extraction');
  // Wait a bit for the page to stabilize
  setTimeout(extractAndSaveVideoData, 1500);
}
```

# webpack.config.js

```js
const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    'youtube-content': './src/youtube-content.js',
    'claude-content': './src/claude-content.js',
    popup: './src/popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production', // or 'development' for debugging
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,
                targets: {
                  chrome: "88"
                }
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};
```

