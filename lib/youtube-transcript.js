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