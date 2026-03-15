import React, { useRef, useEffect, useState } from "react";
import MatrimonialInfoForm from "./MatrimonialInfoForm";
import { WIDTH, HEIGHT, FIELD_CONFIG } from "./constants/reelConfig";
import { drawBackground, drawProfilePhoto, drawName, drawAge, drawFooter, initCanvasHelpers } from "./utils/drawingUtils";
import config from "../../../config";

export default function MatrimonialReelGenerator() {
  const canvasRef = useRef(null);
  const photoImageRef = useRef(null);
  const matrimonialInfoRef = useRef(null);

  const [showForm, setShowForm] = useState(true);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Initialize canvas helpers
  useEffect(() => {
    initCanvasHelpers();
  }, []);

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
      setPreviewUrl(photoUrl);
      setPhotoLoaded(true);
      setShowForm(false);
    };
  };

  /* ---------------------------
     Get all fields with values
  ---------------------------- */
  const getFieldsWithValues = (info) => {
    return FIELD_CONFIG.filter(item => 
      info && info[item.field] && info[item.field].toString().trim() !== ''
    ).map(item => ({
      ...item,
      value: info[item.field]
    }));
  };

  /* ---------------------------
     GENERATE PREVIEW IMAGE (MATCHES FORM PREVIEW)
  ---------------------------- */

const generatePreview = () => {
  const info = matrimonialInfoRef.current;
  const photoImg = photoImageRef.current;

  if (!info || !photoImg) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  // Draw background with selected colors
  drawBackground(ctx, WIDTH, HEIGHT, info.backgroundColor);
  
  // Draw profile photo
  drawProfilePhoto(ctx, WIDTH, photoImg);
  
  // Draw name and age
  drawName(ctx, WIDTH, info.name);
  drawAge(ctx, WIDTH, info.age);
  
  // Get fields with values
  const fieldsWithValues = getFieldsWithValues(info);
  
  // Draw info cards in a grid layout
  const startY = 450;
  const cardWidth = 300;
  const cardHeight = 70;
  const leftMargin = 40;
  const rightMargin = WIDTH - 340;
  const gap = 15;
  
  fieldsWithValues.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    
    const x = col === 0 ? leftMargin : rightMargin;
    const y = startY + (row * (cardHeight + gap));
    
    // Card background
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, 10);
    ctx.fill();
    
    // Icon and label
    ctx.shadowBlur = 4;
    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(`${item.icon} ${item.label}`, x + 15, y + 25);
    
    // Value
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(item.value.toString(), x + 15, y + 50);
    ctx.restore();
  });
  
  // Draw about section if exists
  if (info.about) {
    const rowsCount = Math.ceil(fieldsWithValues.length / 2);
    const aboutY = startY + (rowsCount * (cardHeight + gap)) + 30;
    // Ensure about section doesn't go too close to footer
    const maxAboutY = HEIGHT - 200;
    const finalAboutY = Math.min(aboutY, maxAboutY);
    
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(40, finalAboutY, WIDTH - 80, 100, 10);
    ctx.fill();
    
    ctx.shadowBlur = 4;
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("📝 About Me", 55, finalAboutY + 30);
    
    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const shortAbout = info.about.length > 100 
      ? info.about.substring(0, 100) + '...' 
      : info.about;
    ctx.fillText(shortAbout, 55, finalAboutY + 60, WIDTH - 130);
    ctx.restore();
  }
  
  // Draw footer
  drawFooter(ctx, WIDTH, HEIGHT);
};

  // Generate preview when component mounts or data changes
  useEffect(() => {
    if (!showForm && photoLoaded) {
      generatePreview();
    }
  }, [showForm, photoLoaded]);

  /* ---------------------------
     GENERATE VIDEO (BACKEND)
  ---------------------------- */
  const generateVideo = async () => {
    const confirmStart = window.confirm(
      "🔒 Your video will be generated on our secure server.\n\nContinue?"
    );

    if (!confirmStart) return;

    const info = matrimonialInfoRef.current;

    if (!info || !info.photo) {
      alert("Missing information or photo");
      return;
    }

    setLoading(true);
    setVideoUrl(null);

    try {
      const formData = new FormData();
      formData.append("photo", info.photo);
      formData.append("name", info.name || "");
      formData.append("age", info.age || "");
      formData.append("gender", info.gender || "");
      formData.append("religion", info.religion || "");
      formData.append("caste", info.caste || "");
      formData.append("education", info.education || "");
      formData.append("occupation", info.occupation || "");
      formData.append("city", info.city || "");
      formData.append("state", info.state || "");
      formData.append("country", info.country || "");
      formData.append("maritalStatus", info.maritalStatus || "");
      formData.append("height", info.height || "");
      formData.append("motherTongue", info.motherTongue || "");
      formData.append("about", info.about || "");
      
      // Send both color values separately for backend to use
      if (info.backgroundColor) {
        formData.append("backgroundColorName", info.backgroundColor.name || "");
        formData.append("backgroundColor1", info.backgroundColor.colors[0] || "#667eea");
        formData.append("backgroundColor2", info.backgroundColor.colors[1] || "#764ba2");
      } else {
        // Default colors if none selected
        formData.append("backgroundColor1", "#667eea");
        formData.append("backgroundColor2", "#764ba2");
      }

      const response = await fetch(
        `${config.API_BASE}/api/video/generate`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Video generation failed");
      }

      const videoBlob = await response.blob();
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

    } catch (error) {
      console.error("Video generation failed:", error);
      alert("Failed to generate video: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     DOWNLOAD VIDEO
  ---------------------------- */
  const downloadVideo = () => {
    if (!videoUrl) return;

    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "matrimonial_profile.mp4";
    a.click();
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
        Your photo is temporarily uploaded to generate the video and deleted immediately after.
      </div>

      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          border: "2px solid #333",
          borderRadius: 8,
          maxWidth: "100%",
          height: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}
      />

      <div style={{ marginTop: 20 }}>
        <button
          onClick={generateVideo}
          disabled={loading}
          style={{
            padding: "14px 40px",
            fontSize: 18,
            background: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 50,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          {loading ? "🎬 Generating Video..." : "🎬 Generate Reel"}
        </button>

        <button
          onClick={() => {
            setShowForm(true);
            setVideoUrl(null);
          }}
          style={{
            padding: "14px 40px",
            fontSize: 18,
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: 50,
            cursor: "pointer",
            marginLeft: 10,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          ✏️ Edit Info
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            width: "100%",
            height: "4px",
            background: "#f0f0f0",
            borderRadius: "2px",
            overflow: "hidden"
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, #4CAF50, #2196F3)",
              animation: "loading 1.5s infinite"
            }} />
          </div>
          <p style={{ marginTop: 10, color: "#666" }}>
            Generating your video... This may take a moment.
          </p>
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: 30 }}>
          <h3>✨ Your Reel is Ready!</h3>

          <video
            src={videoUrl}
            controls
            width="100%"
            style={{ borderRadius: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
          />

          <div style={{ marginTop: 15 }}>
            <button 
              onClick={downloadVideo}
              style={{
                padding: "10px 20px",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 16,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
              }}
            >
              ⬇ Download MP4
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}