import React from 'react';
import { Logo } from './Logo';
import { ChevronDown, MessageCircle, Zap } from 'lucide-react';
import { SiteConfig } from '../types';
import { motion } from 'motion/react';

interface HeroProps {
  config: SiteConfig;
}

export const Hero: React.FC<HeroProps> = ({ config }) => {
  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent('مرحباً ADIX MEDIA، أرغب بالاستفسار عن خدماتكم')}`;

  return (
    <section id="hero" className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center flex flex-col items-center">
      
      {/* Top Main Hero Glass Card with Motion entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full carrd-glass-card rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden flex flex-col items-center"
      >
        
        {/* Subtle Ambient Top Backlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-pink-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Circular Logo with Thin Animated Multi-Color Glow Ring */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Logo size="hero" variant="icon" showGlowingBorder={true} customLogoUrl={config.customLogoUrl} />
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 tracking-tight leading-snug py-2 mb-6 font-['Readex_Pro',sans-serif]"
        >
          {config.heroTitle}
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal mb-8 text-balance"
        >
          {config.heroSubtitle}
        </motion.p>

        {/* Primary CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-pink-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>تواصل معنا عبر واتساب</span>
          </a>

          <a
            href="#pricing"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>استعرض الباقات والأسعار</span>
          </a>
        </motion.div>

        {/* Animated Downward Arrow Indicator */}
        <a
          href="#services"
          className="mt-4 inline-flex items-center justify-center p-3 rounded-full bg-slate-900/80 text-pink-400 border border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/20 transition-all transform hover:scale-110 animate-bounce cursor-pointer shadow-lg shadow-pink-500/10"
          title="انتقل إلى الخدمات"
        >
          <ChevronDown className="w-6 h-6" />
        </a>

      </motion.div>

      {/* Dotted Glowing Connector Line linking Hero to Services with downward wave animation */}
      <div className="flex flex-col items-center my-6 gap-2.5 opacity-90">
        <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0s' }} />
        <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0.3s' }} />
        <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0.6s' }} />
        <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0.9s' }} />
        <div className="connector-dot animate-dot-wave" style={{ animationDelay: '1.2s' }} />
        <div className="connector-dot animate-dot-wave" style={{ animationDelay: '1.5s' }} />
      </div>

    </section>
  );
};
