import React, { useState } from 'react';
import { SiteConfig, SocialLinks, PortfolioItem, PricingPlan, ServiceItem, SectionVisibility, CalculatorConfig } from '../types';
import { X, Save, RotateCcw, Plus, Trash2, Globe, Link, Phone, Mail, Upload, Eye, EyeOff, Image as ImageIcon, Lock, CheckCircle2, Sliders, Layers, LogOut, Calculator, Loader2, AlertCircle } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onSaveConfig: (newConfig: SiteConfig) => Promise<{ success: boolean; error?: string } | void> | void;
  onResetDefault: () => void;
  onLogout?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefault,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'visibility' | 'logo' | 'services' | 'pricing' | 'calculator' | 'portfolio' | 'contact'>('visibility');
  const [formData, setFormData] = useState<SiteConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper to normalize image URLs (Google Drive, Dropbox, ImgBB, HTML paste, etc.)
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    let cleaned = url.trim();

    // 1. If user pasted HTML embed code like <img src="..."> or <a href=...><img src="..."></a>, extract src
    if (cleaned.includes('<img') && cleaned.includes('src=')) {
      const srcMatch = cleaned.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        cleaned = srcMatch[1];
      }
    }

    if (cleaned.startsWith('http://')) {
      cleaned = cleaned.replace('http://', 'https://');
    }

    // 2. Google Drive
    if (cleaned.includes('drive.google.com/file/d/')) {
      const match = cleaned.match(/\/file\/d\/([^\/\?]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    if (cleaned.includes('drive.google.com/open?id=')) {
      const match = cleaned.match(/id=([^&]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }

    // 3. Dropbox
    if (cleaned.includes('dropbox.com') && cleaned.includes('dl=0')) {
      return cleaned.replace('dl=0', 'raw=1');
    }

    // 4. ImgBB page link (e.g. ibb.co/gbcRhQxw) -> map to direct image
    if (cleaned.includes('ibb.co/gbcRhQxw')) {
      return 'https://i.ibb.co/vCMjRfSm/ADIX2-1-11.png';
    }

    return cleaned;
  };

  // Helper to handle image file upload with efficient canvas compression preserving transparency
  const handleImageUpload = (file: File, onSuccess: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const rawUrl = e.target.result as string;
        const isSvg = file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg');

        // Small SVGs under 40KB pass directly
        if (isSvg && file.size < 40 * 1024) {
          onSuccess(rawUrl);
          return;
        }

        const isTransparentType = file.type.includes('png') || file.type.includes('webp') || isSvg || file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.webp');

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 320; // 320px is ideal for logos & thumbnails while keeping Base64 ~15KB
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              const outputFormat = isTransparentType ? 'image/png' : 'image/jpeg';
              let compressed = canvas.toDataURL(outputFormat, isTransparentType ? undefined : 0.80);
              
              // If Base64 is still larger than 100KB, downscale further to 220px to keep payload tiny
              if (compressed.length > 100000) {
                const tinyCanvas = document.createElement('canvas');
                tinyCanvas.width = 220;
                tinyCanvas.height = Math.round((height * 220) / width);
                const tCtx = tinyCanvas.getContext('2d');
                if (tCtx) {
                  tCtx.clearRect(0, 0, tinyCanvas.width, tinyCanvas.height);
                  tCtx.drawImage(img, 0, 0, tinyCanvas.width, tinyCanvas.height);
                  compressed = tinyCanvas.toDataURL(outputFormat, isTransparentType ? undefined : 0.75);
                }
              }

              onSuccess(compressed);
              return;
            }
          } catch (err) {
            console.warn('Canvas compression fallback:', err);
          }
          onSuccess(rawUrl);
        };
        img.onerror = () => onSuccess(rawUrl);
        img.src = rawUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  // Section Visibility toggle helper
  const toggleVisibility = (key: keyof SectionVisibility) => {
    setFormData((prev) => {
      const currentVis = prev.sectionVisibility || {
        hero: true,
        services: true,
        pricing: true,
        portfolio: true,
        contact: true,
      };

      return {
        ...prev,
        sectionVisibility: {
          ...currentVis,
          [key]: !currentVis[key],
        },
      };
    });
  };

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value,
      },
    }));
  };

  // Services Helpers
  const handleAddService = () => {
    const currentServices = formData.servicesList || [];
    const newService: ServiceItem = {
      id: `service-${Date.now()}`,
      title: 'خدمة جديدة',
      subtitle: 'وصف فرعي مختصر',
      description: 'أضف هنا تفاصيل هذه الخدمة والقيمة التي تقدمها لعملائك.',
      iconType: 'web',
      badge: 'جديد',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      whatsappMessage: 'مرحباً ADIX MEDIA، أرغب بالاستفسار عن هذه الخدمة',
    };

    setFormData((prev) => ({
      ...prev,
      servicesList: [...(prev.servicesList || []), newService],
    }));
  };

  const handleDeleteService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      servicesList: (prev.servicesList || []).filter((s) => s.id !== id),
    }));
  };

  const handleUpdateService = (id: string, field: keyof ServiceItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      servicesList: (prev.servicesList || []).map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  // Portfolio Helpers
  const handleAddPortfolio = () => {
    const newItem: PortfolioItem = {
      id: `p-${Date.now()}`,
      title: 'مشروع جديد',
      category: 'تصميم مواقع',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://wa.me/962779769501',
      clientName: 'عميل جديد',
      description: 'وصف مختصر عن المشروع والخدمات المقدمة.',
    };

    setFormData((prev) => ({
      ...prev,
      portfolioItems: [newItem, ...prev.portfolioItems],
    }));
  };

  const handleDeletePortfolio = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter((item) => item.id !== id),
    }));
  };

  const handleUpdatePortfolio = (id: string, field: keyof PortfolioItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      portfolioItems: prev.portfolioItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      const res = await onSaveConfig(formData);
      if (res && res.success === false) {
        setSaveError(res.error || 'حدث خطأ أثناء حفظ التعديلات على السيرفر.');
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'تعذر الاتصال بقاعدة البيانات.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentVisibility = formData.sectionVisibility || {
    hero: true,
    services: true,
    pricing: true,
    calculator: true,
    portfolio: true,
    contact: true,
  };

  const handleCalculatorChange = (field: keyof CalculatorConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      calculatorConfig: {
        title: prev.calculatorConfig?.title || 'حاسبة التكلفة التقديرية المخصصة',
        subtitle: prev.calculatorConfig?.subtitle || 'حدد الخدمات المطلوبة بدقة للحصول على إجمالي سعر فوري مع خيار الطلب المباشر',
        websitePrice: prev.calculatorConfig?.websitePrice ?? 280,
        websiteLabel: prev.calculatorConfig?.websiteLabel || 'تطوير موقع/متجر إلكتروني شامل',
        pricePerPost: prev.calculatorConfig?.pricePerPost ?? 12,
        postLabel: prev.calculatorConfig?.postLabel || 'عدد منشورات التواصل الاجتماعي الشهري:',
        minPosts: prev.calculatorConfig?.minPosts ?? 0,
        maxPosts: prev.calculatorConfig?.maxPosts ?? 30,
        reelsPrice: prev.calculatorConfig?.reelsPrice ?? 80,
        reelsLabel: prev.calculatorConfig?.reelsLabel || 'إنتاج ومونتاج فيديوهات ريلز / تيك توك',
        adsPrice: prev.calculatorConfig?.adsPrice ?? 90,
        adsLabel: prev.calculatorConfig?.adsLabel || 'إدارة ومتابعة حملات الإعلانات الممولة',
        resultLabel: prev.calculatorConfig?.resultLabel || 'التكلفة التقديرية الخاطفة',
        resultNote: prev.calculatorConfig?.resultNote || 'شاملة الخدمة والإعداد والاستشارة',
        whatsappButtonText: prev.calculatorConfig?.whatsappButtonText || 'إرسال هذا التقدير مباشرة للواتساب',
        ...prev.calculatorConfig,
        [field]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-[#11142b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#161938] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Readex_Pro',sans-serif]">
                لوحة تحكم الموقع وإدارة المحتوى
              </h2>
              <p className="text-[11px] text-slate-400">
                عدّل النصوص والأسعار والأقسام، وارفِع الصور واللوغو مباشرة من جهازك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold border border-rose-500/30 cursor-pointer"
                title="تسجيل الخروج وقفل لوحة التحكم"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-3 bg-[#0d0f22] border-b border-white/5 overflow-x-auto custom-tab-scrollbar scroll-smooth">
          
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'visibility'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>إظهار/إخفاء الأقسام</span>
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'logo'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>اللوغو والهوية</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'services'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الخدمات ({formData.servicesList?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'pricing'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <span>الباقات والأسعار ({formData.pricingPlans?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>حاسبة التكلفة</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'portfolio'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <span>معرض الأعمال ({formData.portfolioItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'contact'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <span>الهيرو والمعلومات</span>
          </button>

        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {savedSuccess && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>تم حفظ كافة التعديلات وتحديث الموقع فوراً!</span>
            </div>
          )}

          {/* TAB 1: SHOW/HIDE SECTIONS */}
          {activeTab === 'visibility' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs leading-relaxed">
                👁️ <strong>تحكّم كامل بظهور أقسام الموقع:</strong> يمكنك بنقرة واحدة إخفاء أو إظهار أي قسم من الصفحة الرئيسية دون حذفه.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Hero Section Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">قسم الواجهة الرئيسية (Hero)</h4>
                    <p className="text-[11px] text-slate-400">العنوان واللوغو الرئيسي وأزرار التواصل</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility('hero')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      currentVisibility.hero
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {currentVisibility.hero ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{currentVisibility.hero ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                </div>

                {/* Services Section Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">قسم الخدمات المتكاملة (Services)</h4>
                    <p className="text-[11px] text-slate-400">بطاقات المتاجر والصوشيال والإعلانات</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility('services')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      currentVisibility.services
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {currentVisibility.services ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{currentVisibility.services ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                </div>

                {/* Pricing Section Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">قسم الباقات والأسعار (Pricing)</h4>
                    <p className="text-[11px] text-slate-400">جدول الأسعار للباقات</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility('pricing')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      currentVisibility.pricing
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {currentVisibility.pricing ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{currentVisibility.pricing ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                </div>

                {/* Calculator Section Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">قسم حاسبة التكلفة التقديرية (Calculator)</h4>
                    <p className="text-[11px] text-slate-400">الحاسبة التفاعلية لحساب تكلفة الخدمات</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility('calculator')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      currentVisibility.calculator
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {currentVisibility.calculator ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{currentVisibility.calculator ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                </div>

                {/* Portfolio Section Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">قسم معرض الأعمال الشريطي (Portfolio)</h4>
                    <p className="text-[11px] text-slate-400">الشريط المتحرك التلقائي للمشاريع</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility('portfolio')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      currentVisibility.portfolio
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {currentVisibility.portfolio ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{currentVisibility.portfolio ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                </div>

                {/* Contact Section Toggle */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">قسم التواصل والمعلومات (Footer)</h4>
                    <p className="text-[11px] text-slate-400">بيانات الاتصال وخريطة الروابط السفلية</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility('contact')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      currentVisibility.contact
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {currentVisibility.contact ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{currentVisibility.contact ? 'ظاهر' : 'مخفي'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LOGO & BRANDING */}
          {activeTab === 'logo' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#161938] border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-pink-400">تغيير اللوغو وشعار الشركة</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يمكنك رفع صورة شعار شركتك مباشرة من هاتفك أو جهازك، أو إدخال رابط الصورة:
                </p>

                {/* File Upload Button for Logo */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.customLogoUrl && (
                    <div className="w-20 h-20 rounded-full border border-pink-500/50 p-1 bg-[#10142d] overflow-hidden shrink-0">
                      <img src={formData.customLogoUrl} alt="Logo preview" className="w-full h-full object-contain rounded-full bg-[#10142d]" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">رفع صورة شعار جديدة من جهازك:</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 cursor-pointer transition-all text-xs font-bold">
                      <Upload className="w-4 h-4" />
                      <span>اختر صورة اللوغو من الجهاز (PNG / JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (dataUrl) => {
                              setFormData({ ...formData, customLogoUrl: dataUrl });
                            });
                          }
                        }}
                      />
                    </label>

                    {formData.customLogoUrl && (
                      <button
                        onClick={() => setFormData({ ...formData, customLogoUrl: undefined })}
                        className="text-xs text-rose-400 hover:underline block pt-1"
                      >
                        إلغاء اللوغو المخصص والاستعادة للشعار المتجهي الافتراضي
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-slate-300">أو رابط الصورة المباشر (URL):</label>
                  <input
                    type="url"
                    value={formData.customLogoUrl || ''}
                    onChange={(e) => {
                      const normalized = normalizeImageUrl(e.target.value);
                      setFormData({ ...formData, customLogoUrl: normalized });
                    }}
                    onBlur={(e) => {
                      const normalized = normalizeImageUrl(e.target.value);
                      setFormData({ ...formData, customLogoUrl: normalized });
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 pt-0.5">
                    يمكنك لصق رابط صورة مباشر أو رابط مشاركة من Google Drive / Imgur / Postimages مباشرة.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">اسم الشركة الرسمي:</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES EDITING */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  تعديل كروت الخدمات وإضافة خدمات جديدة أو رفع صور مخصصة لها:
                </p>
                <button
                  onClick={handleAddService}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-pink-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة خدمة جديدة</span>
                </button>
              </div>

              <div className="space-y-5">
                {(formData.servicesList || []).map((service, idx) => (
                  <div key={service.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-pink-400">الخدمة #{idx + 1}: {service.title}</span>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="حذف الخدمة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold">عنوان الخدمة:</label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => handleUpdateService(service.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 font-semibold">العنوان الفرعي:</label>
                        <input
                          type="text"
                          value={service.subtitle}
                          onChange={(e) => handleUpdateService(service.id, 'subtitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-semibold">شرح الخدمة المفصل:</label>
                      <textarea
                        value={service.description}
                        onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-white"
                      />
                    </div>

                    {/* Image Upload for Service */}
                    <div className="space-y-2 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                      <label className="text-[11px] text-slate-300 font-semibold block">صورة الخدمة:</label>
                      <div className="flex flex-wrap items-center gap-3">
                        {service.imageUrl && (
                          <img src={service.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg border border-white/10" />
                        )}
                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-bold cursor-pointer hover:bg-pink-500/30">
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع صورة من الجهاز</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (dataUrl) => {
                                  handleUpdateService(service.id, 'imageUrl', dataUrl);
                                });
                              }
                            }}
                          />
                        </label>
                        <input
                          type="url"
                          value={service.imageUrl}
                          onChange={(e) => handleUpdateService(service.id, 'imageUrl', e.target.value)}
                          placeholder="أو ضع رابط الصورة هنا..."
                          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-slate-800 border border-white/5 text-xs text-white"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRICING PLANS */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h3 className="text-xs font-bold text-white">إدارة باقات الأسعار</h3>
                  <p className="text-[11px] text-slate-400">
                    يمكنك إضافة باقات جديدة (مثلاً باقة رابعة)، تعديل تفاصيل الباقات أو حذفها:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = (formData.pricingPlans?.length || 0) + 1;
                    const newPlan: PricingPlan = {
                      id: `plan-${Date.now()}`,
                      name: `باقة جديدة #${nextNum}`,
                      price: '$490',
                      duration: 'شهرياً',
                      badge: 'جديد 🔥',
                      description: 'وصف الباقة الجديدة ومواصفاتها الخاصة لتلبية احتياجاتك',
                      popular: false,
                      features: [
                        'تصميم منشورات حصرية احترافية',
                        'إدارة استراتيجية للمحتوى والحملات',
                        'تقارير أداء دورية ودعم مباشر'
                      ]
                    };
                    setFormData({
                      ...formData,
                      pricingPlans: [...(formData.pricingPlans || []), newPlan]
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة باقة جديدة</span>
                </button>
              </div>

              {formData.pricingPlans.map((plan, idx) => (
                <div key={plan.id || idx} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-400">الباقة #{idx + 1}: {plan.name}</span>
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!plan.popular}
                          onChange={(e) => {
                            const updated = [...formData.pricingPlans];
                            updated[idx].popular = e.target.checked;
                            setFormData({ ...formData, pricingPlans: updated });
                          }}
                          className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                        />
                        <span>تمييز كأكثر طلباً</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          if (formData.pricingPlans.length <= 1) {
                            alert('يجب الإبقاء على باقة واحدة على الأقل');
                            return;
                          }
                          const updated = formData.pricingPlans.filter((_, i) => i !== idx);
                          setFormData({ ...formData, pricingPlans: updated });
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="حذف الباقة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] text-slate-400 font-semibold">اسم الباقة:</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => {
                          const updated = [...formData.pricingPlans];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, pricingPlans: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-white/5"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] text-slate-400 font-semibold">السعر:</label>
                      <input
                        type="text"
                        value={plan.price}
                        onChange={(e) => {
                          const updated = [...formData.pricingPlans];
                          updated[idx].price = e.target.value;
                          setFormData({ ...formData, pricingPlans: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-white/5"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] text-slate-400 font-semibold">المدة (مثلاً شهرياً):</label>
                      <input
                        type="text"
                        value={plan.duration || 'شهرياً'}
                        onChange={(e) => {
                          const updated = [...formData.pricingPlans];
                          updated[idx].duration = e.target.value;
                          setFormData({ ...formData, pricingPlans: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-white/5"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] text-slate-400 font-semibold">الشارة المميزة:</label>
                      <input
                        type="text"
                        value={plan.badge || ''}
                        onChange={(e) => {
                          const updated = [...formData.pricingPlans];
                          updated[idx].badge = e.target.value;
                          setFormData({ ...formData, pricingPlans: updated });
                        }}
                        placeholder="مثال: الأكثر طلباً 🔥"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-white/5"
                      />
                    </div>
                  </div>

                  {/* Package Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-semibold block">وصف الباقة:</label>
                    <input
                      type="text"
                      value={plan.description || ''}
                      onChange={(e) => {
                        const updated = [...formData.pricingPlans];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, pricingPlans: updated });
                      }}
                      placeholder="وصف مختصر عن الهدف من هذه الباقة..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-white/5"
                    />
                  </div>

                  {/* Package Features List */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400 font-semibold block">مميزات الباقة (أدخل كل ميزة في سطر مستقل):</label>
                      <span className="text-[10px] text-pink-400 font-medium">({plan.features?.length || 0} ميزة)</span>
                    </div>
                    <textarea
                      rows={4}
                      value={(plan.features || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        const updated = [...formData.pricingPlans];
                        updated[idx].features = lines;
                        setFormData({ ...formData, pricingPlans: updated });
                      }}
                      placeholder={`تصميم 8 منشورات احترافية شهرياً\nإدارة منصتين للتواصل الاجتماعي\nكتابة محتوى إبداعي وجذاب`}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 text-xs text-white border border-white/5 font-sans leading-relaxed focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: PORTFOLIO ITEMS */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  إدارة العناصر التي تظهر في الشريط المتحرك التلقائي أسفل الموقع:
                </p>
                <button
                  onClick={handleAddPortfolio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عمل جديد</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400">عنصر: {item.title}</span>
                      <button
                        onClick={() => handleDeletePortfolio(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdatePortfolio(item.id, 'title', e.target.value)}
                        placeholder="عنوان العمل"
                        className="px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-white"
                      />

                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleUpdatePortfolio(item.id, 'category', e.target.value)}
                        placeholder="التصنيف (مثلاً: تصميم متجر)"
                        className="px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-white"
                      />
                    </div>

                    {/* Image Upload for Portfolio Item */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                      <label className="text-[11px] text-slate-300 font-semibold block">صورة المشروع:</label>
                      <div className="flex flex-wrap items-center gap-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg border border-white/10" />
                        )}
                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-bold cursor-pointer hover:bg-pink-500/30">
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع صورة من الجهاز</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (dataUrl) => {
                                  handleUpdatePortfolio(item.id, 'imageUrl', dataUrl);
                                });
                              }
                            }}
                          />
                        </label>
                        <input
                          type="url"
                          value={item.imageUrl}
                          onChange={(e) => handleUpdatePortfolio(item.id, 'imageUrl', e.target.value)}
                          placeholder="رابط الصورة..."
                          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-slate-800 border border-white/5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <input
                      type="url"
                      value={item.linkUrl}
                      onChange={(e) => handleUpdatePortfolio(item.id, 'linkUrl', e.target.value)}
                      placeholder="الرابط الخارجي الموجه عند النقر"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/5 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CALCULATOR CONFIGURATION */}
          {activeTab === 'calculator' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs leading-relaxed flex items-center gap-2">
                <Calculator className="w-5 h-5 shrink-0 text-pink-400" />
                <span>إعدادات حاسبة التكلفة التقديرية: يمكنك هنا تعديل أسعار الخدمات، التسميات، وحدود عدد المنشورات ليتغير حساب التكلفة فوراً في الصفحة الرئيسية.</span>
              </div>

              {/* Title & Subtitle */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-pink-400">عناوين قسم الحاسبة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">عنوان الحاسبة الرئيسي</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.title ?? 'حاسبة التكلفة التقديرية المخصصة'}
                      onChange={(e) => handleCalculatorChange('title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">الوصف التوضيحي للقسم</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.subtitle ?? 'حدد الخدمات المطلوبة بدقة للحصول على إجمالي سعر فوري مع خيار الطلب المباشر'}
                      onChange={(e) => handleCalculatorChange('subtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Service Prices & Labels */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-pink-400">أسعار وخيارات الخدمات:</h4>

                {/* Website Service */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/5 items-center">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">خيار تطوير الموقع/المتجر</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.websiteLabel ?? 'تطوير موقع/متجر إلكتروني شامل'}
                      onChange={(e) => handleCalculatorChange('websiteLabel', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">السعر الإضافي ($)</label>
                    <input
                      type="number"
                      value={formData.calculatorConfig?.websitePrice ?? 280}
                      onChange={(e) => handleCalculatorChange('websitePrice', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-pink-400 font-bold"
                    />
                  </div>
                </div>

                {/* Posts Service */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/5 items-center">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">تسمية منشورات التواصل الاجتماعية</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.postLabel ?? 'عدد منشورات التواصل الاجتماعي الشهري:'}
                      onChange={(e) => handleCalculatorChange('postLabel', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">سعر المنشور الواحد ($)</label>
                    <input
                      type="number"
                      value={formData.calculatorConfig?.pricePerPost ?? 12}
                      onChange={(e) => handleCalculatorChange('pricePerPost', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-pink-400 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">أقل منشور</label>
                      <input
                        type="number"
                        value={formData.calculatorConfig?.minPosts ?? 0}
                        onChange={(e) => handleCalculatorChange('minPosts', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">أقصى منشور</label>
                      <input
                        type="number"
                        value={formData.calculatorConfig?.maxPosts ?? 30}
                        onChange={(e) => handleCalculatorChange('maxPosts', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Reels Video Service */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/5 items-center">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">خيار فيديوهات الريلز / تيك توك</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.reelsLabel ?? 'إنتاج ومونتاج فيديوهات ريلز / تيك توك'}
                      onChange={(e) => handleCalculatorChange('reelsLabel', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">السعر الإضافي ($)</label>
                    <input
                      type="number"
                      value={formData.calculatorConfig?.reelsPrice ?? 80}
                      onChange={(e) => handleCalculatorChange('reelsPrice', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-pink-400 font-bold"
                    />
                  </div>
                </div>

                {/* Ads Service */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/5 items-center">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">خيار إدارة الحملات الإعلانية الممولة</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.adsLabel ?? 'إدارة ومتابعة حملات الإعلانات الممولة'}
                      onChange={(e) => handleCalculatorChange('adsLabel', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">السعر الإضافي ($)</label>
                    <input
                      type="number"
                      value={formData.calculatorConfig?.adsPrice ?? 90}
                      onChange={(e) => handleCalculatorChange('adsPrice', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-pink-400 font-bold"
                    />
                  </div>
                </div>

              </div>

              {/* Output & WhatsApp text */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-pink-400">نصوص النتيجة والطلب:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">تسمية نتيجة السعر</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.resultLabel ?? 'التكلفة التقديرية الخاطفة'}
                      onChange={(e) => handleCalculatorChange('resultLabel', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">الملاحظة تحت السعر</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.resultNote ?? 'شاملة الخدمة والإعداد والاستشارة'}
                      onChange={(e) => handleCalculatorChange('resultNote', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">نص زر الطلب عبر الواتساب</label>
                    <input
                      type="text"
                      value={formData.calculatorConfig?.whatsappButtonText ?? 'إرسال هذا التقدير مباشرة للواتساب'}
                      onChange={(e) => handleCalculatorChange('whatsappButtonText', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: HERO & CONTACT DETAILS */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  العنوان الرئيسي (Hero Title)
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  الوصف الفرعي (Hero Subtitle)
                </label>
                <textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-300">
                  رقم الواتساب الرئيسي
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+962779769501"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  البريد الإلكتروني للشركة
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  العنوان / الموقع
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-pink-400">روابط مواقع التواصل الاجتماعي:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(formData.socialLinks).map((key) => {
                    const linkKey = key as keyof SocialLinks;
                    return (
                      <div key={key} className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-400 capitalize">
                          رابط {key}
                        </label>
                        <input
                          type="url"
                          value={formData.socialLinks[linkKey] || ''}
                          onChange={(e) => handleSocialChange(linkKey, e.target.value)}
                          placeholder={`https://${key}.com/...`}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-100 text-xs focus:border-pink-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex flex-col gap-2 px-6 py-4 bg-[#161938] border-t border-white/10">
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('هل أنت تأكد من إعادة ضبط كل الإعدادات للافتراضية؟')) {
                  onResetDefault();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>إعادة للضبط الافتراضي</span>
            </button>

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-bold animate-pulse hidden sm:inline">
                  تم الحفظ والنشر لجميع الزوار بنجاح! ✓
                </span>
              )}

              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                إلغاء
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-60 ${
                  savedSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30 scale-105'
                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-pink-500/20'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>جاري الحفظ والنشر...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    <span>تم الحفظ والنشر ✓</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات للجميع</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
