import React, { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { SiteConfig } from '../types';

interface SEOPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
}

export const SEOPreviewModal: React.FC<SEOPreviewModalProps> = ({ isOpen, onClose, config }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = 'https://adixmediaa.carrd.co/';
  const whatsappShareText = `*${config.companyName} | للحلول الرقمية والتسويق*\n\n${config.heroSubtitle}\n\n🔗 تصفح موقعنا الرسمي:\n${appUrl}`;

  const handleCopyShareMessage = () => {
    navigator.clipboard.writeText(whatsappShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#11142b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161938] border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white font-['Readex_Pro',sans-serif]">
              معاينة بطاقة مشاركة الرابط عبر الواتساب (WhatsApp Card SEO)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            هكذا تظهر بطاقة موقع شركة <strong>ADIX MEDIA</strong> تلقائياً عند إرسال الرابط لأي شخص أو العميل عبر الواتساب ووسائل التواصل الاجتماعي:
          </p>

          {/* Realistic Simulated WhatsApp Chat Bubble */}
          <div className="p-4 rounded-2xl bg-[#0b141a] border border-emerald-900/40 space-y-2 shadow-2xl">
            <div className="p-3 rounded-xl bg-[#1f2c34] border border-white/5 space-y-2 overflow-hidden">
              
              {/* WhatsApp Card Preview Image */}
              <div className="relative h-44 rounded-lg overflow-hidden bg-slate-900 border border-white/5">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
                  alt="ADIX MEDIA WhatsApp Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 p-1 border border-pink-500/50 flex items-center justify-center">
                      <span className="text-[10px] font-extrabold text-pink-400">X</span>
                    </div>
                    <span className="text-xs font-bold text-white">ADIX MEDIA</span>
                  </div>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-100 font-['Readex_Pro',sans-serif]">
                  ADIX MEDIA | شركة أديكس ميديا للحلول الرقمية والتسويق
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  نبتكر لعلامتك حضوراً مؤكداً. منصتك الشاملة لبناء وتطوير المواقع والمتاجر الإلكترونية، وإدارة حسابات التواصل الاجتماعي والإعلانات بأعلى كفاءة.
                </p>
                <span className="text-[11px] text-emerald-400 font-mono block">
                  adixmediaa.carrd.co
                </span>
              </div>
            </div>

            {/* Chat timestamp */}
            <div className="flex justify-end text-[10px] text-slate-400">
              12:00 م ✓✓
            </div>
          </div>

          {/* SEO Meta Tags Status */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>جاهزية أوسمة SEO وOpenGraph:</span>
              <span>100% مكتملة ✅</span>
            </div>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li>✓ تم ضبط أوسمة og:image و og:title و og:description</li>
              <li>✓ تم تضمين أيقونة المتصفح Favicon بدقة عالية SVG</li>
              <li>✓ تم تفعيل الدعم الكامل للغة العربية والاتجاه RTL</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161938] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
          >
            إغلاق
          </button>

          <button
            onClick={handleCopyShareMessage}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ نص المشاركة!' : 'نسخ نص مشاركة الواتساب'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
