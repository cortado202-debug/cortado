import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Sparkles, CheckCircle2, X, ChevronLeft } from 'lucide-react';
import { useStore } from '../../lib/store';

interface FlyingParticle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageUrl?: string;
  nameAr?: string;
}

interface CartToast {
  id: string;
  nameAr?: string;
  sizeName?: string;
  price?: number;
  imageUrl?: string;
}

export const FlyToCartParticle: React.FC = () => {
  const [particles, setParticles] = useState<FlyingParticle[]>([]);
  const [activeToast, setActiveToast] = useState<CartToast | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toggleCart } = useStore();

  useEffect(() => {
    const handleFlyEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        startX: number;
        startY: number;
        imageUrl?: string;
        nameAr?: string;
        sizeName?: string;
        price?: number;
      }>;

      const { startX, startY, imageUrl, nameAr, sizeName, price } = customEvent.detail || {};

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

      // Trigger floating success toast message
      if (nameAr) {
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }

        setActiveToast({
          id: `toast-${Date.now()}`,
          nameAr,
          sizeName,
          price,
          imageUrl
        });

        toastTimeoutRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 3600);
      }
    };

    window.addEventListener('fly-to-cart', handleFlyEvent);
    return () => {
      window.removeEventListener('fly-to-cart', handleFlyEvent);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
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
              {/* Main Flying Product Card */}
              <motion.div
                initial={{
                  x: p.startX - 28,
                  y: p.startY - 28,
                  scale: 0.3,
                  opacity: 0,
                  rotate: -5
                }}
                animate={{
                  x: [p.startX - 28, midX - 28, p.targetX - 16],
                  y: [p.startY - 28, midY, p.targetY - 16],
                  scale: [0.4, 1.1, 0.25],
                  rotate: [0, -10, 360],
                  opacity: [0, 1, 1, 0.2, 0]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.0,
                  ease: [0.25, 0.1, 0.25, 1],
                  times: [0, 0.4, 0.8, 0.95, 1]
                }}
                onAnimationComplete={() => handleParticleComplete(p.id)}
                className="absolute top-0 left-0 pointer-events-none"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#00A859] border-2 border-white shadow-[0_10px_25px_rgba(0,168,89,0.5)] flex items-center justify-center p-1 overflow-hidden relative backdrop-blur-xs">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.nameAr || 'منتج'}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <ShoppingBag className="w-7 h-7 text-white" />
                  )}
                  {/* Floating +1 Tag Badge */}
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-[#2A2118] text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    +1 🛒
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </AnimatePresence>

      {/* FLOATING SUCCESS TOAST MESSAGE */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 15, scale: 0.92, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-[360px] pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-emerald-200/90 shadow-[0_12px_35px_rgba(0,168,89,0.18)] rounded-2xl p-2.5 sm:p-3 text-right flex items-center justify-between gap-2.5 text-[#2A2118] overflow-hidden relative group">
              
              {/* Green Glow Accent Top Line */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#00A859] via-emerald-400 to-[#D4A373]" />

              <div className="flex items-center gap-2.5 min-w-0">
                {/* Product Thumbnail or Green Check Icon */}
                <div className="relative shrink-0">
                  {activeToast.imageUrl ? (
                    <img
                      src={activeToast.imageUrl}
                      alt={activeToast.nameAr}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-emerald-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00A859] flex items-center justify-center text-white">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-[#00A859] text-white rounded-full p-0.5 border-2 border-white shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 leading-tight mb-0.5">
                    <span className="text-[11px] sm:text-xs font-black text-[#00A859] font-['Cairo'] flex items-center gap-1">
                      <span>تمت الإضافة للسلة!</span>
                      <span className="text-amber-500 text-[11px]">🛒</span>
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#2A2118] truncate font-['Cairo'] leading-tight">
                    {activeToast.nameAr} {activeToast.sizeName ? `(${activeToast.sizeName})` : ''}
                  </p>
                  {activeToast.price && (
                    <span className="text-[10px] font-mono text-[#8B5E34] font-bold block mt-0.5">
                      المبلغ: {activeToast.price} ل.س
                    </span>
                  )}
                </div>
              </div>

              {/* Actions: Open Cart & Close Toast */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setActiveToast(null);
                    toggleCart(true);
                  }}
                  className="bg-[#00A859] hover:bg-[#008A48] active:scale-95 text-white font-black text-[11px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-xs cursor-pointer font-['Cairo'] whitespace-nowrap"
                >
                  <span>السلة</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setActiveToast(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="إغلاق التنبيه"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Animated Progress Bar Timer */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3.5, ease: 'linear' }}
                className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#00A859]"
              />

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

