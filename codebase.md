# background.js

```js
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
        console.log('Attempting to inject script:', result.useClaudeAI ? 'claude-content.js' : 'gpt-content.js');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [result.useClaudeAI ? 'claude-content.js' : 'gpt-content.js']
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
```

# claude-content.js

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

# config.json

```json
{
  "chatgptUrl": "https://chatgpt.com/",
  "claudeUrl": "https://claude.ai/new",
  "prompts": {
    "academic": "# Machine d'Enseignement pour Transcriptions YouTube\n\n## RÔLE : Synthétiseur Éducatif Adaptatif\n\nVous êtes un expert en traitement de contenu éducatif spécialisé dans la transformation de transcriptions YouTube brutes en matériels d'apprentissage optimisés. Utilisant des cadres pédagogiques avancés.\n\n## CAPACITÉS\n\n1. **Analyse et Extraction de Contenu**\n   - Extraire les concepts clés, faits, théories et méthodologies des transcriptions\n   - Identifier la hiérarchie conceptuelle et la structure des connaissances\n   - Reconnaître l'approche et les méthodes d'enseignement de l'orateur\n   - Filtrer le contenu non pertinent, les mots de remplissage et les répétitions\n   - Signaler les inexactitudes potentielles ou les affirmations non étayées pour vérification\n\n2. **Restructuration Éducative**\n   - Organiser le contenu selon les meilleures pratiques éducatives\n   - Développer des objectifs d'apprentissage clairs basés sur le contenu\n   - Créer une progression logique des connaissances (fondamentales → avancées)\n   - Identifier et clarifier les points de confusion potentiels\n   - Décomposer des sujets complexes en unités d'apprentissage gérables\n\n3. **Adaptation au Style d'Apprentissage**\n   - S'adapter à différentes approches cognitives (analytique, pratique, créative)\n   - Personnaliser selon divers types d'intelligence (logique, linguistique, spatiale, etc.)\n   - Ajuster pour différentes capacités d'attention et vitesses de traitement\n   - Fournir des explications alternatives pour les concepts difficiles\n\n## PROCESSUS\n\n1. **Analyse d'Entrée**\n   - Examiner la transcription pour identifier le sujet, la portée, la complexité et la structure\n   - Déterminer le niveau éducatif et les connaissances préalables requises\n   - Évaluer l'approche pédagogique originale utilisée dans la vidéo\n   - Reconnaître les forces et les limites du matériel original\n   - Évaluer la qualité de la transcription et combler les lacunes ou ambiguïtés\n\n2. **Intégration du Profil de l'Apprenant**\n   - Prendre en compte les besoins, objectifs et préférences spécifiés par l'apprenant\n   - S'adapter à leur niveau de connaissance actuel et au contexte d'apprentissage\n   - Optimiser pour leur temps d'étude et leurs ressources disponibles\n   - Tenir compte des défis d'apprentissage spécifiques si mentionnés\n   - Aligner la complexité du contenu avec les capacités de charge cognitive\n\n3. **Transformation du Contenu**\n   - Réorganiser le matériel dans une structure éducative cohérente\n   - Simplifier les concepts complexes avec des analogies et des exemples\n   - Élaborer sur les points peu clairs ou insuffisamment expliqués\n   - Connecter les nouvelles informations aux cadres de connaissances établis\n   - Vérifier l'exactitude factuelle et noter toute affirmation nécessitant une enquête plus approfondie\n\n4. **Génération de Sortie**\n   - Créer un matériel d'apprentissage principal dans le format le plus approprié\n   - Développer des ressources supplémentaires pour le renforcement\n   - Inclure des éléments métacognitifs (invites de réflexion, auto-évaluation)\n   - Fournir des conseils pour une exploration et une application plus approfondies\n\n5. **Évaluation de la Qualité**\n   - Évaluer l'efficacité éducative des matériels générés\n   - Identifier les lacunes ou explications peu claires restantes\n   - Vérifier que les inexactitudes signalées sont correctement traitées\n   - S'assurer que tous les objectifs d'apprentissage sont adéquatement couverts\n\n## GESTION DE LA QUALITÉ DES TRANSCRIPTIONS\n\nLors du travail avec des transcriptions de qualité variable :\n\n1. **Pour les Transcriptions de Haute Qualité** : Procéder avec le processus standard, en se concentrant sur l'optimisation éducative.\n\n2. **Pour les Transcriptions Incomplètes** : \n   - Identifier les lacunes de connaissances et les noter explicitement\n   - Suggérer des ressources supplémentaires pour les informations manquantes\n   - Maintenir la cohérence en connectant logiquement le contenu disponible\n\n3. **Pour les Transcriptions Techniques/Complexes** :\n   - Décomposer la terminologie complexe avec des explications supplémentaires\n   - Utiliser des analogies simplifiées et des représentations visuelles\n   - Fournir un glossaire des termes techniques\n   - Créer des niveaux de complexité progressive pour différentes capacités d'apprentissage\n\n4. **Pour le Contenu Potentiellement Inexact** :\n   - Signaler les affirmations qui semblent douteuses ou non fondées\n   - Noter quand les déclarations sont en conflit avec les connaissances établies\n   - Suggérer des sources de vérification le cas échéant\n   - Distinguer entre les faits établis et les opinions du locuteur\n\n## STRUCTURE DE SORTIE\n\n1. **Objectifs d'Apprentissage** - Ce que vous apprendrez de ce matériel\n2. **Concepts Clés** - Idées essentielles présentées avec des explications claires\n3. **Carte Conceptuelle** - Représentation visuelle ASCII de la façon dont les idées se connectent\n4. **Analyse Détaillée** - Explication organisée du contenu\n5. **Résumé** - Revue concise des points les plus importants\n6. **Application** - Comment utiliser ces connaissances de façon pratique\n7. **Auto-Évaluation** - Questions pour vérifier la compréhension",
    "shortSummary": "# YouTube Video Summary\n\nPlease provide a concise, clear summary of this YouTube video transcript. Your summary should:\n\n1. Capture the main points and key takeaways in 3-5 bullet points\n2. Be approximately 150-250 words total\n3. Maintain the original speaker's core message and intent\n4. Filter out filler words, repetitions, and tangential content\n5. Present information in a logical, easy-to-follow structure\n\nFocus on delivering maximum value and clarity in minimum space.",
    "detailedSummary": "# Detailed YouTube Video Analysis\n\nPlease analyze this YouTube video transcript comprehensively. Your analysis should include:\n\n## 1. Executive Summary (100-150 words)\nA concise overview of the main topic and key points.\n\n## 2. Key Points\nThe 5-7 most important ideas or arguments presented, with brief explanations.\n\n## 3. Content Breakdown\nA section-by-section analysis of the video's content, organized by main topics.\n\n## 4. Notable Quotes\nThe most significant or insightful direct quotes from the transcript.\n\n## 5. Context & Background\nRelevant contextual information that helps understand the content better.\n\n## 6. Analysis & Insights\nYour interpretation of the content's significance, accuracy, and value.\n\n## 7. Potential Applications\nHow the information could be applied practically.\n\nPlease maintain the original tone and intent while organizing the information in a more accessible format."
  }
}
```

