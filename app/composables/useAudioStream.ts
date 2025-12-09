/**
 * useAudioStream Composable
 *
 * Handles audio processing from the microphone stream using Web Audio API.
 * Provides audio analysis (volume level) and integrates with the mock tajwīd API.
 */

import type { TajweedTokenFeedback, HighlightStatus } from "~/types";

export interface MockTajweedTiming {
  wordIndex: number;
  startTimeMs: number;
  endTimeMs: number;
  status: HighlightStatus;
  rulesApplied?: string[];
}

export interface AudioStreamState {
  isProcessing: boolean;
  volumeLevel: number; // 0-1
  error: string | null;
}

export function useAudioStream() {
  // State
  const isProcessing = ref(false);
  const volumeLevel = ref(0);
  const error = ref<string | null>(null);

  // Audio context and nodes
  let audioContext: AudioContext | null = null;
  let analyserNode: AnalyserNode | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  let animationFrameId: number | null = null;

  /**
   * Initialize audio processing from a MediaStream
   */
  function startProcessing(stream: MediaStream): boolean {
    try {
      error.value = null;

      // Create audio context
      audioContext = new AudioContext();

      // Create source from stream
      sourceNode = audioContext.createMediaStreamSource(stream);

      // Create analyser for volume visualization
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;

      // Connect nodes
      sourceNode.connect(analyserNode);
      // Note: We don't connect to destination (speakers) to avoid feedback

      isProcessing.value = true;

      // Start volume monitoring
      startVolumeMonitoring();

      return true;
    } catch (err) {
      const e = err as Error;
      error.value = `Audio processing error: ${e.message}`;
      return false;
    }
  }

  /**
   * Monitor volume level continuously
   */
  function startVolumeMonitoring() {
    if (!analyserNode) return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    function updateVolume() {
      if (!analyserNode || !isProcessing.value) return;

      analyserNode.getByteFrequencyData(dataArray);

      // Calculate average volume (RMS)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      // Normalize to 0-1 range
      volumeLevel.value = Math.min(average / 128, 1);

      animationFrameId = requestAnimationFrame(updateVolume);
    }

    updateVolume();
  }

  /**
   * Stop audio processing
   */
  function stopProcessing() {
    isProcessing.value = false;
    volumeLevel.value = 0;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }

    if (analyserNode) {
      analyserNode.disconnect();
      analyserNode = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }

  /**
   * Fetch mock tajwīd timing from the API
   *
   * In Phase 2, this returns simulated timing data.
   * In Phase 4, this will stream to a real AI service.
   */
  async function fetchMockTiming(
    surahNumber: number,
    ayahNumber: number,
    wordCount: number
  ): Promise<MockTajweedTiming[]> {
    try {
      const response = await $fetch<{ timings: MockTajweedTiming[] }>(
        "/api/tajweed/analyze",
        {
          method: "POST",
          body: {
            surahNumber,
            ayahNumber,
            wordCount,
          },
        }
      );

      return response.timings;
    } catch (err) {
      const e = err as Error;
      error.value = `API error: ${e.message}`;
      return [];
    }
  }

  /**
   * Create a timeline runner that executes callbacks based on timing data
   */
  function createTimingRunner(
    timings: MockTajweedTiming[],
    onWordStart: (timing: MockTajweedTiming) => void,
    onWordEnd: (timing: MockTajweedTiming) => void,
    onComplete: () => void
  ) {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let isRunning = false;
    const startTime = Date.now();

    function start() {
      if (isRunning) return;
      isRunning = true;

      // Schedule callbacks for each word
      for (const timing of timings) {
        // Word start
        const startTimeout = setTimeout(() => {
          if (isRunning) {
            onWordStart(timing);
          }
        }, timing.startTimeMs);

        // Word end
        const endTimeout = setTimeout(() => {
          if (isRunning) {
            onWordEnd(timing);
          }
        }, timing.endTimeMs);

        timeouts.push(startTimeout, endTimeout);
      }

      // Schedule completion
      if (timings.length > 0) {
        const lastTiming = timings[timings.length - 1];
        const completeTimeout = setTimeout(() => {
          if (isRunning) {
            isRunning = false;
            onComplete();
          }
        }, lastTiming.endTimeMs + 500); // Small delay after last word

        timeouts.push(completeTimeout);
      }
    }

    function stop() {
      isRunning = false;
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
      timeouts = [];
    }

    function getElapsedTime(): number {
      return Date.now() - startTime;
    }

    return {
      start,
      stop,
      isRunning: () => isRunning,
      getElapsedTime,
    };
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopProcessing();
  });

  return {
    // State
    isProcessing: readonly(isProcessing),
    volumeLevel: readonly(volumeLevel),
    error: readonly(error),

    // Methods
    startProcessing,
    stopProcessing,
    fetchMockTiming,
    createTimingRunner,
  };
}
