import { useRef, useState } from "react";
import { FPS, DURATION } from "../constants/reelConfig";

export const useVideoRecorder = (options = {}) => {
  const {
    musicUrl = "/music.mp3",
    volume = 0.3,
    fadeOut = true,
    loop = false,
  } = options;

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const animationRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);

  /* -------------------------------------------------- */
  /* CREATE AUDIO TRACK (MP3 → MediaStreamTrack)        */
  /* -------------------------------------------------- */

  const createAudioTrack = async () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    try {
      console.log("Loading music:", musicUrl);

      const response = await fetch(musicUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = loop;

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

      // fade out
      if (fadeOut) {
        gainNode.gain.linearRampToValueAtTime(
          0.0001,
          audioContext.currentTime + DURATION
        );
      }

      const destination = audioContext.createMediaStreamDestination();

      source.connect(gainNode);
      gainNode.connect(destination);

      // also play in speakers (optional - for preview)
      gainNode.connect(audioContext.destination);

      audioRef.current = {
        audioContext,
        source,
        gainNode,
      };

      return destination.stream.getAudioTracks()[0];
    } catch (err) {
      console.error("MP3 load failed → using fallback tone", err);

      // fallback oscillator so recorder still has audio track
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const dest = audioContext.createMediaStreamDestination();

      osc.type = "sine";
      osc.frequency.value = 440;

      gain.gain.value = 0.05;

      osc.connect(gain);
      gain.connect(dest);
      gain.connect(audioContext.destination);

      audioRef.current = {
        audioContext,
        oscillator: osc,
        gainNode: gain,
      };

      return dest.stream.getAudioTracks()[0];
    }
  };

  /* -------------------------------------------------- */
  /* START RECORDING                                    */
  /* -------------------------------------------------- */

  const startRecording = async (canvas, onFrame, onComplete) => {
    if (!canvas) return;

    setVideoBlob(null);
    setVideoUrl(null);
    setGenerationProgress(0);

    // canvas video stream
    const canvasStream = canvas.captureStream(FPS);

    // audio track
    const audioTrack = await createAudioTrack();

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      audioTrack,
    ]);

    // safer mime
    const recorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });

      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      setRecording(false);

      if (onComplete) onComplete(blob);
    };

    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setRecording(true);

    /* ---------- START AUDIO with user interaction ---------- */
    
    // Resume audio context (required for Chrome autoplay policy)
    const audio = audioRef.current;
    if (audio && audio.audioContext.state === "suspended") {
      await audio.audioContext.resume();
    }

    // Small delay to ensure everything is ready
    setTimeout(() => {
      if (!audio) return;

      try {
        if (audio.source && !audio.source.started) {
          audio.source.start(0);
          audio.source.started = true;
        }
        if (audio.oscillator && !audio.oscillator.started) {
          audio.oscillator.start(0);
          audio.oscillator.started = true;
        }
      } catch (err) {
        console.log("Audio start error:", err);
      }
    }, 100);

    /* ---------- ANIMATION LOOP ---------- */

    let frame = 0;
    const totalFrames = FPS * DURATION;

    const animate = () => {
      onFrame(frame, totalFrames);

      frame++;

      setGenerationProgress(Math.min((frame / totalFrames) * 100, 99));

      if (frame < totalFrames) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setGenerationProgress(100);
        stopRecording();
      }
    };

    animate();
  };

  /* -------------------------------------------------- */
  /* STOP RECORDING                                     */
  /* -------------------------------------------------- */

  const stopRecording = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const audio = audioRef.current;

    if (audio) {
      try {
        if (audio.source && audio.source.started) {
          audio.source.stop();
        }
        if (audio.oscillator && audio.oscillator.started) {
          audio.oscillator.stop();
        }
        // Don't close immediately - let audio finish naturally
        setTimeout(() => {
          audio.audioContext.close();
        }, 500);
      } catch (err) {
        console.log("Audio stop error:", err);
      }
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
  };

  /* -------------------------------------------------- */
  /* CANCEL                                             */
  /* -------------------------------------------------- */

  const cancelRecording = () => {
    stopRecording();
    setVideoBlob(null);
    setVideoUrl(null);
    setGenerationProgress(0);
  };

  /* -------------------------------------------------- */
  /* CLEANUP                                            */
  /* -------------------------------------------------- */

  const cleanup = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    
    // Close audio context if still open
    if (audioRef.current?.audioContext) {
      audioRef.current.audioContext.close();
    }
  };

  return {
    recording,
    videoBlob,
    videoUrl,
    generationProgress,
    startRecording,
    stopRecording,
    cancelRecording,
    cleanup,
  };
};