# gpt-content.js

```js
(() => {
  function insertText(text) {
      const editorDiv = document.querySelector('#prompt-textarea');
      
      if (!editorDiv) {
          console.error('GPT editor div not found');
          return false;
      }

      try {
          // Set value to the text
          editorDiv.value = text;
          
          // Focus the editor
          editorDiv.focus();

          // Dispatch input event
          const inputEvent = new Event('input', { bubbles: true });
          editorDiv.dispatchEvent(inputEvent);

          // Find and click the send button
          setTimeout(() => {
              const sendButton = document.querySelector('button[data-testid="send-button"]:not(:disabled)');
              if (sendButton) {
                  console.log('Send button found, clicking...');
                  
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
                  console.error('Send button not found or disabled');
              }
          }, 1000);

          return true;
      } catch (error) {
          console.error('Error inserting text:', error);
          return false;
      }
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
          // Get both prePrompt and YouTube data in a single storage call
          const result = await chrome.storage.local.get(['prePrompt', 'youtubeVideoData']);
          
          console.log('Retrieved data for GPT:', result);

          if (!result.prePrompt) {
              throw new Error('No prePrompt found in storage');
          }

          if (!result.youtubeVideoData) {
              throw new Error('YouTube data missing from storage');
          }

          const youtubeContent = formatYouTubeData(result.youtubeVideoData);
          const fullText = `${result.prePrompt}\n\n${youtubeContent}`;
          
          console.log('Attempting to insert text into GPT...');

          const success = insertText(fullText);
          
          if (success) {
              console.log('Message successfully inserted into GPT');
          } else {
              throw new Error('Failed to insert message into GPT');
          }
      } catch (error) {
          console.error('Error in handling GPT process:', error);
      }
  };

  // Initialize process when the page is ready
  const observerConfig = { childList: true, subtree: true };
  let retryCount = 0;
  const MAX_RETRIES = 10;

  const observer = new MutationObserver(() => {
      const editorDiv = document.querySelector('#prompt-textarea');
      
      if (editorDiv) {
          console.log('GPT editor div found');
          observer.disconnect();
          handleProcess();
      } else {
          retryCount++;
          if (retryCount >= MAX_RETRIES) {
              observer.disconnect();
              console.error('Failed to find GPT editor div after maximum retries');
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

# images/icon16.png

This is a binary file of the type: Image

# images/icon48.png

This is a binary file of the type: Image

# images/icon128.png

This is a binary file of the type: Image

# lib/youtube-transcript.js

```js
/**
 * YouTube Transcript API for Chrome Extensions
 * Adapted from https://github.com/Kakulukian/youtube-transcript
 */

const RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';
const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

class YoutubeTranscriptError extends Error {
  constructor(message) {
    super(`[YoutubeTranscript] 🚨 ${message}`);
    this.name = 'YoutubeTranscriptError';
  }
}

class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
  constructor() {
    super('YouTube is receiving too many requests from this IP and now requires solving a captcha to continue');
    this.name = 'YoutubeTranscriptTooManyRequestError';
  }
}

class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`The video is no longer available (${videoId})`);
    this.name = 'YoutubeTranscriptVideoUnavailableError';
  }
}

class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`Transcript is disabled on this video (${videoId})`);
    this.name = 'YoutubeTranscriptDisabledError';
  }
}

class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`No transcripts are available for this video (${videoId})`);
    this.name = 'YoutubeTranscriptNotAvailableError';
  }
}

class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
  constructor(lang, availableLangs, videoId) {
    super(`No transcripts are available in ${lang} this video (${videoId}). Available languages: ${availableLangs.join(', ')}`);
    this.name = 'YoutubeTranscriptNotAvailableLanguageError';
  }
}

/**
 * Class to retrieve transcript if exists
 */
class YoutubeTranscript {
  /**
   * Fetch transcript from YouTube Video
   * @param {string} videoId - Video url or video identifier
   * @param {Object} config - Configuration options
   * @param {string} [config.lang] - Get transcript in a specific language ISO code
   * @returns {Promise<Array<{text: string, duration: number, offset: number, lang: string}>>}
   */
  static async fetchTranscript(videoId, config = {}) {
    const identifier = this.retrieveVideoId(videoId);
    const videoPageResponse = await fetch(
      `https://www.youtube.com/watch?v=${identifier}`,
      {
        headers: {
          ...(config.lang && { 'Accept-Language': config.lang }),
          'User-Agent': USER_AGENT,
        },
      }
    );
    
    if (!videoPageResponse.ok) {
      if (videoPageResponse.status === 429) {
        throw new YoutubeTranscriptTooManyRequestError();
      }
      throw new YoutubeTranscriptVideoUnavailableError(videoId);
    }
    
    const videoPageBody = await videoPageResponse.text();

    const splittedHTML = videoPageBody.split('"captions":');

    if (splittedHTML.length <= 1) {
      if (videoPageBody.includes('class="g-recaptcha"')) {
        throw new YoutubeTranscriptTooManyRequestError();
      }
      if (!videoPageBody.includes('"playabilityStatus":')) {
        throw new YoutubeTranscriptVideoUnavailableError(videoId);
      }
      throw new YoutubeTranscriptDisabledError(videoId);
    }

    let captions;
    try {
      captions = JSON.parse(
        splittedHTML[1].split(',"videoDetails')[0].replace('\n', '')
      )?.['playerCaptionsTracklistRenderer'];
    } catch (e) {
      throw new YoutubeTranscriptDisabledError(videoId);
    }

    if (!captions) {
      throw new YoutubeTranscriptDisabledError(videoId);
    }

    if (!('captionTracks' in captions)) {
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }

    if (
      config.lang &&
      !captions.captionTracks.some(
        (track) => track.languageCode === config.lang
      )
    ) {
      throw new YoutubeTranscriptNotAvailableLanguageError(
        config.lang,
        captions.captionTracks.map((track) => track.languageCode),
        videoId
      );
    }

    const transcriptTrack = config.lang
      ? captions.captionTracks.find(
          (track) => track.languageCode === config.lang
        )
      : captions.captionTracks[0];
    
    const transcriptURL = transcriptTrack.baseUrl;
    const languageCode = transcriptTrack.languageCode;

    const transcriptResponse = await fetch(transcriptURL, {
      headers: {
        ...(config.lang && { 'Accept-Language': config.lang }),
        'User-Agent': USER_AGENT,
      },
    });
    
    if (!transcriptResponse.ok) {
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }
    
    const transcriptBody = await transcriptResponse.text();
    const results = Array.from(transcriptBody.matchAll(RE_XML_TRANSCRIPT));
    
    return results.map((result) => ({
      text: result[3],
      duration: parseFloat(result[2]),
      offset: parseFloat(result[1]),
      lang: config.lang ?? languageCode,
    }));
  }

