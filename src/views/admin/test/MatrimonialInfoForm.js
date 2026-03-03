import React, { useState, useEffect } from 'react';
import { COLOR_GRADIENTS, ANIMATION_OPTIONS } from './constants/reelConfig';

const MatrimonialInfoForm = ({ onInfoSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    religion: '',
    caste: '',
    education: '',
    occupation: '',
    city: '',
    state: '',
    country: 'India',
    maritalStatus: 'never married',
    height: '',
    motherTongue: '',
    about: '',
    photo: null,
    backgroundColor: COLOR_GRADIENTS[0],
    animations: {
      name: 'none',
      age: 'none',
      religion: 'none',
      caste: 'none',
      education: 'none',
      occupation: 'none',
      city: 'none',
      state: 'none',
      country: 'none',
      maritalStatus: 'none',
      height: 'none',
      motherTongue: 'none',
      gender: 'none',
      about: 'none'
    }
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [previewField, setPreviewField] = useState(null);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion
  useEffect(() => {
    const requiredFields = ['name', 'age', 'religion', 'education', 'city'];
    const filledFields = requiredFields.filter(field => formData[field]).length;
    setFormProgress((filledFields / requiredFields.length) * 100);
  }, [formData]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.photo) {
        setPreviewUrl(initialData.photo);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnimationChange = (field, animation) => {
    setFormData(prev => ({
      ...prev,
      animations: { ...prev.animations, [field]: animation }
    }));
  };

  const handleColorChange = (gradient) => {
    setFormData(prev => ({ ...prev, backgroundColor: gradient }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'age', 'religion', 'education', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill: ${missingFields.join(', ')}`);
      return;
    }
    
    if (!previewUrl) {
      alert('Please upload a photo');
      return;
    }
    
    onInfoSubmit(formData, previewUrl);
  };

  const previewFieldAnimation = (field, value, animation) => {
    setPreviewField({ field, value: value || `Sample ${field}`, animation });
    setTimeout(() => setPreviewField(null), 1500);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', padding: 20, borderRadius: 10, marginBottom: 20
      }}>
        <h1 style={{ margin: 0 }}>🎬 Matrimonial Reel Studio</h1>
        <p>Create your profile video in minutes</p>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Completion</span>
            <span>{Math.round(formProgress)}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3 }}>
            <div style={{ width: `${formProgress}%`, height: '100%', background: '#4CAF50', borderRadius: 3 }} />
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {['basic', 'animations', 'colors', 'preview'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: 10,
              background: activeTab === tab ? '#4CAF50' : '#f0f0f0',
              color: activeTab === tab ? 'white' : '#333',
              border: 'none', borderRadius: 5, cursor: 'pointer'
            }}
          >
            {tab === 'basic' && '📋 Info'}
            {tab === 'animations' && '🎨 Animations'}
            {tab === 'colors' && '🌈 Colors'}
            {tab === 'preview' && '👁️ Preview'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 10 }}>
            {/* Photo */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#ddd', overflow: 'hidden',
                border: '2px solid #4CAF50'
              }}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 40, textAlign: 'center', lineHeight: '80px' }}>📸</div>
                )}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
                <p style={{ fontSize: 12, color: '#666', marginTop: 5 }}>Photo required</p>
              </div>
            </div>

            {/* Form fields - complete grid with all fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <FieldWithAnimation
                  label="Name *" name="name" value={formData.name} onChange={handleChange}
                  animation={formData.animations.name}
                  onPreview={() => previewFieldAnimation('name', formData.name, formData.animations.name)}
                  placeholder="Full name"
                />
                <FieldWithAnimation
                  label="Age *" name="age" type="number" value={formData.age} onChange={handleChange}
                  animation={formData.animations.age}
                  onPreview={() => previewFieldAnimation('age', formData.age, formData.animations.age)}
                  placeholder="Age"
                />
                <FieldWithAnimation
                  label="Gender" name="gender" value={formData.gender} onChange={handleChange}
                  animation={formData.animations.gender}
                  onPreview={() => previewFieldAnimation('gender', formData.gender, formData.animations.gender)}
                  placeholder="Gender"
                />
                <FieldWithAnimation
                  label="Religion *" name="religion" value={formData.religion} onChange={handleChange}
                  animation={formData.animations.religion}
                  onPreview={() => previewFieldAnimation('religion', formData.religion, formData.animations.religion)}
                  placeholder="e.g., Hindu"
                />
                <FieldWithAnimation
                  label="Caste" name="caste" value={formData.caste} onChange={handleChange}
                  animation={formData.animations.caste}
                  onPreview={() => previewFieldAnimation('caste', formData.caste, formData.animations.caste)}
                  placeholder="e.g., Brahmin"
                />
                <FieldWithAnimation
                  label="Education *" name="education" value={formData.education} onChange={handleChange}
                  animation={formData.animations.education}
                  onPreview={() => previewFieldAnimation('education', formData.education, formData.animations.education)}
                  placeholder="e.g., B.Tech"
                />
                <FieldWithAnimation
                  label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange}
                  animation={formData.animations.occupation}
                  onPreview={() => previewFieldAnimation('occupation', formData.occupation, formData.animations.occupation)}
                  placeholder="e.g., Engineer"
                />
              </div>
              <div>
                <FieldWithAnimation
                  label="City *" name="city" value={formData.city} onChange={handleChange}
                  animation={formData.animations.city}
                  onPreview={() => previewFieldAnimation('city', formData.city, formData.animations.city)}
                  placeholder="City"
                />
                <FieldWithAnimation
                  label="State" name="state" value={formData.state} onChange={handleChange}
                  animation={formData.animations.state}
                  onPreview={() => previewFieldAnimation('state', formData.state, formData.animations.state)}
                  placeholder="State"
                />
                <FieldWithAnimation
                  label="Country" name="country" value={formData.country} onChange={handleChange}
                  animation={formData.animations.country}
                  onPreview={() => previewFieldAnimation('country', formData.country, formData.animations.country)}
                  placeholder="Country"
                />
                <FieldWithAnimation
                  label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                  animation={formData.animations.maritalStatus}
                  onPreview={() => previewFieldAnimation('maritalStatus', formData.maritalStatus, formData.animations.maritalStatus)}
                  placeholder="e.g., Never Married"
                />
                <FieldWithAnimation
                  label="Height" name="height" value={formData.height} onChange={handleChange}
                  animation={formData.animations.height}
                  onPreview={() => previewFieldAnimation('height', formData.height, formData.animations.height)}
                  placeholder="e.g., 5'8&quot;"
                />
                <FieldWithAnimation
                  label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleChange}
                  animation={formData.animations.motherTongue}
                  onPreview={() => previewFieldAnimation('motherTongue', formData.motherTongue, formData.animations.motherTongue)}
                  placeholder="e.g., Hindi"
                />
              </div>
            </div>

            {/* About */}
            <FieldWithAnimation
              label="About Me" name="about" value={formData.about} onChange={handleChange}
              animation={formData.animations.about}
              onPreview={() => previewFieldAnimation('about', formData.about, formData.animations.about)}
              placeholder="Write about yourself..." isTextArea rows="3"
            />
          </div>
        )}

        {/* Animations Tab */}
        {activeTab === 'animations' && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 10 }}>
            <h3>Choose Animations (Default: No Animation)</h3>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
              ⚡ Profile picture always has zoom animation. Text elements can be customized below.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15 }}>
              {Object.entries(formData.animations).map(([field, animation]) => (
                <div key={field} style={{ padding: 10, background: 'white', borderRadius: 5 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <select
                    value={animation}
                    onChange={(e) => handleAnimationChange(field, e.target.value)}
                    style={{ width: '100%', padding: 5 }}
                  >
                    {ANIMATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => previewFieldAnimation(field, formData[field], animation)}
                    style={{ marginTop: 5, padding: '3px 8px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer' }}
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 10 }}>
            <h3>Background Color</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {COLOR_GRADIENTS.map((gradient, i) => (
                <div
                  key={i}
                  onClick={() => handleColorChange(gradient)}
                  style={{
                    height: 80,
                    background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                    borderRadius: 5,
                    cursor: 'pointer',
                    border: formData.backgroundColor?.name === gradient.name ? '3px solid #4CAF50' : 'none',
                    position: 'relative'
                  }}
                >
                  <span style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.5)', color: 'white',
                    padding: 5, fontSize: 12, textAlign: 'center'
                  }}>{gradient.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 10, textAlign: 'center' }}>
            <div style={{
              width: 300, height: 500, margin: '0 auto',
              background: `linear-gradient(135deg, ${formData.backgroundColor?.colors[0] || '#667eea'}, ${formData.backgroundColor?.colors[1] || '#764ba2'})`,
              borderRadius: 10, position: 'relative', overflow: 'hidden'
            }}>
              {previewUrl && (
                <div style={{
                  position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
                  width: 70, height: 70, borderRadius: '50%', overflow: 'hidden',
                  border: '2px solid white'
                }}>
                  <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ position: 'absolute', top: 120, left: 0, right: 0, padding: 15 }}>
                {formData.name && <div style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>{formData.name}</div>}
                {formData.age && <div style={{ color: 'white', textAlign: 'center', marginTop: 5 }}>Age: {formData.age}</div>}
                <div style={{ marginTop: 20 }}>
                  {formData.religion && <PreviewCard label="Religion" value={formData.religion} />}
                  {formData.education && <PreviewCard label="Education" value={formData.education} />}
                  {formData.occupation && <PreviewCard label="Occupation" value={formData.occupation} />}
                  {formData.city && <PreviewCard label="Location" value={formData.city} />}
                </div>
              </div>
            </div>
          </div>
        )}

        <button type="submit" style={{
          width: '100%', padding: 15, fontSize: 18,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white', border: 'none', borderRadius: 5,
          marginTop: 20, cursor: 'pointer', fontWeight: 'bold'
        }}>
          ✨ Generate Reel ✨
        </button>
      </form>

      {/* Preview Popup */}
      {previewField && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'white', padding: 20, borderRadius: 10,
          boxShadow: '0 5px 20px rgba(0,0,0,0.3)', zIndex: 1000
        }}>
          <h4>{previewField.field}</h4>
          <div className={`animate-${previewField.animation}`} style={{
            padding: 15, background: '#4CAF50', color: 'white', borderRadius: 5
          }}>
            {previewField.value}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideLeft { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        
        .animate-fadeIn { animation: fadeIn 0.8s ease; }
        .animate-slideLeft { animation: slideLeft 0.6s ease; }
        .animate-slideRight { animation: slideRight 0.6s ease; }
        .animate-slideUp { animation: slideUp 0.6s ease; }
        .animate-zoomIn { animation: zoomIn 0.6s ease; }
        .animate-pulse { animation: pulse 0.8s ease; }
      `}</style>
    </div>
  );
};

// Helper Components
const FieldWithAnimation = ({ label, name, value, onChange, animation, onPreview, placeholder, isTextArea, type = 'text' }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <label style={{ fontWeight: 'bold', fontSize: 13 }}>{label}</label>
      <button type="button" onClick={onPreview} style={{ fontSize: 11, padding: '2px 5px' }}>👁️</button>
    </div>
    {isTextArea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows="3" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
    )}
    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{animation === 'none' ? 'No animation' : animation}</div>
  </div>
);

const PreviewCard = ({ label, value }) => (
  <div style={{
    background: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 5,
    marginBottom: 5, color: 'white', fontSize: 13
  }}>
    <strong>{label}:</strong> {value}
  </div>
);

export default MatrimonialInfoForm;