import React, { useState } from 'react';
import { MessageCircle, Settings, Menu, X, LogIn, LogOut } from 'lucide-react';
import { SiteConfig } from '../types';
import { normalizeImageUrl } from './Logo';

interface NavbarProps {
  config: SiteConfig;
  isAdminAuthenticated: boolean;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSEO: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  isAdminAuthenticated,
  onOpenAdmin,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent('مرحباً ADIX MEDIA، أرغب بالاستفسار عن خدماتكم')}`;

  const visibility = config.sectionVisibility || {
    hero: true,
    services: true,
    pricing: true,
    calculator: true,
    portfolio: true,
    contact: true,
  };

  const navLinks = [
    { name: 'الرئيسية', href: '#hero', show: visibility.hero !== false },
    { name: 'خدماتنا', href: '#services', show: visibility.services !== false },
    { name: 'الباقات والأسعار', href: '#pricing', show: visibility.pricing !== false },
    { name: 'حاسبة التكلفة', href: '#calculator', show: visibility.calculator !== false },
    { name: 'سجل أعمالنا', href: '#portfolio', show: visibility.portfolio !== false },
    { name: 'تواصل معنا', href: '#contact', show: visibility.contact !== false },
  ].filter((link) => link.show);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/25 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Header Brand Link - Custom Logo + Flowing Animated Tech Gradient Title with Mokoto-style Tech Font */}
          <a href="#hero" className="flex items-center gap-2.5 group select-none shrink-0">
            {config.customLogoUrl && (
              <img
                src={normalizeImageUrl(config.customLogoUrl)}
                alt={config.companyName}
                className="h-9 sm:h-10 w-auto object-contain max-w-[130px] drop-shadow-[0_0_10px_rgba(236,72,153,0.3)] transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-base sm:text-lg font-extrabold uppercase tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 via-indigo-500 to-pink-500 animate-gradient-text font-['Oxanium','Chakra_Petch','Orbitron',sans-serif] drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]">
              {config.companyName}
            </span>
          </a>

          {/* Desktop Navigation - Smaller, clean typography */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 px-2 py-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-semibold text-slate-300 hover:text-pink-400 transition-colors hover:scale-105 transform duration-200 whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons - Compact Icon Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Conditional Auth Buttons */}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdmin}
                  title="لوحة التحكم"
                  aria-label="لوحة التحكم"
                  className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-110 cursor-pointer border border-pink-400/40 relative flex items-center justify-center"
                >
                  <Settings className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
                </button>
                <button
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  aria-label="تسجيل الخروج"
                  className="p-2.5 rounded-full bg-slate-800/80 text-rose-400 hover:text-rose-300 hover:bg-slate-700 transition-colors cursor-pointer border border-white/10 flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                title="تسجيل الدخول للإدارة"
                aria-label="تسجيل الدخول للإدارة"
                className="p-2.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 transition-all hover:scale-110 cursor-pointer flex items-center justify-center"
              >
                <LogIn className="w-4 h-4 text-pink-400" />
              </button>
            )}

            {/* WhatsApp Quick Direct Button - Icon Only */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="تواصل عبر الواتساب"
              aria-label="تواصل عبر الواتساب"
              className="p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-110 cursor-pointer border border-emerald-400/30 flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </a>
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            {isAdminAuthenticated ? (
              <button
                onClick={onOpenAdmin}
                title="لوحة التحكم"
                className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 border border-pink-400/30 flex items-center justify-center"
              >
                <Settings className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                title="تسجيل الدخول"
                className="p-2 rounded-full bg-slate-800 text-slate-200 border border-white/10 flex items-center justify-center"
              >
                <LogIn className="w-3.5 h-3.5 text-pink-400" />
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="تواصل عبر الواتساب"
              className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-200 border border-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0e1124]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-slate-200 hover:bg-pink-500/10 hover:text-pink-400 font-medium text-sm"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-2 flex flex-col gap-2">
            {!isAdminAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-white/10"
              >
                <LogIn className="w-4 h-4 text-pink-400" />
                <span>تسجيل الدخول للإدارة</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تواصل عبر الواتساب</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