  /**
   * Retrieve video id from url or string
   * @param {string} videoId - Video url or video id
   * @returns {string} The extracted video ID
   */
  static retrieveVideoId(videoId) {
    if (videoId.length === 11) {
      return videoId;
    }
    const matchId = videoId.match(RE_YOUTUBE);
    if (matchId && matchId.length) {
      return matchId[1];
    }
    throw new YoutubeTranscriptError('Impossible to retrieve YouTube video ID.');
  }
}

// Export classes and functions to make them available globally
window.YoutubeTranscript = YoutubeTranscript;
window.YoutubeTranscriptError = YoutubeTranscriptError;
window.YoutubeTranscriptTooManyRequestError = YoutubeTranscriptTooManyRequestError;
window.YoutubeTranscriptVideoUnavailableError = YoutubeTranscriptVideoUnavailableError;
window.YoutubeTranscriptDisabledError = YoutubeTranscriptDisabledError;
window.YoutubeTranscriptNotAvailableError = YoutubeTranscriptNotAvailableError;
window.YoutubeTranscriptNotAvailableLanguageError = YoutubeTranscriptNotAvailableLanguageError;
```

# manifest.json

```json
{
  "manifest_version": 3,
  "name": "AI YouTube Transcript Summarizer",
  "version": "1.0",
  "permissions": [
    "contextMenus",
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "https://*.youtube.com/*",
    "https://chatgpt.com//*",
    "https://claude.ai/*"
  ],
  "background": {
    "service_worker": "background.js"
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
      "js": ["lib/youtube-transcript.js", "youtube-content.js"]
    }
  ]
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
      color: #ff0000;
    }

    .toggle-container {
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      margin: 0 10px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #2196F3;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #9C27B0;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .label {
      font-size: 14px;
      font-weight: bold;
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
      background: #ff0000;
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
      background: #cc0000;
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
    
    <div class="toggle-container">
      <span class="label" style="opacity: 0.7;">GPT</span>
      <label class="toggle-switch">
        <input type="checkbox" id="aiToggle" checked>
        <span class="slider"></span>
      </label>
      <span class="label" style="font-weight: bold;">Claude</span>
    </div>
    
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
  <script src="popup.js"></script>
</body>
</html>
```

# popup.js

```js
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
```

# youtube-content.js

```js
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
```

