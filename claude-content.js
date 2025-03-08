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