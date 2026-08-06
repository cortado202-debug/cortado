import React, { useState } from 'react';
import { PricingPlan, SiteConfig } from '../types';
import { Check, MessageCircle, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingSectionProps {
  plans: PricingPlan[];
  config: SiteConfig;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ plans, config }) => {
  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (planId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const handleOrderPlan = (planName: string, planPrice: string) => {
    const text = `مرحباً ${config.companyName}، أرغب بطلب (${planName}) بسعر (${planPrice})`;
    window.open(`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      
      {/* Section Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-12 transform-gpu"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold mb-3">
          <Zap className="w-4 h-4" />
          <span>خطط وباقات شفافة وواضحة</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 mb-3 font-['Readex_Pro',sans-serif] leading-snug py-1">
          باقات الاستثمار والخدمات
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          اختر الباقة المناسبة لطموح حريتك المالية وتوسع علامتك التجارية، أو احسب تكلفة مشروعك بنفسك
        </p>
      </motion.div>

      {/* Pricing Packages Cards Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${
        plans.length === 4 
          ? 'lg:grid-cols-4' 
          : plans.length >= 5 
          ? 'lg:grid-cols-3 xl:grid-cols-4' 
          : 'lg:grid-cols-3'
      } gap-6 sm:gap-7 mb-16 items-start`}>
        {plans.map((plan, index) => {
          const isPopular = plan.popular;
          const isExpanded = !!expandedCards[plan.id];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
              className={`relative carrd-glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 transform-gpu ${
                isPopular
                  ? 'border-2 border-pink-500 shadow-2xl shadow-pink-500/20 bg-[#16193b]/90'
                  : 'border border-white/10 bg-slate-950/60'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 right-6 px-3.5 py-0.5 rounded-full text-[11px] font-bold shadow-md ${
                  isPopular
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-slate-800 text-pink-400 border border-pink-500/30'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Header */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-['Readex_Pro',sans-serif]">
                  {plan.name}
                </h3>

                {/* Plan Price */}
                <div className="flex items-baseline gap-1.5 mb-4 pb-4 border-b border-white/10">
                  <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-200">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">
                    / {plan.duration}
                  </span>
                </div>

                {/* Order Button */}
                <button
                  onClick={() => handleOrderPlan(plan.name, plan.price)}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isPopular
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-pink-500/25 hover:scale-102'
                      : 'bg-slate-800 hover:bg-pink-600 text-slate-200 hover:text-white border border-white/10'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>اطلب الباقة الآن عبر واتساب</span>
                </button>

                {/* Toggle Details Slide-down Button */}
                <button
                  onClick={() => toggleExpand(plan.id)}
                  className="w-full mt-3.5 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-pink-400 hover:text-pink-300 text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer group"
                >
                  <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل والمميزات'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                </button>

                {/* Smooth Slide Down Features & Description */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="details-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-white/10 space-y-3.5">
                        {plan.description && (
                          <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/70 p-3 rounded-xl border border-white/5">
                            {plan.description}
                          </p>
                        )}

                        {plan.features && plan.features.filter(f => f.trim()).length > 0 && (
                          <ul className="space-y-2.5">
                            {plan.features.filter(f => f.trim()).map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2.5 text-slate-300 text-xs leading-normal">
                                <div className="p-0.5 rounded-full bg-pink-500/20 text-pink-400 mt-0.5 shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
