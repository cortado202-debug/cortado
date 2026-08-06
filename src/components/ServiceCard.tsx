import React from 'react';
import { ServiceItem, SiteConfig } from '../types';
import { ExternalLink, MessageCircle, Globe, Share2, Megaphone, Palette, Compass, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceCardProps {
  item: ServiceItem;
  index: number;
  config: SiteConfig;
  isLast?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, index, config, isLast = false }) => {
  const isEven = index % 2 === 0;

  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
  const messageText = item.whatsappMessage || `مرحباً ADIX MEDIA، أرغب بالاستفسار عن ${item.title}`;
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(messageText)}`;

  const renderIcon = () => {
    switch (item.iconType) {
      case 'web':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'social':
        return <Share2 className="w-5 h-5 text-purple-400" />;
      case 'ads':
        return <Megaphone className="w-5 h-5 text-pink-400" />;
      case 'design':
        return <Palette className="w-5 h-5 text-amber-400" />;
      default:
        return <Compass className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Service Glass Card with Ultra Smooth Framer Motion Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full carrd-glass-card rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden transform-gpu"
      >
        
        {/* Subtle Gradient Backlight */}
        <div className={`absolute -bottom-20 ${isEven ? '-right-20' : '-left-20'} w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none`} />

        <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center ${isEven ? '' : 'md:dir-rtl'}`}>
          
          {/* Card Image / Visual Illustration */}
          <div className={`md:col-span-5 relative group overflow-hidden rounded-2xl border border-white/10 ${isEven ? 'order-1 md:order-1' : 'order-1 md:order-2'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d17] via-transparent to-transparent opacity-60 z-10" />
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-56 sm:h-64 md:h-72 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {item.badge && (
              <span className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-[#0b0d17]/80 backdrop-blur-md text-pink-400 border border-pink-500/30 text-xs font-bold shadow-md">
                {item.badge}
              </span>
            )}
          </div>

          {/* Card Content & Description */}
          <div className={`md:col-span-7 flex flex-col justify-center ${isEven ? 'order-2 md:order-2 text-right' : 'order-2 md:order-1 text-right'}`}>
            
            {/* Subtitle / Category Label */}
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              {renderIcon()}
              <span>{item.subtitle}</span>
            </div>

            {/* Main Service Title */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 mb-4 font-['Readex_Pro',sans-serif] leading-snug py-1">
              {item.title}
            </h2>

            {/* Service Paragraph */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              {item.description}
            </p>

          </div>

        </div>
      </motion.div>

      {/* Dotted Glowing Connector between sections with downward wave animation */}
      {!isLast && (
        <div className="flex flex-col items-center my-8 gap-2.5 opacity-90">
          <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0s' }} />
          <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0.3s' }} />
          <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0.6s' }} />
          <div className="connector-dot animate-dot-wave" style={{ animationDelay: '0.9s' }} />
          <div className="connector-dot animate-dot-wave" style={{ animationDelay: '1.2s' }} />
          <div className="connector-dot animate-dot-wave" style={{ animationDelay: '1.5s' }} />
        </div>
      )}
    </div>
  );
};
