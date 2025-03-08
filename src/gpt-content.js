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