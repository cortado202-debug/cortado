import React from 'react';
import { motion } from 'motion/react';
import { Coffee, Award, ArrowDown, ChevronLeft, ShoppingBag, Ticket } from 'lucide-react';
import { useStore } from '../../lib/store';

export const Hero: React.FC = () => {
  const { setActiveCategory } = useStore();

  const handleExploreMenu = () => {
    setActiveCategory('cold');
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00A859]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#00A859]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* RIGHT COLUMN: TEXT & CALL TO ACTIONS */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col items-start text-right"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#00A859]/30 text-[#008A48] text-xs font-extrabold mb-6 shadow-md">
              <Coffee className="w-4 h-4 text-[#00A859]" />
              <span>قهوة مختصة برؤية مستقبلية ثلاثية الأبعاد 3D</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-['Cairo'] font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#2A2118] leading-tight mb-6 tracking-tight">
              ذوق الأصالة والابتكار في <br className="hidden sm:inline" />
              <span className="text-[#00A859]">
                كورتادو كافيه (Cortado CAFÉ)
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-[#523621] leading-relaxed max-w-2xl mb-8 font-normal">
              استمتع بقائمة طعام ومشروبات استثنائية تُعرض أمامك بمنصة تفاعلية 3D. 
              اختر مشروبك المفضل من المحاصيل العالمية الفاخرة المقطرة والمحضرة بكل حب وشغف.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                id="explore-menu-btn"
                onClick={handleExploreMenu}
                className="w-full sm:w-auto bg-[#00A859] hover:bg-[#008A48] text-white font-black text-base px-8 py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-[#00A859]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>استكشف القائمة التفاعلية 3D</span>
                <ChevronLeft className="w-5 h-5" />
              </button>

              <a
                href="#coupon"
                className="w-full sm:w-auto bg-[#FAF8F5] hover:bg-[#E6F6ED] text-[#2A2118] font-bold text-base px-7 py-4 rounded-xl border border-[#00A859]/30 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Ticket className="w-4 h-4 text-[#00A859]" />
                <span>جرّب كود الخصم الحصري</span>
              </a>
            </div>

            {/* Trust Markers / Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-10 mt-10 border-t border-[#E8E2D8] w-full">
              <div className="flex flex-col items-start">
                <span className="font-black text-2xl text-[#00A859] font-['Cairo']">100%</span>
                <span className="text-xs text-[#523621]">محاصيل متخصصة معتمدة</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-black text-2xl text-[#00A859] font-['Cairo']">3D</span>
                <span className="text-xs text-[#523621]">استعراض تفاعلي مميز</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-black text-2xl text-[#00A859] font-['Cairo']">4.9★</span>
                <span className="text-xs text-[#523621]">تقييم الزوار والمحبين</span>
              </div>
            </div>
          </motion.div>

          {/* LEFT COLUMN: HERO VISUAL SHOWCASE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            {/* Glowing Decorative Backdrop */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-white p-6 border border-[#E8E2D8] shadow-2xl flex flex-col items-center justify-between">
              
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-bold text-[#00733B] bg-[#E6F6ED] px-3.5 py-1 rounded-full border border-[#00A859]/30">
                  المشروب الأكثر طلباً 🔥
                </span>
                <Award className="w-5 h-5 text-[#00A859]" />
              </div>

              {/* Large Animated Coffee Image */}
              <div className="relative w-56 h-56 my-2 group cursor-pointer" onClick={handleExploreMenu}>
                <div className="absolute inset-0 bg-[#00A859]/15 rounded-full blur-2xl animate-pulse" />
                <img 
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80" 
                  alt="Iced Spanish Latte Cortado" 
                  className="w-full h-full object-cover rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-105 border-2 border-[#00A859]/30"
                />
              </div>

              {/* Quick Card Details */}
              <div className="w-full bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D8] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#2A2118]">سبانيش لاتيه بارد</h3>
                  <p className="text-xs text-[#00A859] font-black">24 ر.س</p>
                </div>
                <button 
                  onClick={handleExploreMenu}
                  className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>اطلب الآن</span>
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Downward Scroll Indicator */}
      <div className="flex justify-center mt-12">
        <a href="#menu" className="text-[#00A859] animate-bounce p-2 hover:bg-[#E6F6ED] rounded-full transition-colors">
          <ArrowDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
};
