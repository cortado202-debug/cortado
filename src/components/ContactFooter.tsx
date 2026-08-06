import React from 'react';
import { Logo } from './Logo';
import { SiteConfig, SocialLinks } from '../types';
import { MessageCircle, Settings, Share2, MapPin, Mail, Phone, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactFooterProps {
  config: SiteConfig;
  onOpenAdmin: () => void;
  onOpenSEO: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({ config, onOpenAdmin, onOpenSEO }) => {
  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent('مرحباً ADIX MEDIA، أرغب بالاستفسار عن خدماتكم')}`;

  const { socialLinks } = config;

  // Custom SVG Social Icons mapping for perfect visual alignment matching Carrd screenshot 2
  const renderSocialIcon = (key: keyof SocialLinks, url?: string) => {
    if (!url || url.trim() === '') return null; // Requirement: Only show icons that have non-empty links!

    let iconSvg: React.ReactNode = null;
    let label = '';
    let bgHover = 'hover:border-pink-500 hover:text-pink-400';

    switch (key) {
      case 'instagram':
        label = 'Instagram';
        bgHover = 'hover:border-pink-500 hover:bg-pink-500/20 text-pink-400';
        iconSvg = (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
        break;
      case 'facebook':
        label = 'Facebook';
        bgHover = 'hover:border-blue-500 hover:bg-blue-500/20 text-blue-400';
        iconSvg = (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
          </svg>
        );
        break;
      case 'behance':
        label = 'Behance';
        bgHover = 'hover:border-blue-400 hover:bg-blue-400/20 text-blue-300';
        iconSvg = (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M22 7h-7v-2h7v2zm1.726 10c0 2.174-1.523 4-4.524 4-3.151 0-4.821-2.003-4.821-4.63 0-3.084 2.138-4.733 4.887-4.733 2.871 0 4.458 1.768 4.458 4.373 0 .341-.027.674-.087.99h-6.902c.088 1.327.971 1.956 2.378 1.956 1.054 0 1.85-.436 2.188-1.077h2.422zm-4.542-3.189c-.933 0-1.706.518-1.92 1.391h3.766c-.053-.872-.731-1.391-1.846-1.391zm-9.184-7.811h-10v14h10.375c3.504 0 5.625-1.884 5.625-4.595 0-1.883-.997-3.238-2.607-3.865 1.258-.613 2.007-1.792 2.007-3.328 0-2.387-1.93-2.212-5.4 2.212zm-6.25 2.5h2.903c1.395 0 2.222.457 2.222 1.488 0 1.03-.889 1.512-2.31 1.512h-2.815v-3zm0 5.5h3.197c1.558 0 2.528.539 2.528 1.708 0 1.251-.97 1.792-2.628 1.792h-3.097v-3.5s0 0 0 0z"/>
          </svg>
        );
        break;
      case 'tiktok':
        label = 'TikTok';
        bgHover = 'hover:border-cyan-400 hover:bg-cyan-400/20 text-cyan-300';
        iconSvg = (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.56-1.28 2.55.01.81.42 1.61 1.08 2.09.77.58 1.83.73 2.74.45 1.08-.31 1.87-1.28 1.97-2.4.03-2.38.01-4.76.01-7.14 0-3.32-.01-6.64 0-9.96z"/>
          </svg>
        );
        break;
      case 'whatsapp':
        label = 'WhatsApp';
        bgHover = 'hover:border-emerald-500 hover:bg-emerald-500/20 text-emerald-400';
        iconSvg = (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        );
        break;
      default:
        label = key;
        iconSvg = <Share2 className="w-5 h-5" />;
    }

    return (
      <a
        key={key}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={`p-3.5 rounded-full bg-slate-900/80 border border-white/10 ${bgHover} transition-all transform hover:scale-110 shadow-lg cursor-pointer`}
      >
        {iconSvg}
      </a>
    );
  };

  const activeSocialKeys = (Object.keys(socialLinks) as Array<keyof SocialLinks>).filter(
    (k) => socialLinks[k] && socialLinks[k]?.trim() !== ''
  );

  return (
    <footer id="contact" className="relative pt-16 pb-12 border-t border-white/10 bg-[#080912]/90">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center transform-gpu"
      >
        
        {/* Bottom Hero Call to Action matching Carrd screenshot 2 */}
        <div className="w-full carrd-glass-card rounded-3xl p-8 sm:p-12 mb-12 border border-white/10 relative overflow-hidden flex flex-col items-center">
          
          <div className="mb-6">
            <Logo size="lg" variant="icon" showGlowingBorder={true} customLogoUrl={config.customLogoUrl} />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 mb-3 font-['Readex_Pro',sans-serif] leading-snug py-1">
            أطلق العنان للنمو، لنصنع السحر!
          </h2>

          <p className="text-slate-300 text-sm sm:text-base mb-8">
            تواصلنا، الإبداع بانتظاركم. فريقنا جاهز لتحويل أفكارك إلى واقع رقمي مبهر.
          </p>

          {/* Social Links Bar (Only active configured links appear!) */}
          {activeSocialKeys.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-white/10 w-full">
              {activeSocialKeys.map((key) => renderSocialIcon(key, socialLinks[key]))}
            </div>
          )}

        </div>

        {/* Company Quick Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8 text-slate-300 text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
            <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="font-semibold">سوريا - حماة</span>
          </div>

          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">عَمّان - الأردن</span>
          </div>
        </div>

        {/* Footer Bottom Bar & Copyright */}
        <div className="flex items-center justify-center w-full pt-6 border-t border-white/5 text-slate-500 text-xs text-center">
          <div className="flex items-center gap-2">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <span className="font-bold text-slate-300">ADIX MEDIA</span>
          </div>
        </div>

      </motion.div>
    </footer>
  );
};
