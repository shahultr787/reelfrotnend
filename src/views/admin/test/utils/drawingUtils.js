import { FIELD_CONFIG, LAYOUT } from '../constants/reelConfig';
import { getAnimationStyle, getPhotoAnimation } from './animationUtils';

/**
 * Initialize roundRect prototype if not exists
 */
export const initCanvasHelpers = () => {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      this.closePath();
      return this;
    };
  }
};

/**
 * Draw background gradient
 */
export const drawBackground = (ctx, width, height, backgroundColor) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  if (backgroundColor?.colors) {
    gradient.addColorStop(0, backgroundColor.colors[0]);
    gradient.addColorStop(1, backgroundColor.colors[1]);
  } else {
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative circles
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(width * (0.3 + i * 0.2), height * 0.5, 80, 0, Math.PI * 2);
    ctx.fill();
  }
};

/**
 * Draw profile photo with animation
 */
export const drawProfilePhoto = (ctx, width, photoImg, progress) => {
  if (!photoImg) return;

  const scale = getPhotoAnimation(progress);
  
  ctx.save();
  ctx.translate(width / 2, LAYOUT.photoY);
  ctx.scale(scale, scale);
  
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(photoImg, -100, -100, 200, 200);
  ctx.restore();
  
  // Border
  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width / 2, LAYOUT.photoY, 102, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

/**
 * Draw text with animation
 */
const drawAnimatedText = (ctx, text, x, y, options = {}, animation, progress, frame) => {
  const anim = getAnimationStyle(animation, progress, frame);
  
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = anim.opacity;
  ctx.scale(anim.scale, anim.scale);
  ctx.translate(anim.translateX, anim.translateY);
  
  if (options.font) ctx.font = options.font;
  if (options.fillStyle) ctx.fillStyle = options.fillStyle;
  if (options.shadowColor) ctx.shadowColor = options.shadowColor;
  if (options.shadowBlur) ctx.shadowBlur = options.shadowBlur;
  if (options.textAlign) ctx.textAlign = options.textAlign;
  
  ctx.fillText(text, 0, 0);
  ctx.restore();
};

/**
 * Draw name with animation
 */
export const drawName = (ctx, width, name, animation, progress, frame) => {
  if (!name) return;
  
  drawAnimatedText(
    ctx, 
    name, 
    width / 2, 
    LAYOUT.nameY, 
    {
      font: "bold 48px Arial",
      fillStyle: "white",
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 8,
      textAlign: "center"
    },
    animation,
    progress,
    frame
  );
};

/**
 * Draw age with animation
 */
export const drawAge = (ctx, width, age, animation, progress, frame) => {
  if (!age) return;
  
  drawAnimatedText(
    ctx,
    `Age: ${age}`,
    width / 2,
    LAYOUT.ageY,
    {
      font: "24px Arial",
      fillStyle: "rgba(255,255,255,0.9)",
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowBlur: 5,
      textAlign: "center"
    },
    animation,
    progress,
    frame
  );
};

/**
 * Draw info cards in two columns
 */
export const drawInfoCards = (ctx, info, progress, frame) => {
  const itemsWithValue = FIELD_CONFIG
    .filter(item => info && info[item.field] && info[item.field].toString().trim() !== '')
    .map(item => ({
      ...item,
      value: info[item.field]
    }));

  for (let i = 0; i < itemsWithValue.length; i += 2) {
    // Left item
    const leftItem = itemsWithValue[i];
    if (leftItem) {
      drawCard(
        ctx,
        leftItem,
        LAYOUT.leftX,
        LAYOUT.startY + (Math.floor(i / 2) * LAYOUT.rowHeight),
        info.animations?.[leftItem.field] || 'none',
        progress,
        frame
      );
    }
    
    // Right item
    const rightItem = itemsWithValue[i + 1];
    if (rightItem) {
      drawCard(
        ctx,
        rightItem,
        LAYOUT.rightX,
        LAYOUT.startY + (Math.floor(i / 2) * LAYOUT.rowHeight),
        info.animations?.[rightItem.field] || 'none',
        progress,
        frame
      );
    }
  }
};

/**
 * Draw a single info card
 */
const drawCard = (ctx, item, x, y, animation, progress, frame) => {
  const anim = getAnimationStyle(animation, progress, frame);
  
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = anim.opacity;
  ctx.scale(anim.scale, anim.scale);
  ctx.translate(anim.translateX, anim.translateY);
  
  // Card background
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(0, -20, LAYOUT.cardWidth, LAYOUT.cardHeight, 8);
  ctx.fill();
  
  // Text
  ctx.shadowBlur = 4;
  ctx.font = "18px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`${item.icon} ${item.label}: ${item.value}`, 10, 5);
  
  ctx.restore();
};

/**
 * Draw about section with animation
 */
export const drawAbout = (ctx, width, about, animation, progress, frame) => {
  if (!about) return;
  
  const anim = getAnimationStyle(animation, progress, frame);
  
  ctx.save();
  ctx.translate(width / 2, LAYOUT.aboutY);
  ctx.globalAlpha = anim.opacity;
  ctx.scale(anim.scale, anim.scale);
  ctx.translate(anim.translateX, anim.translateY);
  
  // Card background
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.roundRect(-(width - 80) / 2, -80, width - 80, 140, 10);
  ctx.fill();
  
  // Title
  ctx.shadowBlur = 4;
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("About Me", 0, -40);
  
  // Content
  ctx.font = "18px Arial";
  ctx.textAlign = "left";
  const shortAbout = about.length > 70 
    ? about.substring(0, 70) + '...' 
    : about;
  ctx.fillText(shortAbout, -(width - 120) / 2, -10, width - 120);
  
  ctx.restore();
};

/**
 * Draw footer (no animation)
 */
export const drawFooter = (ctx, width, height) => {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, height - 80, width, 80);
  
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "white";
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 5;
  ctx.textAlign = "center";
  ctx.fillText("Interested? Connect now!", width / 2, height - 30);
  ctx.restore();
};