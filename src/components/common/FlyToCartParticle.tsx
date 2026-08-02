import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface FlyingParticle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageUrl?: string;
  nameAr?: string;
}

export const FlyToCartParticle: React.FC = () => {
  const [particles, setParticles] = useState<FlyingParticle[]>([]);

  useEffect(() => {
    const handleFlyEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        startX: number;
        startY: number;
        imageUrl?: string;
        nameAr?: string;
      }>;

      const { startX, startY, imageUrl, nameAr } = customEvent.detail || {};

      // Find cart trigger button position
      const cartBtn = document.getElementById('cart-trigger-btn') || document.getElementById('cart-trigger-btn-mobile');
      let targetX = window.innerWidth - 60;
      let targetY = 30;

      if (cartBtn) {
        const rect = cartBtn.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }

      const newParticle: FlyingParticle = {
        id: `particle-${Date.now()}-${Math.random()}`,
        startX: startX || window.innerWidth / 2,
        startY: startY || window.innerHeight / 2,
        targetX,
        targetY,
        imageUrl,
        nameAr
      };

      setParticles((prev) => [...prev, newParticle]);
    };

    window.addEventListener('fly-to-cart', handleFlyEvent);
    return () => {
      window.removeEventListener('fly-to-cart', handleFlyEvent);
    };
  }, []);

  const handleParticleComplete = (id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
    // Trigger bounce effect on cart header icon
    window.dispatchEvent(new CustomEvent('cart-item-added-bounce'));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          // Calculate high graceful arc curve
          const midX = (p.startX + p.targetX) / 2;
          const midY = Math.min(p.startY, p.targetY) - 180;

          return (
            <React.Fragment key={p.id}>
              {/* Trailing Sparkle / Glow Effect */}
              <motion.div
                initial={{
                  x: p.startX - 10,
                  y: p.startY - 10,
                  scale: 0.5,
                  opacity: 0.8
                }}
                animate={{
                  x: [p.startX - 10, midX - 10, p.targetX - 5],
                  y: [p.startY - 10, midY + 10, p.targetY - 5],
                  scale: [0.5, 1.2, 0.2],
                  opacity: [0.8, 0.6, 0]
                }}
                transition={{
                  duration: 1.65,
                  delay: 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                  times: [0, 0.5, 1]
                }}
                className="absolute top-0 left-0 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
              >
                <Sparkles className="w-8 h-8 animate-spin" />
              </motion.div>

              {/* Main Flying Product Card */}
              <motion.div
                initial={{
                  x: p.startX - 36,
                  y: p.startY - 36,
                  scale: 0.2,
                  opacity: 0,
                  rotate: -10
                }}
                animate={{
                  x: [p.startX - 36, midX - 36, p.targetX - 20],
                  y: [p.startY - 36, midY, p.targetY - 20],
                  scale: [0.3, 1.4, 0.25],
                  rotate: [0, -18, 360],
                  opacity: [0, 1, 1, 0.1, 0]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.65,
                  ease: [0.25, 0.1, 0.25, 1],
                  times: [0, 0.45, 0.85, 0.98, 1]
                }}
                onAnimationComplete={() => handleParticleComplete(p.id)}
                className="absolute top-0 left-0"
              >
                <div className="w-18 h-18 rounded-2xl bg-[#00A859] border-2 border-white shadow-[0_15px_35px_rgba(0,168,89,0.55),0_0_20px_rgba(0,168,89,0.4)] flex items-center justify-center p-1.5 overflow-hidden relative group backdrop-blur-xs">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.nameAr || 'منتج'}
                      className="w-full h-full object-cover rounded-xl shadow-inner"
                    />
                  ) : (
                    <ShoppingBag className="w-9 h-9 text-white" />
                  )}
                  {/* Floating +1 Tag Badge */}
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-[#2A2118] text-[11px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                    +1 🛒
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

