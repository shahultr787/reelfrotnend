// Video dimensions and settings
export const WIDTH = 720;
export const HEIGHT = 1280;
export const FPS = 30;
export const DURATION = 8;

// Color gradients available
export const COLOR_GRADIENTS = [
  { name: 'Royal Purple', colors: ['#667eea', '#764ba2'] },
  { name: 'Sunset Orange', colors: ['#ff6b6b', '#feca57'] },
  { name: 'Ocean Blue', colors: ['#48c6ef', '#6f86d6'] },
  { name: 'Forest Green', colors: ['#11998e', '#38ef7d'] },
  { name: 'Rose Pink', colors: ['#ff758c', '#ff7eb3'] },
  { name: 'Golden Hour', colors: ['#f2994a', '#f2c94c'] }
];

// Field configuration for display
export const FIELD_CONFIG = [
  { field: 'religion', icon: '🕉️', label: 'Religion' },
  { field: 'caste', icon: '🧘', label: 'Caste' },
  { field: 'education', icon: '🎓', label: 'Education' },
  { field: 'occupation', icon: '💼', label: 'Occupation' },
  { field: 'city', icon: '📍', label: 'City' },
  { field: 'state', icon: '🗺️', label: 'State' },
  { field: 'country', icon: '🌍', label: 'Country' },
  { field: 'maritalStatus', icon: '💍', label: 'Status' },
  { field: 'height', icon: '📏', label: 'Height' },
  { field: 'motherTongue', icon: '🗣️', label: 'Mother Tongue' },
  { field: 'gender', icon: '⚥', label: 'Gender' }
];

// Layout constants
export const LAYOUT = {
  cardWidth: 280,
  cardHeight: 45,
  leftX: 60,
  rightX: 380,
  startY: 480,
  rowHeight: 55,
  photoY: 200,
  nameY: 350,
  ageY: 420,
  aboutY: 980,
  footerY: 1200
};