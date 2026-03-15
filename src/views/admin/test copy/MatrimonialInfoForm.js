import React, { useState, useEffect } from 'react';
import { COLOR_GRADIENTS, FIELD_CONFIG } from './constants/reelConfig';

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
    backgroundColor: COLOR_GRADIENTS[0] // Default to first gradient
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion
  useEffect(() => {
    const requiredFields = ['name', 'age', 'religion', 'education', 'city'];
    const filledFields = requiredFields.filter(field => formData[field] && formData[field].toString().trim() !== '');
    setFormProgress((filledFields.length / requiredFields.length) * 100);
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
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill: ${missingFields.join(', ')}`);
      return;
    }
    
    if (!previewUrl) {
      alert('Please upload a photo');
      return;
    }
    
    // Make sure backgroundColor is included
    onInfoSubmit(formData, previewUrl);
  };

  // Get all fields with values for preview
  const getFieldsWithValues = () => {
    return FIELD_CONFIG.filter(item => 
      formData[item.field] && formData[item.field].toString().trim() !== ''
    ).map(item => ({
      ...item,
      value: formData[item.field]
    }));
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
        {['basic', 'colors', 'preview'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: 10,
              background: activeTab === tab ? '#4CAF50' : '#f0f0f0',
              color: activeTab === tab ? 'white' : '#333',
              border: 'none', borderRadius: 5, cursor: 'pointer',
              fontSize: 16
            }}
          >
            {tab === 'basic' && '📋 Basic Info'}
            {tab === 'colors' && '🌈 Background Colors'}
            {tab === 'preview' && '👁️ Full Preview'}
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
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  required
                />
                <p style={{ fontSize: 12, color: '#666', marginTop: 5 }}>Photo required</p>
              </div>
            </div>

            {/* Form fields - complete grid with all fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Left Column */}
              <div>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} 
                    placeholder="Full name" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Age *</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} 
                    placeholder="Age" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} 
                    style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Religion *</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} 
                    placeholder="e.g., Hindu" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Caste</label>
                  <input type="text" name="caste" value={formData.caste} onChange={handleChange} 
                    placeholder="e.g., Brahmin" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Education *</label>
                  <input type="text" name="education" value={formData.education} onChange={handleChange} 
                    placeholder="e.g., B.Tech" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} 
                    placeholder="e.g., Engineer" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} 
                    placeholder="City" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} 
                    placeholder="State" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} 
                    placeholder="Country" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Marital Status</label>
                  <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} 
                    style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                    <option value="never married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Height</label>
                  <input type="text" name="height" value={formData.height} onChange={handleChange} 
                    placeholder="e.g., 5'8&quot;" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Mother Tongue</label>
                  <input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} 
                    placeholder="e.g., Hindi" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                </div>
              </div>
            </div>

            {/* About */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 5 }}>About Me</label>
              <textarea name="about" value={formData.about} onChange={handleChange} 
                placeholder="Write about yourself..." rows="4"
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 10 }}>
            <h3 style={{ marginTop: 0 }}>Choose Background Color</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {COLOR_GRADIENTS.map((gradient, i) => (
                <div
                  key={i}
                  onClick={() => handleColorChange(gradient)}
                  style={{
                    height: 100,
                    background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: formData.backgroundColor?.name === gradient.name ? '3px solid #4CAF50' : 'none',
                    position: 'relative',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    padding: 8, fontSize: 12, textAlign: 'center',
                    borderBottomLeftRadius: 5, borderBottomRightRadius: 5
                  }}>{gradient.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 10, textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Profile Preview</h3>
            <div style={{
              width: 320, 
              height: 560, 
              margin: '0 auto',
              background: `linear-gradient(135deg, ${formData.backgroundColor?.colors[0] || '#667eea'}, ${formData.backgroundColor?.colors[1] || '#764ba2'})`,
              borderRadius: 15, 
              position: 'relative', 
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              {/* Profile Photo */}
              {previewUrl ? (
                <div style={{
                  position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
                  width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                  border: '3px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }}>
                  <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{
                  position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
                  width: 80, height: 80, borderRadius: '50%',
                  background: '#ddd', border: '3px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30
                }}>
                  📸
                </div>
              )}

              {/* Name and Age */}
              <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', color: 'white' }}>
                {formData.name && <div style={{ fontSize: 22, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{formData.name}</div>}
                {formData.age && <div style={{ fontSize: 16, marginTop: 3, opacity: 0.9 }}>Age: {formData.age}</div>}
                {formData.gender && <div style={{ fontSize: 14, opacity: 0.8 }}>{formData.gender}</div>}
              </div>

              {/* Info Cards */}
              <div style={{ 
                position: 'absolute', 
                top: 210, 
                left: 15, 
                right: 15, 
                bottom: 100,
                overflowY: 'auto',
                paddingRight: 5
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 8 
                }}>
                  {getFieldsWithValues().map((item, index) => (
                    <div key={index} style={{
                      background: 'rgba(255,255,255,0.15)',
                      padding: '8px 10px',
                      borderRadius: 8,
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ fontSize: 12, opacity: 0.8, color: 'white' }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 'bold', color: 'white', wordBreak: 'break-word' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* About Section - Now always visible at the bottom of scrollable area */}
                {formData.about && (
                  <div style={{
                    marginTop: 15,
                    marginBottom: 10,
                    background: 'rgba(255,255,255,0.15)',
                    padding: 12,
                    borderRadius: 8,
                    backdropFilter: 'blur(5px)'
                  }}>
                    <div style={{ fontSize: 13, opacity: 0.8, color: 'white', marginBottom: 4 }}>📝 About Me</div>
                    <div style={{ fontSize: 13, color: 'white', lineHeight: 1.4 }}>
                      {formData.about.length > 100 ? formData.about.substring(0, 100) + '...' : formData.about}
                    </div>
                  </div>
                )}
                
                {/* Add some bottom padding for better scrolling */}
                <div style={{ height: 10 }} />
              </div>

              {/* Footer */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.4)',
                padding: '12px',
                textAlign: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 'bold',
                backdropFilter: 'blur(5px)',
                zIndex: 10
              }}>
                Interested? Connect now!
              </div>
            </div>
            
            {/* Show About preview status */}
            {formData.about && (
              <p style={{ fontSize: 12, color: '#666', marginTop: 10 }}>
                ✓ About Me section will appear in the video
              </p>
            )}
          </div>
        )}

        <button type="submit" style={{
          width: '100%', padding: 15, fontSize: 18,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white', border: 'none', borderRadius: 8,
          marginTop: 20, cursor: 'pointer', fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          ✨ Generate Reel ✨
        </button>
      </form>
    </div>
  );
};

export default MatrimonialInfoForm;