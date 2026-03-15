import { FPS, ANIMATION_DURATION } from '../constants/reelConfig';

/**
 * Calculate animation transforms based on type and progress
 * @param {string} type - Animation type (none, fadeIn, slideLeft, etc.)
 * @param {number} progress - Animation progress (0-1)
 * @param {number} frame - Current frame number
 * @returns {Object} - Animation styles { opacity, scale, translateX, translateY }
 */
export const getAnimationStyle = (type, progress, frame) => {
  const style = {
    opacity: 1,
    scale: 1,
    translateX: 0,
    translateY: 0
  };

  if (type === 'none') return style;

  // Entry animations (last for ANIMATION_DURATION seconds)
  if (progress < ANIMATION_DURATION) {
    const entryProgress = progress / ANIMATION_DURATION;
    
    switch (type) {
      case 'fadeIn':
        style.opacity = entryProgress;
        break;
      case 'slideLeft':
        style.translateX = -50 * (1 - entryProgress);
        break;
      case 'slideRight':
        style.translateX = 50 * (1 - entryProgress);
        break;
      case 'slideUp':
        style.translateY = 50 * (1 - entryProgress);
        break;
      case 'zoomIn':
        style.scale = 0.5 + 0.5 * entryProgress;
        break;
      default:
        break;
    }
  }

  // Pulse is continuous (gentle oscillation)
  if (type === 'pulse') {
    const pulseAmount = 0.05 * Math.sin(frame * 0.3);
    style.scale = 1 + pulseAmount;
  }

  return style;
};

/**
 * Get animation style for profile photo (always zoom in)
 * @param {number} progress - Animation progress
 * @returns {number} - Scale factor
 */
export const getPhotoAnimation = (progress) => {
  if (progress < ANIMATION_DURATION) {
    const entryProgress = progress / ANIMATION_DURATION;
    return 0.8 + 0.2 * entryProgress;
  }
  return 1;
};