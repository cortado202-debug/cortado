import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import adixMediaLogo from '../../assets/images/adix_media_logo_1785267780952.jpg';
import { 
  Coffee, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  MapPin, 
  Phone, 
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useStore();

  return (
    <footer id="about" className="bg-[#FAF8F5] border-t border-[#E8E2D8] pt-12 pb-8 text-right relative overflow-hidden text-[#2A2118]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-[#E8E2D8]">
          
          {/* BRAND SUMMARY (COL-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="w-12 h-12 rounded-full bg-[#00A859] p-0.5 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt={settings.siteTitle} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Coffee className="w-5 h-5 text-white" />
                )}
              </motion.div>
              <div className="flex flex-col">
                <span className="font-['Cairo'] font-extrabold text-2xl text-[#2A2118]">
                  {settings.siteTitle}
                </span>
                <span className="text-[11px] font-sans font-black text-[#00A859] tracking-[0.2em] uppercase font-['Dancing_Script',cursive]">
                  {settings.siteSubtitle || 'Cortado CAFÉ'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#523621] leading-relaxed font-normal max-w-md">
              كورتادو كافيه يقدم أرقى تجربة قهوة مختصة بحرفية عالية، نجمع بين جودة المحاصيل العالمية والعرض الأنيق لعملائنا الكرام.
            </p>

            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-3 pt-2">
              {settings.socials.instagram && (
                <a 
                  href={settings.socials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#00A859] text-[#00A859] hover:text-white border border-[#E8E2D8] flex items-center justify-center transition-all shadow-2xs"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}

              {settings.socials.facebook && (
                <a 
                  href={settings.socials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#00A859] text-[#00A859] hover:text-white border border-[#E8E2D8] flex items-center justify-center transition-all shadow-2xs"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}

              {settings.socials.whatsapp && (
                <a 
                  href={settings.socials.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white border border-[#E8E2D8] flex items-center justify-center transition-all shadow-2xs"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}

              {settings.socials.locationMap && (
                <a 
                  href={settings.socials.locationMap} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white hover:bg-[#00A859] text-[#00A859] hover:text-white border border-[#E8E2D8] flex items-center justify-center transition-all shadow-2xs"
                  aria-label="Location Map"
                >
                  <MapPin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* QUICK LINKS (COL-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-['Cairo'] font-bold text-base text-[#00A859]">روابط سريعة</h4>
            <ul className="space-y-2 text-xs text-[#523621] font-semibold">
              <li><a href="#menu" className="hover:text-[#00A859] transition-colors">المنتجات</a></li>
              <li><a href="#coupon" className="hover:text-[#00A859] transition-colors">أكواد الخصم</a></li>
              <li><a href="#about" className="hover:text-[#00A859] transition-colors">عن كورتادو كافيه</a></li>
            </ul>
          </div>

          {/* LOCATION & CONTACT (COL-4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00A859]" />
              <h4 className="font-['Cairo'] font-bold text-base text-[#00A859]">فروعنا ومواقعنا</h4>
            </div>
            
            {settings.branches && settings.branches.length > 0 ? (
              <div className="divide-y divide-[#E8E2D8] text-xs">
                {settings.branches.map((branch) => (
                  <div 
                    key={branch.id} 
                    className="py-2.5 space-y-1 text-xs first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#2A2118] font-['Cairo']">
                        <span className="w-2 h-2 rounded-full bg-[#00A859]" />
                        <span>{branch.name}</span>
                        {branch.isMain && (
                          <span className="text-[10px] bg-[#E6F6ED] text-[#008A48] border border-[#00A859]/30 px-1.5 py-0.2 rounded-md font-bold">الرئيسي</span>
                        )}
                        {branch.phone && (
                          <a 
                            href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                            className="text-[#00A859] hover:text-[#008A48] hover:scale-110 transition-all cursor-pointer p-0.5"
                            title={`اتصال بـ ${branch.name}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-[#00A859]" />
                          </a>
                        )}
                      </div>
                      {branch.mapUrl && (
                        <a
                          href={branch.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] bg-[#FAF8F5] hover:bg-[#E6F6ED] text-[#008A48] border border-[#E8E2D8] hover:border-[#00A859] px-2 py-0.5 rounded-md font-bold transition-all flex items-center gap-1"
                        >
                          <span>الخريطة</span>
                          <MapPin className="w-2.5 h-2.5 text-[#00A859]" />
                        </a>
                      )}
                    </div>

                    <div className="text-[11px] text-[#523621] pr-3.5">
                      <span className="truncate block">{branch.address}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-[#523621] font-normal">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00A859] flex-shrink-0" />
                  <span>{settings.address}</span>
                </p>
                <a 
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 font-mono text-[#00A859] font-bold hover:underline cursor-pointer active:scale-95 transition-all"
                  dir="ltr"
                >
                  <Phone className="w-4 h-4 text-[#00A859] flex-shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </div>
            )}

            <p className="flex items-center gap-2 text-[11px] text-[#523621] pt-1 font-semibold">
              <Coffee className="w-3.5 h-3.5 text-[#00A859] flex-shrink-0" />
              <span>أوقات العمل: {settings.openingHours || 'يومياً: من 9:00 صباحاً حتى 02:00 منتصف الليل'}</span>
            </p>
          </div>

        </div>

        {/* COPYRIGHT & CREDITS */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#523621] gap-4 border-t border-[#E8E2D8]">
          <div className="order-1 md:order-1 text-center md:text-right leading-relaxed font-medium">
            <p>جميع الحقوق محفوظة</p>
            <p className="opacity-90">© 2026 {settings.siteTitle} (Cortado CAFÉ)</p>
          </div>

          <div className="order-2 md:order-3 flex items-center gap-1 text-center md:text-left">
            <span>صُنِع بكل</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>لعشاق القهوة</span>
          </div>

          {/* ADIX MEDIA LOGO (LAST ON MOBILE) */}
          <a
            href="https://wa.me/962779769501"
            target="_blank"
            rel="noopener noreferrer"
            className="order-3 md:order-2 flex items-center hover:opacity-90 transition-opacity group cursor-pointer"
            title="ADIX MEDIA"
          >
            <img 
              src={adixMediaLogo} 
              alt="ADIX MEDIA" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
            />
          </a>
        </div>

      </div>
    </footer>
  );
};
