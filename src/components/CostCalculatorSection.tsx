import React, { useState, useMemo, useEffect } from 'react';
import { SiteConfig, CalculatorConfig } from '../types';
import { Calculator, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CostCalculatorSectionProps {
  config: SiteConfig;
}

const defaultConfig: CalculatorConfig = {
  title: 'حاسبة التكلفة التقديرية المخصصة',
  subtitle: 'حدد الخدمات المطلوبة بدقة للحصول على إجمالي سعر فوري مع خيار الطلب المباشر',
  websitePrice: 280,
  websiteLabel: 'تطوير موقع/متجر إلكتروني شامل',
  pricePerPost: 12,
  postLabel: 'عدد منشورات التواصل الاجتماعي الشهري:',
  minPosts: 0,
  maxPosts: 30,
  reelsPrice: 80,
  reelsLabel: 'إنتاج ومونتاج فيديوهات ريلز / تيك توك',
  adsPrice: 90,
  adsLabel: 'إدارة ومتابعة حملات الإعلانات الممولة',
  resultLabel: 'التكلفة التقديرية الخاطفة',
  resultNote: 'شاملة الخدمة والإعداد والاستشارة',
  whatsappButtonText: 'إرسال هذا التقدير مباشرة للواتساب',
};

export const CostCalculatorSection: React.FC<CostCalculatorSectionProps> = ({ config }) => {
  const calcConfig = useMemo(() => {
    return { ...defaultConfig, ...config.calculatorConfig };
  }, [config.calculatorConfig]);

  const minPostsLimit = calcConfig.minPosts ?? 0;
  const maxPostsLimit = calcConfig.maxPosts ?? 30;

  const [hasWebsite, setHasWebsite] = useState(false);
  const [postsCount, setPostsCount] = useState<number>(minPostsLimit);
  const [hasReels, setHasReels] = useState(false);
  const [adsManagement, setAdsManagement] = useState(false);

  // Keep postsCount within current min/max limits if admin changes config
  useEffect(() => {
    if (postsCount < minPostsLimit) {
      setPostsCount(minPostsLimit);
    } else if (postsCount > maxPostsLimit) {
      setPostsCount(maxPostsLimit);
    }
  }, [minPostsLimit, maxPostsLimit, postsCount]);

  // Math estimation logic based on admin dynamic configuration
  const estimatedCost = useMemo(() => {
    let total = 0;
    if (hasWebsite) total += Number(calcConfig.websitePrice || 0);
    total += Math.round(postsCount * Number(calcConfig.pricePerPost || 0));
    if (hasReels) total += Number(calcConfig.reelsPrice || 0);
    if (adsManagement) total += Number(calcConfig.adsPrice || 0);
    return total;
  }, [hasWebsite, postsCount, hasReels, adsManagement, calcConfig]);

  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');

  const handleOrderCustomEstimate = () => {
    const details = [
      hasWebsite ? calcConfig.websiteLabel : '',
      `${postsCount} منشور صوشيال ميديا`,
      hasReels ? calcConfig.reelsLabel : '',
      adsManagement ? calcConfig.adsLabel : '',
    ]
      .filter(Boolean)
      .join(' + ');

    const text = `مرحباً ${config.companyName}، قمت بحساب تكلفة مخصصة لخدماتي (${details}) بالتكلفة التقديرية $${estimatedCost} وأرغب بالبدء.`;
    window.open(`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="calculator" className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="carrd-glass-card rounded-3xl p-6 sm:p-10 border border-pink-500/20 relative overflow-hidden transform-gpu"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Readex_Pro',sans-serif]">
              {calcConfig.title}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {calcConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6 border-t border-white/10">
          {/* Controls */}
          <div className="space-y-4">
            {/* Website Checkbox */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 cursor-pointer hover:border-pink-500/30 transition-colors">
              <span className="text-sm font-semibold text-slate-200">{calcConfig.websiteLabel}</span>
              <input
                type="checkbox"
                checked={hasWebsite}
                onChange={(e) => setHasWebsite(e.target.checked)}
                className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
              />
            </label>

            {/* Posts Slider */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-200">{calcConfig.postLabel}</span>
                <span className="text-pink-400 font-bold text-sm">{postsCount} منشور</span>
              </div>
              <input
                type="range"
                min={minPostsLimit}
                max={maxPostsLimit}
                step={1}
                value={postsCount}
                onChange={(e) => setPostsCount(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Reels Video Checkbox */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 cursor-pointer hover:border-pink-500/30 transition-colors">
              <span className="text-sm font-semibold text-slate-200">{calcConfig.reelsLabel}</span>
              <input
                type="checkbox"
                checked={hasReels}
                onChange={(e) => setHasReels(e.target.checked)}
                className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
              />
            </label>

            {/* Ads Checkbox */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 cursor-pointer hover:border-pink-500/30 transition-colors">
              <span className="text-sm font-semibold text-slate-200">{calcConfig.adsLabel}</span>
              <input
                type="checkbox"
                checked={adsManagement}
                onChange={(e) => setAdsManagement(e.target.checked)}
                className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Result Calculation Card */}
          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-b from-[#131633] to-[#0d0f22] border border-white/10 text-center shadow-xl">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
              {calcConfig.resultLabel}
            </span>
            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 my-2">
              ${estimatedCost}
            </div>
            <span className="text-xs text-slate-400 mb-6">{calcConfig.resultNote}</span>

            <button
              onClick={handleOrderCustomEstimate}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{calcConfig.whatsappButtonText}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
