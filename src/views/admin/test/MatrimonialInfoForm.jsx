import React, { useState, useEffect } from "react";
import { COLOR_GRADIENTS } from "./constants/reelConfig";
import ProfileCard from "./ProfileCard";

const MatrimonialInfoForm = ({ onInfoSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    religion: "",
    caste: "",
    education: "",
    occupation: "",
    city: "",
    state: "",
    country: "India",
    maritalStatus: "Never Married",
    height: "",
    motherTongue: "",
    about: "",
    photo: null,
    backgroundColor: COLOR_GRADIENTS[0],
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    const required = ["name", "age", "religion", "education", "city"];
    const filled = required.filter(
      (f) => formData[f] && formData[f].toString().trim() !== ""
    );
    setFormProgress((filled.length / required.length) * 100);
  }, [formData]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.photoUrl) setPreviewUrl(initialData.photoUrl);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ["name", "age", "religion", "education", "city"];
    const missing = required.filter(
      (f) => !formData[f] || formData[f].toString().trim() === ""
    );
    if (missing.length) { alert(`Please fill: ${missing.join(", ")}`); return; }
    if (!previewUrl) { alert("Please upload a photo"); return; }
    onInfoSubmit(formData, previewUrl);
  };

  /* ── Styles ── */
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "system-ui, sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 5,
    color: "#374151",
  };

  const fieldWrap = { marginBottom: 16 };

  const tabs = [
    { key: "basic",   label: "📋 Basic Info" },
    { key: "colors",  label: "🎨 Theme" },
    { key: "preview", label: "👁 Live Preview" },
  ];

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "20px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a0533,#6b21a8)",
          color: "white",
          padding: "22px 28px",
          borderRadius: 14,
          marginBottom: 22,
          boxShadow: "0 8px 30px rgba(107,33,168,0.3)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
          🎬 Matrimonial Reel Studio
        </h1>
        <p style={{ margin: "6px 0 14px", opacity: 0.8, fontSize: 14 }}>
          Fill in your details — the live preview updates instantly
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
          <span>Profile completion</span>
          <span style={{ fontWeight: 700, color: "#fbbf24" }}>{Math.round(formProgress)}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3 }}>
          <div
            style={{
              width: `${formProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
              borderRadius: 3,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 22,
          background: "#f1f5f9",
          padding: 5,
          borderRadius: 10,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1,
              padding: "10px 8px",
              background: activeTab === t.key
                ? "linear-gradient(135deg,#6b21a8,#a855f7)"
                : "transparent",
              color: activeTab === t.key ? "white" : "#64748b",
              border: "none",
              borderRadius: 7,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === t.key ? 700 : 500,
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ════════════════ BASIC INFO TAB ════════════════ */}
        {activeTab === "basic" && (
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* Photo upload */}
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                marginBottom: 24,
                padding: "16px 20px",
                background: "linear-gradient(135deg,#faf5ff,#f3e8ff)",
                borderRadius: 12,
                border: "1px solid #d8b4fe",
              }}
            >
              <div
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  overflow: "hidden", flexShrink: 0,
                  border: "3px solid #a855f7",
                  background: "#e9d5ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32,
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : "📸"}
              </div>
              <div>
                <p style={{ margin: "0 0 8px", fontWeight: 600, color: "#4c1d95" }}>
                  Profile Photo *
                </p>
                <label
                  style={{
                    padding: "8px 16px",
                    background: "#7c3aed",
                    color: "white",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>
                  JPG, PNG, WEBP supported
                </p>
              </div>
            </div>

            {/* 2-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
              {/* LEFT */}
              <div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Priya Sharma" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Age *</label>
                  <input style={inputStyle} type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 26" min="18" max="60" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Gender</label>
                  <select style={inputStyle} name="gender" value={formData.gender} onChange={handleChange}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Religion *</label>
                  <input style={inputStyle} type="text" name="religion" value={formData.religion} onChange={handleChange} placeholder="e.g. Hindu" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Caste</label>
                  <input style={inputStyle} type="text" name="caste" value={formData.caste} onChange={handleChange} placeholder="e.g. Brahmin" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Height</label>
                  <input style={inputStyle} type="text" name="height" value={formData.height} onChange={handleChange} placeholder={`e.g. 5'6"`} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Mother Tongue</label>
                  <input style={inputStyle} type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} placeholder="e.g. Malayalam" />
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Education *</label>
                  <input style={inputStyle} type="text" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. B.Tech, MBA" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Occupation</label>
                  <input style={inputStyle} type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Software Engineer" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>City *</label>
                  <input style={inputStyle} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kochi" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>State</label>
                  <input style={inputStyle} type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Kerala" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. India" />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Marital Status</label>
                  <select style={inputStyle} name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                    <option>Never Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                    <option>Separated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* About */}
            <div style={{ marginTop: 4 }}>
              <label style={labelStyle}>About Me</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Write a short intro about yourself, your family, interests…"
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
          </div>
        )}

        {/* ════════════════ THEME / COLORS TAB ════════════════ */}
        {activeTab === "colors" && (
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#1e1b4b" }}>Choose Background Theme</h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
              The preview updates live when you pick a theme.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 14,
              }}
            >
              {COLOR_GRADIENTS.map((g, i) => (
                <div
                  key={i}
                  onClick={() => setFormData((p) => ({ ...p, backgroundColor: g }))}
                  style={{
                    height: 110,
                    background: `linear-gradient(135deg,${g.colors[0]},${g.colors[1]})`,
                    borderRadius: 10,
                    cursor: "pointer",
                    border:
                      formData.backgroundColor?.name === g.name
                        ? "3px solid #fbbf24"
                        : "3px solid transparent",
                    position: "relative",
                    boxShadow:
                      formData.backgroundColor?.name === g.name
                        ? "0 0 0 2px #7c3aed"
                        : "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {formData.backgroundColor?.name === g.name && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "#fbbf24", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                    }}>✓</div>
                  )}
                  <span style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "rgba(0,0,0,0.55)", color: "white",
                    padding: "7px 8px", fontSize: 12, textAlign: "center",
                    borderBottomLeftRadius: 7, borderBottomRightRadius: 7,
                    fontWeight: 600,
                  }}>
                    {g.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ LIVE PREVIEW TAB ════════════════ */}
        {activeTab === "preview" && (
          <div
            style={{
              background: "#0f0f0f",
              padding: 32,
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              📱 Exact video frame — what your reel will look like
            </p>

            {/* Phone mock wrapping ProfileCard */}
            <div
              style={{
                background: "#111",
                border: "3px solid #333",
                borderRadius: 36,
                padding: 12,
                boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 0 0 1px #444",
              }}
            >
              {/* notch */}
              <div style={{
                width: 100, height: 10, background: "#222",
                borderRadius: 5, margin: "0 auto 8px",
              }} />
              <div style={{ overflow: "hidden", borderRadius: 20, width: 315, height: 560 }}>
                {/* ProfileCard at scale 315/720 ≈ 0.4375 */}
                <div style={{ width: 720, height: 1280, transform: "scale(0.4375)", transformOrigin: "top left" }}>
                  <ProfileCard info={formData} previewUrl={previewUrl} />
                </div>
              </div>
            </div>

            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>
              Full resolution: 720 × 1280 px
            </p>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: 17,
            fontWeight: 700,
            background: "linear-gradient(135deg,#6b21a8,#a855f7)",
            color: "white",
            border: "none",
            borderRadius: 10,
            marginTop: 22,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(107,33,168,0.4)",
            letterSpacing: 0.5,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          ✨ Generate Reel ✨
        </button>
      </form>
    </div>
  );
};

export default MatrimonialInfoForm;
