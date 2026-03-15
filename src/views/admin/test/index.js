/**
 * index.js  –  MatrimonialReelGenerator
 * ─────────────────────────────────────────────────────────────────
 * Background colour sync chain:
 *
 *   1. User picks a theme → formData.backgroundColor = COLOR_GRADIENTS[n]
 *      which has: { name, colors: [c1, c2], bgColor: "linear-gradient(...)" }
 *
 *   2. Canvas preview  → drawBackground() uses colors[0/1]
 *      React preview   → ProfileCard uses colors[0/1]
 *
 *   3. On "Generate Reel" POST sends:
 *        backgroundColor1  = colors[0]
 *        backgroundColor2  = colors[1]
 *        backgroundColorName = name
 *        bgColor           = bgColor  ← full CSS string for Remotion
 *
 *   4. Backend passes `bgColor` directly to MatrimonialVideo prop
 *      → Remotion renders the exact same gradient  ✓
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import MatrimonialInfoForm from "./MatrimonialInfoForm";
import ProfileCard         from "./ProfileCard";
import { WIDTH, HEIGHT }   from "./constants/reelConfig";
import { initCanvasHelpers, drawFrame } from "./utils/drawingUtils";
import config from "../../../config";

export default function MatrimonialReelGenerator() {
  const canvasRef          = useRef(null);
  const photoImageRef      = useRef(null);
  const matrimonialInfoRef = useRef(null);

  const [showForm,    setShowForm]    = useState(true);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [videoUrl,    setVideoUrl]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState(null);

  useEffect(() => { initCanvasHelpers(); }, []);

  const handleInfoSubmit = (info, photoUrl) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoUrl;
    img.onload = () => {
      photoImageRef.current      = img;
      matrimonialInfoRef.current = info;
      setPreviewUrl(photoUrl);
      setPhotoLoaded(true);
      setShowForm(false);
    };
  };

  const generatePreview = useCallback(() => {
    const info     = matrimonialInfoRef.current;
    const photoImg = photoImageRef.current;
    if (!info || !photoImg) return;
    drawFrame(canvasRef.current.getContext("2d"), WIDTH, HEIGHT, info, photoImg, 200);
  }, []);

  useEffect(() => {
    if (!showForm && photoLoaded) generatePreview();
  }, [showForm, photoLoaded, generatePreview]);

  const generateVideo = async () => {
    if (!window.confirm("🔒 Your video will be generated on our secure server.\n\nContinue?")) return;

    const info = matrimonialInfoRef.current;
    if (!info?.photo) { alert("Missing information or photo"); return; }

    setLoading(true);
    setVideoUrl(null);

    try {
      const bg = info.backgroundColor; // full COLOR_GRADIENTS entry

      const fd = new FormData();
      fd.append("photo",           info.photo);
      fd.append("name",            info.name            || "");
      fd.append("age",             info.age             || "");
      fd.append("gender",          info.gender          || "");
      fd.append("religion",        info.religion        || "");
      fd.append("caste",           info.caste           || "");
      fd.append("education",       info.education       || "");
      fd.append("occupation",      info.occupation      || "");
      fd.append("city",            info.city            || "");
      fd.append("state",           info.state           || "");
      fd.append("country",         info.country         || "");
      fd.append("maritalStatus",   info.maritalStatus   || "");
      fd.append("height",          info.height          || "");
      fd.append("motherTongue",    info.motherTongue    || "");
      fd.append("about",           info.about           || "");

      // ── All three colour fields sent so backend can use any of them ──
      fd.append("backgroundColorName", bg?.name        || "");
      fd.append("backgroundColor1",    bg?.colors?.[0] || "#1a0533");
      fd.append("backgroundColor2",    bg?.colors?.[1] || "#a855f7");
      // bgColor is the EXACT CSS string MatrimonialVideo receives as prop
      fd.append("bgColor", bg?.bgColor ||
        "linear-gradient(160deg,#1a0533 0%,#3b0764 40%,#6b21a8 75%,#a855f7 100%)");

      const response = await fetch(`${config.API_BASE}/api/video/generate`, {
        method: "POST", credentials: "include", body: fd,
      });

      if (!response.ok) throw new Error((await response.text()) || "Video generation failed");
      setVideoUrl(URL.createObjectURL(await response.blob()));
    } catch (err) {
      console.error(err);
      alert("Failed to generate video: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl; a.download = "matrimonial_profile.mp4"; a.click();
  };

  if (showForm) return <MatrimonialInfoForm onInfoSubmit={handleInfoSubmit} />;

  const info = matrimonialInfoRef.current || {};

  return (
    <div style={{ textAlign:"center", padding:20, maxWidth:860, margin:"0 auto", fontFamily:"system-ui,sans-serif" }}>

      <div style={{
        background:"#fffbeb", padding:"12px 18px", borderRadius:10, marginBottom:22,
        border:"1px solid #fde68a", fontSize:13, color:"#92400e", textAlign:"left",
      }}>
        🔒 <strong>Privacy First:</strong> Your photo is uploaded temporarily and deleted immediately after rendering.
      </div>

      {/* Two-column preview */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start", marginBottom:24 }}>
        <div>
          <p style={{ fontWeight:600, color:"#374151", marginBottom:8 }}>🎬 Video Frame Preview</p>
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{
            border:"2px solid #6b21a8", borderRadius:12, width:"100%", height:"auto",
            boxShadow:"0 10px 30px rgba(107,33,168,0.3)", display:"block",
          }} />
          <p style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>Canvas — matches video output exactly</p>
        </div>
        <div>
          <p style={{ fontWeight:600, color:"#374151", marginBottom:8 }}>📱 Live React Preview</p>
          <div style={{
            background:"#111", border:"3px solid #333", borderRadius:32, padding:10,
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)", display:"inline-block",
          }}>
            <div style={{ width:90, height:9, background:"#222", borderRadius:5, margin:"0 auto 7px" }} />
            <div style={{ overflow:"hidden", borderRadius:18, width:280, height:498 }}>
              <div style={{ width:720, height:1280, transform:"scale(0.3889)", transformOrigin:"top left" }}>
                <ProfileCard info={info} previewUrl={previewUrl} />
              </div>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#9ca3af", marginTop:6 }}>Exact same design as the video</p>
        </div>
      </div>

      {/* Active theme chip */}
      {info.backgroundColor && (
        <div style={{
          display:"inline-flex", alignItems:"center", gap:10,
          background:"#f8fafc", border:"1px solid #e2e8f0",
          borderRadius:20, padding:"6px 16px", marginBottom:18,
          fontSize:13, color:"#374151",
        }}>
          <div style={{
            width:20, height:20, borderRadius:"50%",
            background:`linear-gradient(135deg,${info.backgroundColor.colors[0]},${info.backgroundColor.colors[1]})`,
            border:"1px solid #e2e8f0",
          }} />
          <span>Theme: <strong>{info.backgroundColor.name}</strong></span>
          <span style={{ color:"#94a3b8", fontSize:11 }}>
            {info.backgroundColor.colors[0]} → {info.backgroundColor.colors[1]}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
        <button onClick={generateVideo} disabled={loading} style={{
          padding:"14px 36px", fontSize:16, fontWeight:700,
          background: loading ? "#9ca3af" : "linear-gradient(135deg,#6b21a8,#a855f7)",
          color:"white", border:"none", borderRadius:50,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 6px 20px rgba(107,33,168,0.4)",
          transition:"transform 0.15s",
        }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform="translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform="translateY(0)")}
        >
          {loading ? "🎬 Generating…" : "🎬 Generate Reel"}
        </button>
        <button onClick={() => { setShowForm(true); setVideoUrl(null); }} style={{
          padding:"14px 36px", fontSize:16, fontWeight:600,
          background:"#f1f5f9", color:"#374151",
          border:"1.5px solid #e2e8f0", borderRadius:50, cursor:"pointer",
        }}>✏️ Edit Info</button>
      </div>

      {loading && (
        <div style={{ marginTop:20 }}>
          <div style={{ width:"100%", height:4, background:"#e2e8f0", borderRadius:2, overflow:"hidden" }}>
            <div style={{
              width:"100%", height:"100%",
              background:"linear-gradient(90deg,#6b21a8,#a855f7,#ec4899)",
              animation:"slide 1.5s infinite",
            }} />
          </div>
          <p style={{ marginTop:10, color:"#6b7280", fontSize:13 }}>
            Generating your reel… this usually takes 20–40 seconds.
          </p>
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop:32 }}>
          <h3 style={{ color:"#1e1b4b" }}>✨ Your Reel is Ready!</h3>
          <video src={videoUrl} controls style={{
            width:"100%", borderRadius:12, boxShadow:"0 10px 40px rgba(107,33,168,0.25)",
          }} />
          <button onClick={downloadVideo} style={{
            marginTop:16, padding:"12px 28px",
            background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",
            color:"white", border:"none", borderRadius:8,
            cursor:"pointer", fontSize:15, fontWeight:600,
            boxShadow:"0 4px 14px rgba(59,130,246,0.4)",
          }}>⬇ Download MP4</button>
        </div>
      )}

      <style>{`
        @keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>
    </div>
  );
}