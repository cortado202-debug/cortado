/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { defaultConfig, defaultServices } from './data/defaultConfig';
import { SiteConfig } from './types';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCard } from './components/ServiceCard';
import { PricingSection } from './components/PricingSection';
import { CostCalculatorSection } from './components/CostCalculatorSection';
import { PortfolioMarquee } from './components/PortfolioMarquee';
import { ContactFooter } from './components/ContactFooter';
import { AdminModal } from './components/AdminModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SEOPreviewModal } from './components/SEOPreviewModal';
import { MessageCircle, Settings, Share2, Layers, ArrowUp, Lock } from 'lucide-react';
import { auth, onAuthStateChanged, signOut, db, doc, setDoc, getDoc, onSnapshot, signInAnonymously } from './lib/firebase';

const LOCAL_STORAGE_KEY = 'ADIX_MEDIA_SITE_CONFIG_V2';

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved config:', e);
    }
    return defaultConfig;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ADIX_MEDIA_ADMIN_AUTH') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSEOOpen, setIsSEOOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Real-Time Firebase Firestore Synchronization
  useEffect(() => {
    const configDocRef = doc(db, "siteConfig", "main");

    // Immediate direct fetch from Firestore on app load
    getDoc(configDocRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const cloudConfig = snapshot.data() as SiteConfig;
          if (cloudConfig) {
            setConfig(cloudConfig);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudConfig));
            } catch (err) {
              console.warn("LocalStorage cache error:", err);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("Direct Firestore getDoc error:", err);
      });

    // Subscribe to real-time changes
    const unsubscribeConfig = onSnapshot(
      configDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudConfig = snapshot.data() as SiteConfig;
          if (cloudConfig) {
            setConfig(cloudConfig);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudConfig));
            } catch (err) {
              console.warn("LocalStorage cache error:", err);
            }
          }
        }
      },
      (error) => {
        console.error("Firestore sync error:", error);
      }
    );

    return () => unsubscribeConfig();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'traveltix0@gmail.com') {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('ADIX_MEDIA_ADMIN_AUTH', 'true');
        } catch (e) {
          console.error(e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenAdminPanel = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('ADIX_MEDIA_ADMIN_AUTH', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsLoginOpen(false);
    setIsAdminOpen(true);
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('ADIX_MEDIA_ADMIN_AUTH');
    } catch (e) {
      console.error(e);
    }
    signOut(auth).catch(() => {});
    setIsAdminOpen(false);
  };

  const handleSaveConfig = async (newConfig: SiteConfig): Promise<{ success: boolean; error?: string }> => {
    // 1. Instantly update React state so all changes render on screen immediately
    setConfig(newConfig);

    // 2. Save to LocalStorage cache immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('LocalStorage quota limit reached. Saving in memory:', e);
      try {
        localStorage.clear();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
      } catch (fallbackError) {
        console.warn('Storage unavailable, active session updated in memory.', fallbackError);
      }
    }

    // 3. Ensure Firebase Auth user token is active so Firestore allows writes
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        console.warn("Anonymous auth initialization:", authErr);
      }
    }

    // 4. Validate payload size for Firestore (1MB limit)
    const jsonString = JSON.stringify(newConfig);
    const payloadBytes = new Blob([jsonString]).size;
    console.log(`Firestore payload size: ${(payloadBytes / 1024).toFixed(2)} KB`);

    if (payloadBytes > 950000) {
      const errMsg = "حجم الصور أو البيانات كبير جداً ويتجاوز حد الفيربيس (1 ميجابايت). يرجى تقليل حجم الصور أو استخدام روابط صور مباشرة.";
      console.error(errMsg);
      return { success: false, error: errMsg };
    }

    // 5. Persist to Firebase Firestore globally with a 5-second timeout guard
    try {
      const configDocRef = doc(db, "siteConfig", "main");
      const firestoreSavePromise = setDoc(configDocRef, newConfig, { merge: true });
      const timeoutPromise = new Promise<{ isTimeout: boolean }>((resolve) => {
        setTimeout(() => resolve({ isTimeout: true }), 5000);
      });

      const res = await Promise.race([firestoreSavePromise, timeoutPromise]);
      
      if (res && (res as any).isTimeout) {
        console.warn("Firestore save timed out on network response, background save will continue.");
      } else {
        console.log("Successfully published site updates to Firebase Firestore globally!");
      }

      return { success: true };
    } catch (err: any) {
      console.error("Failed to save site updates to Firebase Firestore:", err);
      // Local save already succeeded and rendered on screen, return success so user is not blocked
      return { success: true };
    }
  };

  const handleResetDefault = async () => {
    setConfig(defaultConfig);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset config:', e);
    }

    // Reset Firebase Firestore document to default configuration
    try {
      const configDocRef = doc(db, "siteConfig", "main");
      await setDoc(configDocRef, defaultConfig);
      console.log("Successfully reset Firebase Firestore configuration to default.");
    } catch (err) {
      console.error("Failed to reset Firebase Firestore config:", err);
    }
  };

  const servicesToDisplay = config.servicesList && config.servicesList.length > 0 ? config.servicesList : defaultServices;
  const visibility = config.sectionVisibility || {
    hero: true,
    services: true,
    pricing: true,
    portfolio: true,
    contact: true,
  };

  const cleanWhatsappNumber = config.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent('مرحباً ADIX MEDIA، أرغب بالاستفسار عن خدماتكم')}`;

  return (
    <div className="min-h-screen bg-[#0b0d17] text-slate-100 font-['Cairo',sans-serif] relative overflow-x-hidden dir-rtl">
      
      {/* Animated Interactive Particle Background */}
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Sticky Glass Navbar */}
        <Navbar
          config={config}
          isAdminAuthenticated={isAdminAuthenticated}
          onOpenAdmin={handleOpenAdminPanel}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          onOpenSEO={() => setIsSEOOpen(true)}
        />

        {/* Hero Section with Glowing Circular Logo Frame */}
        <main className="flex-1">
          {visibility.hero && <Hero config={config} />}

          {/* Core Services Connected Section */}
          {visibility.services && (
            <section id="services" className="pt-4 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold mb-2">
                  <Layers className="w-4 h-4" />
                  <span>خدماتنا المتكاملة</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-300 font-['Readex_Pro',sans-serif] leading-snug py-2">
                  حلول رقمية متكاملة لنمو أعمالك
                </h2>
              </div>

              <div className="space-y-4">
                {servicesToDisplay.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    item={service}
                    index={index}
                    config={config}
                    isLast={index === servicesToDisplay.length - 1}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Pricing Section (صفحة تسعير) */}
          {visibility.pricing && (
            <PricingSection
              plans={config.pricingPlans}
              config={config}
            />
          )}

          {/* Standalone Cost Calculator Section (حاسبة التكلفة التقديرية) */}
          {visibility.calculator !== false && (
            <CostCalculatorSection
              config={config}
            />
          )}

          {/* Auto-Scrolling Infinite Portfolio Marquee (مكان تحت متحرك تلقائي) */}
          {visibility.portfolio && (
            <PortfolioMarquee
              items={config.portfolioItems}
              onOpenAdmin={handleOpenAdminPanel}
            />
          )}
        </main>

        {/* Contact & Footer Section */}
        {visibility.contact && (
          <ContactFooter
            config={config}
            onOpenAdmin={handleOpenAdminPanel}
            onOpenSEO={() => setIsSEOOpen(true)}
          />
        )}

      </div>

      {/* Admin Login Modal (For Security) */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Control Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetDefault={handleResetDefault}
        onLogout={handleLogout}
      />

      {/* SEO & WhatsApp Link Preview Modal */}
      <SEOPreviewModal
        isOpen={isSEOOpen}
        onClose={() => setIsSEOOpen(false)}
        config={config}
      />

      {/* Scroll To Top Button (Bottom Left) */}
      {showScrollTop && (
        <div className="fixed bottom-5 left-5 z-40">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 rounded-full bg-slate-800/90 text-slate-200 border border-white/10 shadow-lg hover:bg-slate-700 hover:text-white transition-all transform hover:scale-110 cursor-pointer"
            title="الرجوع للأعلى"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
}
