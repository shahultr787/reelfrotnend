import React, { useRef, useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import MatrimonialInfoForm from "./MatrimonialInfoForm";
import { useVideoRecorder } from "./hooks/useVideoRecorder";
import { WIDTH, HEIGHT, FPS } from "./constants/reelConfig";
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

  const {
    recording,
    videoBlob,
    videoUrl,
    generationProgress,
    startRecording,
    cancelRecording,
    cleanup
  } = useVideoRecorder();

  /* ---------------------------
     INIT CANVAS
  ---------------------------- */
  useEffect(() => {
    initCanvasHelpers();
    return cleanup;
  }, []);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      setTimeout(() => {
        videoRef.current.play().catch(() => {});
      }, 100);
    }
  }, [videoUrl]);

  /* ---------------------------
     FORM SUBMIT
  ---------------------------- */
  const handleInfoSubmit = (info, photoUrl) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoUrl;

    img.onload = () => {
      photoImageRef.current = img;
      matrimonialInfoRef.current = info;
      setPhotoLoaded(true);
      setShowForm(false);
      setShowVideoPlayer(false);
    };
  };

  /* ---------------------------
     GENERATE VIDEO (TRUST SAFE)
  ---------------------------- */
  const generateVideo = async () => {
    const confirmStart = window.confirm(
      "🔒 Your video will be generated entirely inside your browser.\n\nNo camera, microphone, or local network access is used.\nNo data is uploaded anywhere.\n\nContinue?"
    );

    if (!confirmStart) return;

    const info = matrimonialInfoRef.current;
    const photoImg = photoImageRef.current;

    if (!info || !photoImg) {
      alert("Missing information or photo");
      return;
    }

    setShowVideoPlayer(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    await startRecording(
      canvas,
      (frame, totalFrames) => {
        drawFrame(ctx, frame, totalFrames, info, photoImg);
      },
      () => {
        setShowVideoPlayer(true);
      }
    );
  };

  /* ---------------------------
     DRAW FRAME
  ---------------------------- */
  const drawFrame = (ctx, frame, totalFrames, info, photoImg) => {
    const progress = Math.min(frame / FPS, 1);

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

  /* ---------------------------
     DOWNLOAD WEBM
  ---------------------------- */
  const downloadVideo = () => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matrimonial_profile.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------------------
     CONVERT TO MP4
  ---------------------------- */
  const convertToMp4 = async () => {
    if (!videoBlob) return;

    try {
      setLoading(true);

      if (!ffmpeg.loaded) {
        await ffmpeg.load();
      }

      const data = await videoBlob.arrayBuffer();
      await ffmpeg.writeFile("input.webm", new Uint8Array(data));

      await ffmpeg.exec([
        "-i", "input.webm",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "32",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "output.mp4"
      ]);

      const file = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([file.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(mp4Blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "matrimonial_profile.mp4";
      a.click();

      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     RENDER
  ---------------------------- */
  if (showForm) {
    return <MatrimonialInfoForm onInfoSubmit={handleInfoSubmit} />;
  }

  return (
    <div style={{ textAlign: "center", padding: 20, maxWidth: 800, margin: "0 auto" }}>

      {/* TRUST NOTICE */}
      <div style={{
        background: "#fff3cd",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        border: "1px solid #ffeeba",
        fontSize: 14
      }}>
        🔒 <strong>Privacy First:</strong>  
        Your reel is generated entirely inside your browser.  
        We do NOT access camera, microphone, or local network.  
        No data is uploaded anywhere.
      </div>

      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          border: "2px solid #333",
          borderRadius: 8,
          maxWidth: "100%",
          height: "auto"
        }}
      />

      <div style={{ marginTop: 20 }}>
        {!recording && !videoUrl && (
          <button
            onClick={generateVideo}
            disabled={!photoLoaded}
            style={{
              padding: "14px 40px",
              fontSize: 18,
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 50,
              cursor: "pointer"
            }}
          >
            🎬 Generate Reel
          </button>
        )}

        {recording && (
          <button
            onClick={cancelRecording}
            style={{
              padding: "14px 40px",
              fontSize: 18,
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 50
            }}
          >
            ⏹ Cancel
          </button>
        )}
      </div>

      {videoUrl && (
        <div style={{ marginTop: 30 }}>
          <h3>✨ Your Reel is Ready!</h3>

          <video
            ref={videoRef}
            src={videoUrl}
            controls
            width="100%"
            style={{ borderRadius: 8 }}
          />

          <div style={{ marginTop: 15 }}>
            <button onClick={downloadVideo} style={{ marginRight: 10 }}>
              ⬇ Download WebM
            </button>

            <button onClick={convertToMp4} disabled={loading}>
              {loading ? "Converting..." : "📱 Download MP4"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}