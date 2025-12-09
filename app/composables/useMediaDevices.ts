/**
 * useMediaDevices Composable
 *
 * Handles microphone (and optionally camera) access using getUserMedia.
 * Provides reactive state for permission status and audio stream.
 */

export interface MediaDevicesState {
  isMicSupported: boolean;
  isMicGranted: boolean;
  isMicActive: boolean;
  isCameraSupported: boolean;
  isCameraGranted: boolean;
  isCameraActive: boolean;
  error: string | null;
}

export function useMediaDevices() {
  // State
  const isMicSupported = ref(false);
  const isMicGranted = ref(false);
  const isMicActive = ref(false);
  const isCameraSupported = ref(false);
  const isCameraGranted = ref(false);
  const isCameraActive = ref(false);
  const error = ref<string | null>(null);

  // Streams
  const micStream = ref<MediaStream | null>(null);
  const cameraStream = ref<MediaStream | null>(null);

  // Check browser support on mount
  onMounted(() => {
    checkSupport();
  });

  /**
   * Check if getUserMedia is supported
   */
  function checkSupport() {
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
      isMicSupported.value = true;
      isCameraSupported.value = true;
    } else {
      isMicSupported.value = false;
      isCameraSupported.value = false;
      error.value = "getUserMedia is not supported in this browser";
    }
  }

  /**
   * Request microphone permission and start capturing
   */
  async function startMic(): Promise<MediaStream | null> {
    if (!isMicSupported.value) {
      error.value = "Microphone is not supported";
      return null;
    }

    try {
      error.value = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStream.value = stream;
      isMicGranted.value = true;
      isMicActive.value = true;

      return stream;
    } catch (err) {
      const e = err as Error;
      isMicGranted.value = false;
      isMicActive.value = false;

      if (e.name === "NotAllowedError") {
        error.value = "Microphone permission denied";
      } else if (e.name === "NotFoundError") {
        error.value = "No microphone found";
      } else {
        error.value = `Microphone error: ${e.message}`;
      }

      return null;
    }
  }

  /**
   * Stop microphone capture
   */
  function stopMic() {
    if (micStream.value) {
      micStream.value.getTracks().forEach((track) => track.stop());
      micStream.value = null;
    }
    isMicActive.value = false;
  }

  /**
   * Request front camera permission and start capturing
   */
  async function startCamera(): Promise<MediaStream | null> {
    if (!isCameraSupported.value) {
      error.value = "Camera is not supported";
      return null;
    }

    try {
      error.value = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
      });

      cameraStream.value = stream;
      isCameraGranted.value = true;
      isCameraActive.value = true;

      return stream;
    } catch (err) {
      const e = err as Error;
      isCameraGranted.value = false;
      isCameraActive.value = false;

      if (e.name === "NotAllowedError") {
        error.value = "Camera permission denied";
      } else if (e.name === "NotFoundError") {
        error.value = "No camera found";
      } else {
        error.value = `Camera error: ${e.message}`;
      }

      return null;
    }
  }

  /**
   * Stop camera capture
   */
  function stopCamera() {
    if (cameraStream.value) {
      cameraStream.value.getTracks().forEach((track) => track.stop());
      cameraStream.value = null;
    }
    isCameraActive.value = false;
  }

  /**
   * Stop all media streams
   */
  function stopAll() {
    stopMic();
    stopCamera();
  }

  /**
   * Toggle microphone on/off
   */
  async function toggleMic(): Promise<boolean> {
    if (isMicActive.value) {
      stopMic();
      return false;
    } else {
      const stream = await startMic();
      return stream !== null;
    }
  }

  /**
   * Toggle camera on/off
   */
  async function toggleCamera(): Promise<boolean> {
    if (isCameraActive.value) {
      stopCamera();
      return false;
    } else {
      const stream = await startCamera();
      return stream !== null;
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopAll();
  });

  return {
    // State
    isMicSupported: readonly(isMicSupported),
    isMicGranted: readonly(isMicGranted),
    isMicActive: readonly(isMicActive),
    isCameraSupported: readonly(isCameraSupported),
    isCameraGranted: readonly(isCameraGranted),
    isCameraActive: readonly(isCameraActive),
    error: readonly(error),

    // Streams
    micStream: readonly(micStream),
    cameraStream: readonly(cameraStream),

    // Methods
    checkSupport,
    startMic,
    stopMic,
    startCamera,
    stopCamera,
    stopAll,
    toggleMic,
    toggleCamera,
  };
}
