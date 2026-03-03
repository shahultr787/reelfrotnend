import React, { useRef, useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import MatrimonialInfoForm from "./MatrimonialInfoForm";
import { useVideoRecorder } from "./hooks/useVideoRecorder";
import { WIDTH, HEIGHT, FPS, DURATION } from "./constants/reelConfig";
import {
  initCanvasHelpers,
  drawBackground,
  drawProfilePhoto,
  drawName,
  drawAge,
  drawInfoCards,
  drawAbout,
  drawFooter
} from "./utils/drawingUtils";

const ffmpeg = new FFmpeg();

export default function MatrimonialReelGenerator() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const photoImageRef = useRef(null);
  const matrimonialInfoRef = useRef(null);

  const [showForm, setShowForm] = useState(true);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  
  const [conversionProgress, setConversionProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  const {
    recording,
    videoBlob,
    videoUrl,
    generationProgress,
    startRecording,
    cancelRecording,
    cleanup
  } = useVideoRecorder();

  // Initialize canvas helpers
  useEffect(() => {
    initCanvasHelpers();
    return cleanup;
  }, []);

  // Auto-play video when ready
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      setTimeout(() => {
        videoRef.current.play().catch(() => {});
      }, 100);
    }
  }, [videoUrl]);

  const handleInfoSubmit = (info, photoUrl) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoUrl;
    img.onload = () => {
      photoImageRef.current = img;
      matrimonialInfoRef.current = info;
      setPhotoLoaded(true);
      setShowForm(false);
      
      setTimeout(() => {
        generateVideo();
      }, 50);
    };
  };

  const generateVideo = async () => {
    const info = matrimonialInfoRef.current;
    const photoImg = photoImageRef.current;

    if (!info || !photoImg) {
      alert("Missing information or photo");
      return;
    }

    setShowProgress(true);
    setCurrentStep("🎬 Generating your matrimonial reel...");
    setShowVideoPlayer(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    await startRecording(
      canvas,
      (frame, totalFrames) => {
        drawFrame(ctx, frame, totalFrames, info, photoImg);
      },
      () => {
        setShowProgress(false);
        setShowVideoPlayer(true);
      }
    );
  };

  const drawFrame = (ctx, frame, totalFrames, info, photoImg) => {
    const progress = Math.min(frame / FPS, 1); // Animation progress for first second
    
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    drawBackground(ctx, WIDTH, HEIGHT, info.backgroundColor);
    drawProfilePhoto(ctx, WIDTH, photoImg, progress);
    drawName(ctx, WIDTH, info.name, info.animations?.name, progress, frame);
    drawAge(ctx, WIDTH, info.age, info.animations?.age, progress, frame);
    drawInfoCards(ctx, info, progress, frame);
    drawAbout(ctx, WIDTH, info.about, info.animations?.about, progress, frame);
    drawFooter(ctx, WIDTH, HEIGHT);
  };

  const handleEditInfo = () => {
    setShowForm(true);
    setShowVideoPlayer(false);
    setPhotoLoaded(false);
    photoImageRef.current = null;
    cancelRecording();
  };

  const downloadVideo = () => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "matrimonial_profile.webm";
      a.click();
      setStatus("Download started ✔");
      setTimeout(() => setStatus(""), 3000);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  // ✅ FIXED convertToMp4 function with proper progress handling
  const convertToMp4 = async () => {
    if (!videoBlob) return;

    try {
      setLoading(true);
      setShowProgress(true);
      setConversionProgress(0);
      setCurrentStep("Loading FFmpeg...");

      if (!ffmpeg.loaded) {
        await ffmpeg.load();
      }

      setCurrentStep("Preparing video...");
      setConversionProgress(10);

      const data = await videoBlob.arrayBuffer();
      await ffmpeg.writeFile("input.webm", new Uint8Array(data));

      setCurrentStep("Converting to MP4...");
      setConversionProgress(20);

      // Remove any previous progress listeners to avoid duplicates
      ffmpeg.off("progress");

      // Add a single listener with safe progress calculation
      const progressListener = ({ progress }) => {
        // Ensure progress is between 0 and 1
        const safeProgress = Math.min(1, Math.max(0, progress));
        // Map 20% → 90% based on conversion progress
        const convertedProgress = 20 + (safeProgress * 70);
        setConversionProgress(Math.min(convertedProgress, 90));
      };

      ffmpeg.on("progress", progressListener);

    await ffmpeg.exec([
  "-i", "input.webm",
  "-c:v", "libx264",
  "-preset", "ultrafast",
  "-crf", "32",          // higher = faster
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  "-threads", "4",
  "output.mp4"
]);;

      // Remove listener after conversion (optional)
      ffmpeg.off("progress", progressListener);

      setConversionProgress(95);
      setCurrentStep("Finalizing...");

      const file = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([file.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(mp4Blob);

      setConversionProgress(100);
      setCurrentStep("Download starting...");

      const a = document.createElement("a");
      a.href = url;
      a.download = "matrimonial_profile.mp4";
      a.click();

      setTimeout(() => {
        setShowProgress(false);
        setStatus("Download started ✔");
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (err) {
      console.error(err);
      setStatus("Conversion failed ❌");
      setShowProgress(false);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 4000);
    }
  };

  if (showForm) {
    return <MatrimonialInfoForm onInfoSubmit={handleInfoSubmit} />;
  }

  return (
    <div style={{ 
      textAlign: "center", 
      padding: 20,
      maxWidth: 800,
      margin: "0 auto",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '15px 20px',
        borderRadius: 10,
        color: 'white'
      }}>
        <h1 style={{ margin: 0 }}>📽️ Your Matrimonial Reel</h1>
        <button 
          onClick={handleEditInfo}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid white',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          ✏️ Edit Info
        </button>
      </div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ 
          border: "2px solid #333",
          borderRadius: 8,
          maxWidth: "100%",
          height: "auto",
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      />

      {/* Progress Bar */}
      {showProgress && recording && (
        <ProgressBar 
          currentStep={currentStep}
          progress={generationProgress}
        />
      )}

      {/* Control Buttons */}
      <div style={{ margin: "20px 0" }}>
        {!recording && !videoUrl && (
          <button 
            onClick={generateVideo} 
            disabled={!photoLoaded}
            style={{
              padding: "15px 40px",
              fontSize: 18,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: "white",
              border: "none",
              borderRadius: 50,
              cursor: !photoLoaded ? "not-allowed" : "pointer",
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)',
              opacity: !photoLoaded ? 0.6 : 1
            }}
          >
            {!photoLoaded ? "⏳ Loading Photo..." : "🎬 Generate Reel Now"}
          </button>
        )}

        {recording && (
          <button 
            onClick={cancelRecording}
            style={{
              padding: "15px 40px",
              fontSize: 18,
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 50,
              cursor: "pointer",
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(244, 67, 54, 0.4)'
            }}
          >
            ⏹ Cancel Generation
          </button>
        )}
      </div>

      {/* Video Player */}
      {videoUrl && showVideoPlayer && (
        <VideoPlayer
          videoRef={videoRef}
          videoUrl={videoUrl}
          onDownload={downloadVideo}
          onConvert={convertToMp4}
          onNew={handleEditInfo}
          loading={loading}
          showProgress={showProgress}
          conversionProgress={conversionProgress}
          currentStep={currentStep}
        />
      )}

      {status && (
        <p style={{ 
          marginTop: 15, 
          fontWeight: "bold",
          color: status.includes("✔") ? "#4CAF50" : "#f44336"
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

// Sub-components
const ProgressBar = ({ currentStep, progress }) => (
  <div style={{ margin: "20px 0", padding: 20, backgroundColor: '#f5f5f5', borderRadius: 10 }}>
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between",
      marginBottom: 10,
      fontSize: 16,
      fontWeight: 'bold'
    }}>
      <span>{currentStep}</span>
      <span>{Math.round(progress)}%</span>
    </div>
    <div style={{
      width: "100%",
      height: 25,
      backgroundColor: "#e0e0e0",
      borderRadius: 12,
      overflow: "hidden"
    }}>
      <div style={{
        width: `${progress}%`,
        height: "100%",
        background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
        transition: "width 0.3s ease",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
      }}>
        {progress > 30 ? `${Math.round(progress)}%` : ''}
      </div>
    </div>
  </div>
);

const VideoPlayer = ({ videoRef, videoUrl, onDownload, onConvert, onNew, loading, showProgress, conversionProgress, currentStep }) => (
  <div style={{ 
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10
  }}>
    <h3 style={{ marginBottom: 15 }}>✨ Your Reel is Ready!</h3>
    <video 
      ref={videoRef}
      src={videoUrl} 
      controls 
      width="100%" 
      style={{ 
        borderRadius: 8,
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
      }}
    />
    
    <div style={{ 
      display: 'flex', 
      gap: 10, 
      justifyContent: 'center',
      marginTop: 20 
    }}>
      <button 
        onClick={onDownload}
        style={{
          padding: "12px 24px",
          fontSize: 16,
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        ⬇️ Download WebM
      </button>

      <button 
        onClick={onConvert} 
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: 16,
          backgroundColor: loading ? "#ccc" : "#2196F3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "⏳ Converting..." : "📱 Download MP4"}
      </button>

      <button 
        onClick={onNew}
        style={{
          padding: "12px 24px",
          fontSize: 16,
          backgroundColor: "#FF9800",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        ✏️ Create New
      </button>
    </div>

    {/* MP4 Conversion Progress */}
    {showProgress && loading && (
      <div style={{ margin: "20px 0" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          marginBottom: 5
        }}>
          <span>{currentStep}</span>
          <span>{Math.round(conversionProgress)}%</span>
        </div>
        <div style={{
          width: "100%",
          height: 20,
          backgroundColor: "#f0f0f0",
          borderRadius: 10,
          overflow: "hidden"
        }}>
          <div style={{
            width: `${conversionProgress}%`,
            height: "100%",
            backgroundColor: "#2196F3",
            transition: "width 0.3s ease"
          }} />
        </div>
      </div>
    )}
  </div>
);