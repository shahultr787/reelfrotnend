import { FIELD_CONFIG } from '../constants/reelConfig';

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
 * Draw profile photo
 */
export const drawProfilePhoto = (ctx, width, photoImg) => {
  if (!photoImg) return;

  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(width / 2, 200, 100, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(photoImg, width / 2 - 100, 100, 200, 200);
  ctx.restore();
  
  // Border
  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(width / 2, 200, 102, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

/**
 * Draw name
 */
export const drawName = (ctx, width, name) => {
  if (!name) return;
  
  ctx.save();
  ctx.font = "bold 48px Arial";
  ctx.fillStyle = "white";
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 8;
  ctx.textAlign = "center";
  ctx.fillText(name, width / 2, 350);
  ctx.restore();
};

/**
 * Draw age
 */
export const drawAge = (ctx, width, age) => {
  if (!age) return;
  
  ctx.save();
  ctx.font = "24px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 5;
  ctx.textAlign = "center";
  ctx.fillText(`Age: ${age}`, width / 2, 420);
  ctx.restore();
};

/**
 * Draw footer
 */
export const drawFooter = (ctx, width, height) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.fillRect(0, height - 80, width, 80);
  
  ctx.shadowBlur = 5;
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Interested? Connect now!", width / 2, height - 30);
  ctx.restore();
};