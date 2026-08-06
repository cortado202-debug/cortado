import React from 'react';
import { PortfolioItem } from '../types';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PortfolioMarqueeProps {
  items: PortfolioItem[];
  onOpenAdmin?: () => void;
}

export const PortfolioMarquee: React.FC<PortfolioMarqueeProps> = ({ items, onOpenAdmin }) => {
  // Duplicate array for seamless infinite marquee effect
  const marqueeItems = [...items, ...items, ...items];

  return (
    <section id="portfolio" className="w-full py-16 px-4 relative overflow-hidden">
      
      {/* Section Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center mb-10 transform-gpu"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 font-['Readex_Pro',sans-serif] leading-snug py-1">
          آخر الأعمال والشركاء
        </h2>
      </motion.div>

      {/* Infinite Auto-Scrolling Marquee Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative w-full overflow-hidden py-4 transform-gpu"
      >
        {/* Left/Right Fading Shadow Gradients for visual polish */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0b0d17] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0b0d17] to-transparent z-20 pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex animate-marquee gap-6">
          {marqueeItems.map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none w-72 sm:w-80 group carrd-glass-card rounded-2xl p-4 border border-white/10 hover:border-pink-500/50 transition-all duration-300 transform hover:-translate-y-1 block cursor-pointer"
            >
              {/* Image Preview / Logo */}
              <div className="relative h-44 rounded-xl overflow-hidden mb-3 border border-white/5 bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d17] via-transparent to-transparent opacity-80" />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#0b0d17]/80 text-[11px] font-semibold text-pink-400 border border-pink-500/30">
                  {item.category}
                </span>
                <div className="absolute bottom-2.5 left-2.5 p-2 rounded-full bg-pink-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              {/* Title & Client info */}
              <div className="px-1 text-right">
                <h3 className="text-slate-100 font-bold text-sm sm:text-base line-clamp-1 group-hover:text-pink-400 transition-colors font-['Readex_Pro',sans-serif]">
                  {item.title}
                </h3>
                {item.clientName && (
                  <p className="text-slate-400 text-xs mt-1 font-medium">
                    العميل: {item.clientName}
                  </p>
                )}
                {item.description && (
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed opacity-80">
                    {item.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </motion.div>

    </section>
  );
};
