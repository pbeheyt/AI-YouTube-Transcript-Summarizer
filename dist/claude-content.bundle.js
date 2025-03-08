(()=>{const e={childList:!0,subtree:!0};let o=0;const t=new MutationObserver((()=>{document.querySelector('p[data-placeholder="How can Claude help you today?"]')||document.querySelector('[contenteditable="true"]')?(console.log("Claude editor element found"),t.disconnect(),(async()=>{try{const o=await chrome.storage.local.get(["prePrompt","youtubeVideoData"]);if(console.log("Retrieved data:",o),!o.prePrompt)throw new Error("No prePrompt found in storage");if(!o.youtubeVideoData)throw new Error("YouTube data missing from storage");const t=(e=o.youtubeVideoData).error?`Error: ${e.message||"Unknown error occurred while extracting YouTube data"}`:`YouTube Video Information:\n  Title: ${e.videoTitle||"No title available"}\n  Channel: ${e.channelName||"Unknown channel"}\n  \n  Description:\n  ${e.videoDescription||"No description available"}\n  \n  Transcript:\n  ${e.transcript||"No transcript available"}`,n=`${o.prePrompt}\n\n${t}`;if(console.log("Attempting to insert text into Claude..."),!function(e){let o=document.querySelector('p[data-placeholder="How can Claude help you today?"]');if(o||(o=document.querySelector('[contenteditable="true"]')),!o)return console.error("Claude editor element not found"),!1;o.innerHTML="";const t=e.split("\n");t.forEach(((e,n)=>{const r=document.createElement("p");r.textContent=e,o.appendChild(r),n<t.length-1&&o.appendChild(document.createElement("br"))})),o.classList.remove("is-empty","is-editor-empty");const n=new Event("input",{bubbles:!0});return o.dispatchEvent(n),setTimeout((()=>{var e;const o=document.querySelector('button[aria-label="Send message"]')||document.querySelector('button[aria-label="Send Message"]')||(null===(e=document.querySelector('button svg path[d*="M208.49,120.49"]'))||void 0===e?void 0:e.closest("button"));o?(console.log("Send button found, clicking..."),o.disabled=!1,["mousedown","mouseup","click"].forEach((e=>{const t=new MouseEvent(e,{view:window,bubbles:!0,cancelable:!0,buttons:1});o.dispatchEvent(t)}))):console.error("Send button not found")}),1e3),!0}(n))throw new Error("Failed to insert message into Claude");console.log("Message successfully inserted into Claude")}catch(e){console.error("Error in handling Claude process:",e)}var e})()):(o++,o>=10&&(t.disconnect(),console.error("Failed to find Claude editor element after maximum retries")))}));"complete"===document.readyState?t.observe(document.body,e):window.addEventListener("load",(()=>{t.observe(document.body,e)}))})();