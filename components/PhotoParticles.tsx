import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore, ElementType } from '../store';

/**
 * PhotoParticles - 量子粒子照片可视化系统
 * 将用户上传的照片转换为高科技粒子效果
 *
 * 核心特性：
 * 1. 极高饱和度的冷暖色调分离，模拟发光感
 * 2. 高密度粒子采样，增加细节
 * 3. 基于噪声的全局流动场 (Flow Field)
 * 4. 数字扫描线干扰，增强科技感
 * 5. 鼠标交互排斥力
 */

const ELEMENT_COLORS: Record<ElementType, { warm: string; cool: string }> = {
  wood: { warm: '#22d3ee', cool: '#06b6d4' },
  fire: { warm: '#f43f5e', cool: '#fb923c' },
  earth: { warm: '#fbbf24', cool: '#f59e0b' },
  metal: { warm: '#e2e8f0', cool: '#cbd5e1' },
  water: { warm: '#3b82f6', cool: '#0ea5e9' }
};

interface PhotoParticlesProps {
  imageUrl: string | null;
  isActive: boolean;
}

export const PhotoParticles: React.FC<PhotoParticlesProps> = ({ imageUrl, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);

  const currentElement = useStore(state => state.currentElement) || 'water';

  // 配置参数
  const CONFIG = {
    particleGap: 3,         // 粒子间隔（性能敏感）
    mouseRadius: 150,       // 鼠标交互范围
    mouseForce: 25,         // 鼠标排斥力
    returnSpeed: 0.1,       // 回弹速度
    colorStrength: 2.5,     // 色彩增强强度
    flowSpeed: 0.6,         // 全局流动速度
    noiseScale: 0.003,      // 噪声纹理尺度
    scanlineIntensity: 6    // 扫描线干扰强度
  };

  // 生成粒子数据
  const initParticles = useCallback((image: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { particles: [], width: 0, height: 0 };

    const maxSize = 800;
    let w = image.width;
    let h = image.height;

    // 等比例缩放
    if (w > h && w > maxSize) {
      h = (h * maxSize) / w;
      w = maxSize;
    } else if (h > maxSize) {
      w = (w * maxSize) / h;
      h = maxSize;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(image, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h).data;
    const particles = [];

    // 获取当前元素的色调
    const elementColors = ELEMENT_COLORS[currentElement];

    for (let y = 0; y < h; y += CONFIG.particleGap) {
      for (let x = 0; x < w; x += CONFIG.particleGap) {
        const index = (y * w + x) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const alpha = imageData[index + 3];

        if (alpha > 20) {
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          // 色彩增强处理
          let tr = r, tg = g, tb = b;

          // 1. 饱和度提升
          const avg = (r + g + b) / 3;
          tr = avg + (r - avg) * CONFIG.colorStrength;
          tg = avg + (g - avg) * CONFIG.colorStrength;
          tb = avg + (b - avg) * CONFIG.colorStrength;

          // 2. 冷暖色分离（根据亮度）
          if (brightness < 0.4) {
            // 暗部：深色调
            tr = tr * 0.3;
            tg = tg * 0.5;
            tb = tb * 1.5 + 40;
          } else if (brightness < 0.7) {
            // 中间调：当前元素色调
            tr = tr * 0.6;
            tg = tg * 1.1 + 20;
            tb = tb * 1.3 + 30;
          } else {
            // 亮部：高亮色调
            tr = tr * 1.3 + 50;
            tg = tg * 1.2 + 40;
            tb = tb * 0.9 + 30;
          }

          const color = `rgb(${Math.min(255, Math.max(0, tr))}, ${Math.min(255, Math.max(0, tg))}, ${Math.min(255, Math.max(0, tb))})`;

          particles.push({
            x: x,
            y: y,
            originX: x,
            originY: y,
            color: color,
            brightness: brightness,
            size: (Math.random() * 0.8 + 0.3) + brightness * brightness * 3.0,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    return { particles, width: w, height: h };
  }, [currentElement, CONFIG.particleGap, CONFIG.colorStrength]);

  // 加载图片
  const loadImage = useCallback((url: string) => {
    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      const { particles, width, height } = initParticles(img);
      particlesRef.current = particles;

      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        canvasRef.current.width = container.clientWidth;
        canvasRef.current.height = container.clientHeight;

        const scale = Math.min(
          canvasRef.current.width / width,
          canvasRef.current.height / height
        ) * 0.85;

        const offsetX = (canvasRef.current.width - width * scale) / 2;
        const offsetY = (canvasRef.current.height - height * scale) / 2;

        particlesRef.current.forEach(p => {
          p.originX = p.originX * scale + offsetX;
          p.originY = p.originY * scale + offsetY;
          p.x = p.originX;
          p.y = p.originY;
          p.size *= scale;
        });
      }

      setIsLoading(false);
    };

    img.onerror = (e) => {
      console.error("Image load failed", e);
      setIsLoading(false);
    };
  }, [initParticles]);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 深色背景 + 拖尾效果
    ctx.fillStyle = 'rgba(1, 1, 5, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 叠加模式创造发光效果
    ctx.globalCompositeOperation = 'lighter';

    timeRef.current += 0.02;
    const time = timeRef.current;

    // 鼠标位置
    let mx = -1000, my = -1000;
    if (mouseRef.current.x !== 0 && mouseRef.current.y !== 0) {
      const rect = canvas.getBoundingClientRect();
      mx = mouseRef.current.x - rect.left;
      my = mouseRef.current.y - rect.top;
    }

    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 1. 全局流动场 (Flow Field)
      const noiseX = (p.originX * CONFIG.noiseScale) + time * 0.1;
      const noiseY = (p.originY * CONFIG.noiseScale) + time * 0.1;
      const flowAngle = (Math.sin(noiseX) + Math.cos(noiseY)) * Math.PI;

      p.originX += Math.cos(flowAngle) * CONFIG.flowSpeed * (1 - p.brightness);
      p.originY += Math.sin(flowAngle) * CONFIG.flowSpeed * (1 - p.brightness);

      // 2. 鼠标排斥力
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      let force = 0;
      if (dist < CONFIG.mouseRadius) {
        force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
      }

      // 3. 扫描线干扰
      const scanline = Math.sin(p.originY * 0.02 + time * 5) * Math.cos(time * 2 + p.phase);
      const glitchX = scanline * CONFIG.scanlineIntensity * p.brightness;

      // 4. 计算目标位置
      const tx = p.originX - Math.cos(angle) * force * CONFIG.mouseForce * 5 + glitchX;
      const ty = p.originY - Math.sin(angle) * force * CONFIG.mouseForce * 5;

      // 5. 弹性移动
      p.x += (tx - p.x) * CONFIG.returnSpeed;
      p.y += (ty - p.y) * CONFIG.returnSpeed;

      // 6. 绘制
      ctx.fillStyle = p.color;

      // 亮部光晕
      if (p.brightness > 0.85) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 核心粒子
      if (p.brightness > 0.9) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    requestRef.current = requestAnimationFrame(animate);
  }, [isActive, CONFIG]);

  // 启动动画循环
  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, isActive]);

  // 加载图片
  useEffect(() => {
    if (imageUrl && isActive) {
      loadImage(imageUrl);
    }
  }, [imageUrl, isActive, loadImage]);

  // 鼠标移动处理
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  // 窗口大小调整
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;

        // 重新加载图片以重新计算粒子位置
        if (imageUrl) {
          loadImage(imageUrl);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl, loadImage]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30"
      onMouseMove={handleMouseMove}
      style={{ pointerEvents: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* 叠加纹理和晕影效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay bg-repeat" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#010105_90%)]" />

      {/* 加载提示 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-white/10 rounded-full" />
              <div className="absolute top-0 left-0 w-12 h-12 border-2 border-t-cyan-400 rounded-full animate-spin" />
            </div>
            <span className="text-cyan-200/80 tracking-[0.2em] text-xs uppercase animate-pulse">
              Processing Quantum Data...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
