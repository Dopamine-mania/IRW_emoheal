import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useStore, ElementType } from '../store';

/**
 * PhotoDeconstruction - 照片解构动画组件
 * 4个阶段：扫描 -> 解构 -> 共振 -> 连接
 * 总时长：3.5-4秒
 */

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string;
  originalColor: string;
  targetColor: string;
  brightness: number;
  size: number;
  vx: number;
  vy: number;
  phase: number;
}

export const PhotoDeconstruction: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const phaseRef = useRef(0); // 0: scanning, 1: deconstructing, 2: resonating, 3: connecting

  const uploadedPhoto = useStore(state => state.uploadedPhoto);
  const currentElement = useStore(state => state.currentElement) || 'water';
  const enterWorld = useStore(state => state.enterWorld);

  const [isComplete, setIsComplete] = useState(false);

  const elementColor = ELEMENT_COLORS[currentElement];

  // 从图片生成粒子
  const initParticles = useCallback((image: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // 限制分辨率为512px宽
    const maxWidth = 512;
    let w = image.width;
    let h = image.height;

    if (w > maxWidth) {
      h = (h * maxWidth) / w;
      w = maxWidth;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(image, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h).data;
    const particles: Particle[] = [];
    const gap = 4; // 粒子间隔

    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const index = (y * w + x) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const alpha = imageData[index + 3];

        if (alpha > 20) {
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          const color = `rgb(${r}, ${g}, ${b})`;

          particles.push({
            x: x,
            y: y,
            originX: x,
            originY: y,
            color: color,
            originalColor: color,
            targetColor: elementColor,
            brightness: brightness,
            size: 2 + brightness * 2,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    return particles;
  }, [elementColor]);

  // 加载图片并初始化粒子
  useEffect(() => {
    if (!uploadedPhoto || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = uploadedPhoto;

    img.onload = () => {
      const particles = initParticles(img);

      // 居中并缩放粒子
      const scale = Math.min(
        canvas.width / 512,
        canvas.height / 512
      ) * 0.6;

      const offsetX = (canvas.width - 512 * scale) / 2;
      const offsetY = (canvas.height - 512 * scale) / 2;

      particles.forEach(p => {
        p.originX = p.originX * scale + offsetX;
        p.originY = p.originY * scale + offsetY;
        p.x = p.originX;
        p.y = p.originY;
        p.size *= scale;
      });

      particlesRef.current = particles;
    };
  }, [uploadedPhoto, initParticles]);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布 - 完全清除避免曝光
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    timeRef.current += 1/60;
    const time = timeRef.current;

    // 阶段控制 - 延长到8秒匹配打字机节奏
    if (time < 2.0) {
      phaseRef.current = 0; // 扫描 - 2s让用户看清照片
    } else if (time < 5.0) {
      phaseRef.current = 1; // 解构 - 2-5s温柔解构
    } else if (time < 7.0) {
      phaseRef.current = 2; // 共振 - 5-7s
    } else if (time < 8.0) {
      phaseRef.current = 3; // 连接 - 7-8s
    } else {
      // 动画结束，进入播放页
      if (!isComplete) {
        setIsComplete(true);
        enterWorld();
      }
      return;
    }

    const phase = phaseRef.current;
    const particles = particlesRef.current;

    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // ========== 阶段 1: 扫描 (0-2s) ==========
      if (phase === 0) {
        // 扫描线效果
        const scanY = (time / 2.0) * canvas.height;
        if (Math.abs(p.y - scanY) < 20) {
          ctx.fillStyle = elementColor;
          ctx.globalAlpha = 0.8;
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 1.0;
        }
      }

      // ========== 阶段 2: 解构 (2-5s) - 温柔地飘散 ==========
      else if (phase === 1) {
        const progress = (time - 2.0) / 3.0;

        // 温柔的飘散运动 - 减小速度和加速度
        p.vx += (Math.random() - 0.5) * 0.15; // 降低随机力
        p.vy += (Math.random() - 0.5) * 0.15;

        // 轻柔向上漂浮（像烟雾但更慢）
        p.vy -= 0.08 * progress;

        // 更强的阻尼，让运动更流畅
        p.vx *= 0.95;
        p.vy *= 0.95;

        p.x += p.vx;
        p.y += p.vy;

        // 颜色逐渐变化到元素色
        const colorProgress = progress * 0.5;
        const originalRGB = p.originalColor.match(/\d+/g)?.map(Number) || [255, 255, 255];
        const targetRGB = hexToRgb(p.targetColor);

        const r = Math.floor(originalRGB[0] + (targetRGB[0] - originalRGB[0]) * colorProgress);
        const g = Math.floor(originalRGB[1] + (targetRGB[1] - originalRGB[1]) * colorProgress);
        const b = Math.floor(originalRGB[2] + (targetRGB[2] - originalRGB[2]) * colorProgress);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.globalAlpha = 0.9 - progress * 0.2; // 保持更高的透明度
      }

      // ========== 阶段 3: 共振 (5-7s) - 温和震动 ==========
      else if (phase === 2) {
        const progress = (time - 5.0) / 2.0;

        // 温和的震动效果
        const vibration = Math.sin(time * 20 + p.phase) * 1.5; // 降低频率和幅度
        p.x += vibration * (1 - progress);
        p.y += Math.cos(time * 20 + p.phase) * 1.5 * (1 - progress);

        // 颜色完全转换为元素色
        ctx.fillStyle = p.targetColor;
        ctx.globalAlpha = 0.7 + Math.sin(time * 8 + p.phase) * 0.15; // 更柔和的闪烁
      }

      // ========== 阶段 4: 连接/流淌 (7-8s) - 温柔扩散形成星河 ==========
      else if (phase === 3) {
        const progress = (time - 7.0) / 1.0;

        // 温柔地向四周扩散（而非爆炸）
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const angle = Math.atan2(dy, dx);

        // 减速扩散，像水波纹般温柔
        const speed = 8 * progress; // 大幅降低速度
        p.x += Math.cos(angle) * speed;
        p.y += Math.sin(angle) * speed;

        // 添加轻微波动
        p.x += Math.sin(time * 10 + p.phase) * 0.5;
        p.y += Math.cos(time * 10 + p.phase) * 0.5;

        ctx.fillStyle = p.targetColor;
        ctx.globalAlpha = 0.8 - progress * 0.6; // 渐隐更柔和
      }

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;

    requestRef.current = requestAnimationFrame(animate);
  }, [elementColor, isComplete, enterWorld]);

  // 启动动画
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 25, pointerEvents: 'none' }}
    />
  );
};

// 辅助函数：hex转rgb
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [255, 255, 255];
}
