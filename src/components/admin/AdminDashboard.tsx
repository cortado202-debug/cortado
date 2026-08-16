import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Product, PromoCode, OrderStatus, CategoryId, BranchLocation, PaymentMethod, QuickLinkItem } from '../../types';
import { DEFAULT_QUICK_LINKS } from '../../data/initialData';
import { 
  X, 
  LayoutDashboard, 
  Settings, 
  Coffee, 
  ShoppingBag, 
  Users, 
  User, 
  Ticket, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Info,
  Image as ImageIcon,
  Save,
  Globe,
  Sparkles,
  Copy,
  Flame,
  Sun,
  Moon,
  MapPin,
  Building2,
  Upload,
  UploadCloud,
  RefreshCw,
  FileUp,
  FolderPlus,
  Layers,
  Download,
  FileSpreadsheet,
  Truck,
  Wallet,
  CreditCard,
  Zap,
  Volume2,
  Bell,
  Store,
  Ban,
  Music,
  Check,
  Eye,
  EyeOff,
  Link as LinkIcon,
  FileText,
  ShieldCheck,
  Lock
} from 'lucide-react';

import { playOrderAlertSound, SOUND_TONES, getSelectedSoundTone, setSelectedSoundTone } from '../../lib/sound';
import { CategoryModal } from './CategoryModal';
import { BulkPromoModal } from './BulkPromoModal';
import { PromoCardGeneratorModal } from './PromoCardGeneratorModal';
import { mergePromoCodes, pushPromoCodesToCloud, syncAllPromoCodesAcrossCloud } from '../../lib/firestoreSync';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminModalOpen, 
    toggleAdminModal, 
    activeAdminTab, 
    setActiveAdminTab,
    orders,
    updateOrderStatus,
    categories,
    products,
    addProduct,
    addProductsBulk,
    updateProduct,
    deleteProduct,
    resetToInitialData,
    customers,
    promoCodes,
    addPromoCode,
    addPromoCodesBulk,
    burnPromoCode,
    deletePromoCode,
    settings,
    updateSettings,
    userSession,
    setUserSession
  } = useStore();

  const [gateEmail, setGateEmail] = useState('cortado202@gmail.com');
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBulkPromoModal, setShowBulkPromoModal] = useState(false);
  const [showPromoCardModal, setShowPromoCardModal] = useState(false);
  const [showImportPromoModal, setShowImportPromoModal] = useState(false);
  const [isSyncingPromos, setIsSyncingPromos] = useState(false);
  const [importPromoText, setImportPromoText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSoundSelectorModal, setShowSoundSelectorModal] = useState(false);
  const [currentSoundTone, setCurrentSoundTone] = useState(() => getSelectedSoundTone());

  // Admin Theme & Copy State
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('light');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [customerSubTab, setCustomerSubTab] = useState<'registered' | 'guests'>('registered');
  const [promoSortOrder, setPromoSortOrder] = useState<'newest' | 'oldest' | 'discount' | 'code'>('newest');

  const getPromoTimestamp = (p: PromoCode): number => {
    if (p.createdAt) {
      const t = new Date(p.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (p.id) {
      const match = p.id.match(/(\d{10,13})/);
      if (match) {
        const t = parseInt(match[1], 10);
        if (!isNaN(t) && t > 0) return t;
      }
    }
    return 0;
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  // Settings local state
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle);
  const [siteSubtitle, setSiteSubtitle] = useState(settings.siteSubtitle);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [openingHours, setOpeningHours] = useState(settings.openingHours || 'يومياً: من 9:00 صباحاً حتى 02:00 منتصف الليل');
  const [branchesList, setBranchesList] = useState<BranchLocation[]>(
    settings.branches && settings.branches.length > 0
      ? settings.branches
      : [
          {
            id: 'b-1',
            name: 'فرع حماة الرئيسية',
            address: settings.address || 'سوريا - حماة - الشريعة',
            phone: settings.phone || '+963 33 123 4567',
            isMain: true
          }
        ]
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.deliveryFee ?? 15);
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethod[]>(
    settings.paymentMethods && settings.paymentMethods.length > 0
      ? settings.paymentMethods
      : [
          {
            id: 'pm-1',
            name: 'شام كاش (Sham Cash)',
            details: 'رقم الحساب: 0912345678 — باسم كافيه كورتادو',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
            isActive: true
          },
          {
            id: 'pm-2',
            name: 'سيريتل كاش (Syriatel Cash)',
            details: 'رمز الدفع أو الرقم: 0933123456 — كورتادو كافيه',
            imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=200&q=80',
            isActive: true
          },
          {
            id: 'pm-3',
            name: 'الدفع عند الاستلام / في الصالة',
            details: 'دفع نقدي مباشر عند استلام الطلب أو عند الطاولة',
            imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80',
            isActive: true
          }
        ]
  );
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [quickLinksList, setQuickLinksList] = useState<QuickLinkItem[]>(
    settings.quickLinks && settings.quickLinks.length > 0
      ? settings.quickLinks
      : DEFAULT_QUICK_LINKS
  );
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLinkItem | null>(null);
  const [quickLinkSavedMsg, setQuickLinkSavedMsg] = useState(false);
  const [instagram, setInstagram] = useState(settings.socials.instagram);
  const [facebook, setFacebook] = useState(settings.socials.facebook);
  const [whatsapp, setWhatsapp] = useState(settings.socials.whatsapp);
  const [locationMap, setLocationMap] = useState(settings.socials.locationMap);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [justSavedSettings, setJustSavedSettings] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // Sync settings state whenever settings in store change or when admin modal opens
  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.siteTitle || '');
      setSiteSubtitle(settings.siteSubtitle || '');
      setLogoUrl(settings.logoUrl || '');
      setPhone(settings.phone || '');
      setAddress(settings.address || '');
      setOpeningHours(settings.openingHours || 'يومياً: من 9:00 صباحاً حتى 02:00 منتصف الليل');
      if (settings.branches && settings.branches.length > 0) {
        setBranchesList(settings.branches);
      }
      setDeliveryFee(settings.deliveryFee ?? 15);
      if (settings.paymentMethods && settings.paymentMethods.length > 0) {
        setPaymentMethodsList(settings.paymentMethods);
      }
      setAdminEmail(settings.adminEmail || 'cortado202@gmail.com');
      if (settings.socials) {
        setInstagram(settings.socials.instagram || '');
        setFacebook(settings.socials.facebook || '');
        setWhatsapp(settings.socials.whatsapp || '');
        setLocationMap(settings.socials.locationMap || '');
      }
      if (settings.quickLinks && settings.quickLinks.length > 0) {
        setQuickLinksList(settings.quickLinks);
      } else {
        setQuickLinksList(DEFAULT_QUICK_LINKS);
      }
    }
  }, [settings, isAdminModalOpen]);

  const handleToggleQuickLinkHidden = (id: string) => {
    const updated = quickLinksList.map((item) =>
      item.id === id ? { ...item, isHidden: !item.isHidden } : item
    );
    setQuickLinksList(updated);
    updateSettings({ quickLinks: updated });
    setQuickLinkSavedMsg(true);
    setTimeout(() => setQuickLinkSavedMsg(false), 2500);
  };

  const handleSaveQuickLinkModal = () => {
    if (!editingQuickLink) return;
    const exists = quickLinksList.some(item => item.id === editingQuickLink.id);
    let updated: QuickLinkItem[];
    if (exists) {
      updated = quickLinksList.map(item => item.id === editingQuickLink.id ? editingQuickLink : item);
    } else {
      updated = [...quickLinksList, editingQuickLink];
    }
    setQuickLinksList(updated);
    updateSettings({ quickLinks: updated });
    setEditingQuickLink(null);
    setQuickLinkSavedMsg(true);
    setTimeout(() => setQuickLinkSavedMsg(false), 2500);
  };

  const handleDeleteQuickLink = (id: string) => {
    if (window.confirm('هل أنت تأكد من حذف هذا الرابط السريع؟')) {
      const updated = quickLinksList.filter(item => item.id !== id);
      setQuickLinksList(updated);
      updateSettings({ quickLinks: updated });
      setQuickLinkSavedMsg(true);
      setTimeout(() => setQuickLinkSavedMsg(false), 2500);
    }
  };

  const handleAddNewQuickLink = () => {
    const newId = `custom-page-${Date.now()}`;
    setEditingQuickLink({
      id: newId,
      titleAr: 'صفحة تعريفية جديدة',
      badge: 'معلومات',
      isHidden: false,
      contentAr: 'أدخل تفاصيل ومحتوى الصفحة هنا...'
    });
  };

  const handleAddPaymentMethod = () => {
    const newPm: PaymentMethod = {
      id: `pm-${Date.now()}`,
      name: 'طريقة دفع جديدة',
      details: 'رقم الحساب: 09XXXXXXXX — باسم الحساب',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      isActive: true
    };
    setPaymentMethodsList([...paymentMethodsList, newPm]);
  };

  const handleUpdatePaymentMethod = (id: string, field: keyof PaymentMethod, value: any) => {
    setPaymentMethodsList(prev =>
      prev.map(pm => (pm.id === id ? { ...pm, [field]: value } : pm))
    );
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethodsList(prev => prev.filter(pm => pm.id !== id));
  };

  const handleAddBranch = () => {
    const newBranch: BranchLocation = {
      id: `branch-${Date.now()}`,
      name: `فرع ${branchesList.length + 1}`,
      address: '',
      phone: phone || '',
      isMain: branchesList.length === 0
    };
    setBranchesList([...branchesList, newBranch]);
  };

  const handleUpdateBranch = (id: string, field: keyof BranchLocation, value: any) => {
    setBranchesList(branchesList.map(b => {
      if (b.id === id) {
        return { ...b, [field]: value };
      }
      if (field === 'isMain' && value === true) {
        return { ...b, isMain: false };
      }
      return b;
    }));
  };

  const handleDeleteBranch = (id: string) => {
    if (branchesList.length <= 1) {
      alert('يجب الإبقاء على موقع/فرع واحد على الأقل في الإعدادات.');
      return;
    }
    setBranchesList(branchesList.filter(b => b.id !== id));
  };

  // New Product Modal local state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodCat, setProdCat] = useState<CategoryId>('cold');
  const [prodPrice, setProdPrice] = useState(25);
  const [prodDesc, setProdDesc] = useState('');
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodCupColor, setProdCupColor] = useState('#321D12');
  const [prodSizes, setProdSizes] = useState<Array<{ name: string; price: number }>>([]);
  const [showPresetGallery, setShowPresetGallery] = useState(false);

  // Bulk Product Upload State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkItems, setBulkItems] = useState<Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    categoryId: CategoryId;
    price: number;
    imageUrl: string;
  }>>([]);
  const [defaultBulkCategory, setDefaultBulkCategory] = useState<CategoryId>('cold');
  const [defaultBulkPrice, setDefaultBulkPrice] = useState<number>(24);

  // Preset Stock Coffee Images
  const PRESET_STOCK_IMAGES = [
    { nameAr: 'سبانيش لاتيه بارد', nameEn: 'Iced Spanish Latte', categoryId: 'cold' as CategoryId, price: 24, url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'آيس كورتادو بيري', nameEn: 'Iced Cortado Berry', categoryId: 'cold' as CategoryId, price: 26, url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'كولد برو كورتادو', nameEn: 'Cortado Cold Brew', categoryId: 'cold' as CategoryId, price: 22, url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'آيس كراميل ماكياتو', nameEn: 'Iced Caramel Macchiato', categoryId: 'cold' as CategoryId, price: 25, url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'آيس ماتشا لاتيه', nameEn: 'Iced Matcha Latte', categoryId: 'cold' as CategoryId, price: 27, url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'آيس موكا داكنة', nameEn: 'Iced Dark Mocha', categoryId: 'cold' as CategoryId, price: 26, url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'كورتادو كلاسيك', nameEn: 'Classic Cortado', categoryId: 'hot' as CategoryId, price: 18, url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'فلات وايت أرت', nameEn: 'Flat White Art', categoryId: 'hot' as CategoryId, price: 20, url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'لاتيه الهيل والزعفران', nameEn: 'Cardamom Saffron Latte', categoryId: 'hot' as CategoryId, price: 24, url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'كابوتشينو كورتادو', nameEn: 'Gold Cappuccino', categoryId: 'hot' as CategoryId, price: 22, url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'أمريكانو قهوة مختصة', nameEn: 'Specialty Americano', categoryId: 'hot' as CategoryId, price: 16, url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'تيراميسو كورتادو', nameEn: 'Cortado Tiramisu', categoryId: 'desserts' as CategoryId, price: 28, url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'تشيز كيك سان سيباستيان', nameEn: 'San Sebastian Cheesecake', categoryId: 'desserts' as CategoryId, price: 32, url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'كرواسون اللوز', nameEn: 'Almond Croissant', categoryId: 'desserts' as CategoryId, price: 19, url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80' },
    { nameAr: 'خلطة كورتادو الملكية', nameEn: 'Royal Cortado Signature', categoryId: 'special' as CategoryId, price: 35, url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProdImageUrl(dataUrl);

      // Auto-extract name if empty
      if (!prodNameAr.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setProdNameAr(cleanName);
        if (!prodNameEn.trim()) setProdNameEn(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBulkFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

        setBulkItems((prev) => [
          ...prev,
          {
            id: `bulk-${Date.now()}-${idx}-${Math.random()}`,
            nameAr: cleanName,
            nameEn: cleanName,
            categoryId: defaultBulkCategory,
            price: defaultBulkPrice,
            imageUrl: dataUrl
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveBulkProducts = () => {
    if (bulkItems.length === 0) return;
    setIsSavingBulk(true);

    setTimeout(() => {
      addProductsBulk(
        bulkItems.map(item => ({
          categoryId: item.categoryId,
          nameAr: item.nameAr || 'منتج كورتادو',
          nameEn: item.nameEn || 'Cortado Product',
          price: Number(item.price) || 24,
          descriptionAr: 'صنف فاخر محضّر من أجود المكونات في كافيه كورتادو.',
          ingredients: ['إسبريسو مختص', 'حليب طازج'],
          imageUrl: item.imageUrl,
          cupColor: '#321D12'
        }))
      );

      setBulkItems([]);
      setIsSavingBulk(false);
      setShowBulkModal(false);
    }, 400);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Product management filtering
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');

  // New Promo Code local state
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [codeStr, setCodeStr] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountVal, setDiscountVal] = useState(20);
  const [maxUses, setMaxUses] = useState(50);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  if (!isAdminModalOpen) return null;

  const isStrictAdmin = Boolean(
    userSession && 
    userSession.isAdmin === true && 
    userSession.email && 
    (userSession.email.toLowerCase() === 'cortado202@gmail.com' || userSession.email.toLowerCase() === settings.adminEmail.toLowerCase())
  );

  if (!isStrictAdmin) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-['Cairo'] text-right">
        <div className="bg-[#181513] border border-[#00A859]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00A859]/20 border border-[#00A859]/40 flex items-center justify-center text-[#00A859]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">تسجيل دخول مدير النظام</h3>
                <p className="text-xs text-slate-400">يرجى إدخال بيانات الاعتماد للوصول إلى لوحة التحكم</p>
              </div>
            </div>
            <button
              onClick={() => toggleAdminModal(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {gateError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setGateError('');
              const cleanE = gateEmail.trim().toLowerCase();
              const isPassValid = gatePassword === 'Amd123456@123' || gatePassword === 'Amd1234@123';
              if ((cleanE === 'cortado202@gmail.com' || cleanE === settings.adminEmail.toLowerCase()) && isPassValid) {
                setUserSession({
                  uid: 'admin-cortado-master',
                  name: 'مدير النظام (Cortado Admin)',
                  email: 'cortado202@gmail.com',
                  isAdmin: true
                });
                setGatePassword('');
              } else {
                setGateError('كلمة المرور أو البريد الإلكتروني غير صحيح! مسموح فقط لمدير النظام مع كلمة المرور المعينة (Amd123456@123).');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني للمدير</label>
              <input
                type="email"
                value={gateEmail}
                onChange={(e) => setGateEmail(e.target.value)}
                placeholder="cortado202@gmail.com"
                className="w-full bg-[#2D2926] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono dir-ltr text-right outline-none focus:border-[#00A859]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور السرية</label>
              <input
                type="password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#2D2926] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono text-right outline-none focus:border-[#00A859]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00A859] hover:bg-[#008F4C] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>دخول لوحة التحكم</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Overview metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalCustomers = customers.length;
  const activePromosCount = promoCodes.filter(p => p.isActive).length;

  const handleToggleStoreStatus = () => {
    const newStatus = settings.isStoreOpen === false ? true : false;
    const newSettingsObj = {
      ...settings,
      isStoreOpen: newStatus
    };
    updateSettings(newSettingsObj);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    const updatedSettingsData = {
      siteTitle,
      siteSubtitle,
      logoUrl,
      phone,
      address,
      openingHours,
      isStoreOpen: settings.isStoreOpen,
      branches: branchesList,
      adminEmail,
      deliveryFee: Number(deliveryFee) || 0,
      paymentMethods: paymentMethodsList,
      quickLinks: quickLinksList,
      socials: {
        instagram,
        facebook,
        whatsapp,
        locationMap
      }
    };

    updateSettings(updatedSettingsData);

    setTimeout(() => {
      setIsSavingSettings(false);
      setJustSavedSettings(true);
      setSettingsSavedMsg(true);

      setTimeout(() => {
        setJustSavedSettings(false);
      }, 2500);

      setTimeout(() => {
        setSettingsSavedMsg(false);
      }, 4500);
    }, 300);
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdNameAr('');
    setProdNameEn('');
    setProdCat('cold');
    setProdPrice(70);
    setProdDesc('');
    setProdIngredients('إسبريسو مختص, حليب طازج');
    setProdImageUrl('https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80');
    setProdCupColor('#321D12');
    setProdSizes([
      { name: 'عادي', price: 70 },
      { name: 'دبل', price: 100 }
    ]);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdNameAr(prod.nameAr);
    setProdNameEn(prod.nameEn);
    setProdCat(prod.categoryId);
    setProdPrice(prod.price >= 1000 ? Math.round(prod.price / 100) : prod.price);
    setProdDesc(prod.descriptionAr);
    setProdIngredients(prod.ingredients.join(', '));
    setProdImageUrl(prod.imageUrl);
    setProdCupColor(prod.cupColor || '#321D12');
    if (prod.sizes && prod.sizes.length > 0) {
      setProdSizes(prod.sizes.map(s => ({ name: s.name, price: s.price >= 1000 ? Math.round(s.price / 100) : s.price })));
    } else {
      const p = prod.price >= 1000 ? Math.round(prod.price / 100) : (prod.price || 70);
      setProdSizes([
        { name: 'عادي', price: p },
        { name: 'دبل', price: Math.round(p * 1.4) }
      ]);
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    const ingArray = prodIngredients.split(',').map(s => s.trim()).filter(Boolean);

    const formattedSizes = prodSizes
      .filter(s => s.name.trim())
      .map((s, idx) => ({ id: `sz-${idx}-${Date.now()}`, name: s.name.trim(), price: Number(s.price) || 0 }));

    const basePrice = formattedSizes.length > 0 ? formattedSizes[0].price : Number(prodPrice);

    setTimeout(() => {
      if (editingProductId) {
        updateProduct({
          id: editingProductId,
          categoryId: prodCat,
          nameAr: prodNameAr,
          nameEn: prodNameEn,
          price: basePrice,
          descriptionAr: prodDesc,
          ingredients: ingArray,
          imageUrl: prodImageUrl,
          cupColor: prodCupColor,
          sizes: formattedSizes.length > 0 ? formattedSizes : undefined
        });
      } else {
        addProduct({
          categoryId: prodCat,
          nameAr: prodNameAr,
          nameEn: prodNameEn,
          price: basePrice,
          descriptionAr: prodDesc,
          ingredients: ingArray,
          imageUrl: prodImageUrl,
          cupColor: prodCupColor,
          sizes: formattedSizes.length > 0 ? formattedSizes : undefined
        });
      }
      setIsSavingProduct(false);
      setShowProductModal(false);
    }, 350);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeStr.trim()) return;
    setIsSavingPromo(true);

    setTimeout(() => {
      addPromoCode({
        code: codeStr.toUpperCase().trim(),
        type: discountType,
        value: Number(discountVal),
        maxUses: Number(maxUses),
        expiryDate,
        isActive: true
      });

      setCodeStr('');
      setIsSavingPromo(false);
      setShowPromoModal(false);
    }, 350);
  };

  const handleExportPromoCSV = () => {
    if (promoCodes.length === 0) {
      alert('لا توجد أكواد خصم للتصدير!');
      return;
    }
    const headers = [
      '#',
      'رمز الكود',
      'جهة الخصم (المؤسسة/المدرسة)',
      'نوع الخصم',
      'قيمة الخصم',
      'الحالة',
      'تاريخ ووقت الحرق',
      'حد الاستخدام',
      'تاريخ الانتهاء'
    ];

    // Show newest first in CSV as well
    const sortedForExport = [...promoCodes].sort((a, b) => getPromoTimestamp(b) - getPromoTimestamp(a));

    const rows = sortedForExport.map((p, idx) => {
      const isBurned = p.isUsed || p.usedCount >= p.maxUses;
      const typeStr = p.type === 'percentage' ? 'نسبة مئوية' : 'خصم ثابت';
      const valStr = p.type === 'percentage' ? `${p.value}%` : `${p.value} ل.س`;
      const statusStr = isBurned ? 'مستعمل / محروق' : 'فعال وجاهز';
      const usedAtStr = p.usedAt || (p.isUsed ? 'مستخدم سابقا' : 'غير مستخدم بعد');
      const groupStr = p.groupName || 'عام';
      return [
        idx + 1,
        `"${p.code}"`,
        `"${groupStr}"`,
        `"${typeStr}"`,
        `"${valStr}"`,
        `"${statusStr}"`,
        `"${usedAtStr}"`,
        `"${p.isOneTime !== false ? 'مرة واحدة' : p.maxUses}"`,
        `"${p.expiryDate}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cortado_promo_codes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">قيد الانتظار ⏳</span>;
      case 'preparing':
        return <span className="bg-blue-950/80 border border-blue-500/40 text-blue-300 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">جاري التحضير 🍳</span>;
      case 'delivering':
        return <span className="bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">جاري التوصيل 🚚</span>;
      case 'delivered':
        return <span className="bg-teal-950/80 border border-teal-500/40 text-teal-300 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">تم التسليم 🟢</span>;
      case 'completed':
        return <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">مكتمل 🏆</span>;
      case 'cancelled':
        return <span className="bg-rose-950/80 border border-rose-500/40 text-rose-300 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">ملغي ❌</span>;
      default:
        return <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">{status}</span>;
    }
  };

  const getCategoryBadge = (catId: CategoryId) => {
    switch (catId) {
      case 'cold':
        return (
          <span className="bg-[#00A859]/20 text-[#00A859] border border-[#00A859]/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
            <span>❄️</span> مشروبات باردة
          </span>
        );
      case 'hot':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
            <span>☕</span> مشروبات ساخنة
          </span>
        );
      case 'desserts':
        return (
          <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
            <span>🍰</span> حلويات طازجة
          </span>
        );
      case 'special':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit">
            <span>✨</span> خلطات خاصة
          </span>
        );
      default:
        return null;
    }
  };

  const isLightAdmin = adminTheme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className={`rounded-2xl sm:rounded-3xl w-full max-w-6xl h-[98vh] sm:h-[92vh] flex flex-col shadow-2xl text-right overflow-hidden transition-colors duration-300 border ${
        isLightAdmin 
          ? 'bg-slate-50 border-slate-300 text-slate-800' 
          : 'bg-[#1E1B18] border-[#D4A373]/30 text-[#FAEDCD] gold-border-glow'
      }`}>
        
        {/* HEADER BAR */}
        <div className={`p-2 sm:p-4 border-b flex items-center justify-between gap-1.5 sm:gap-3 transition-colors duration-300 sticky top-0 z-30 ${
          isLightAdmin 
            ? 'bg-white border-slate-200' 
            : 'bg-[#2D2926] border-[#00A859]/30'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#00A859] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`font-['Cairo'] font-black text-xs sm:text-lg truncate ${isLightAdmin ? 'text-slate-900' : 'text-[#FAEDCD]'}`}>
                لوحة التحكم الإدارية
              </h2>
              <p className="text-[10px] sm:text-xs text-[#00A859] font-bold truncate">
                إدارة المتجر والطلبات والمنتجات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* SOUND ALERT TEST BUTTON */}
            <button
              onClick={() => playOrderAlertSound()}
              className={`p-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                isLightAdmin
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-[#00A859]/20 hover:bg-[#00A859]/30 text-emerald-300 border-[#00A859]/40'
              }`}
              title="اختبار التنبيه الصوتي المعتمد حالياً"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#00A859]" />
              <span className="hidden md:inline">اختبار الصوت 🔔</span>
            </button>

            {/* SOUND TONE SELECTOR BUTTON */}
            <button
              onClick={() => setShowSoundSelectorModal(true)}
              className={`p-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border shadow-2xs active:scale-95 ${
                isLightAdmin
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
              }`}
              title="تغيير وتثبيت نغمة تنبيه الطلبات الواردة (10 نغمات)"
            >
              <Music className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">نغمة التنبيه 🎵</span>
            </button>

            {/* THEME SWITCHER BUTTON */}
            <button
              onClick={() => setAdminTheme(adminTheme === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border shadow-2xs ${
                isLightAdmin
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#1E1B18] hover:bg-[#25211E] text-[#FAEDCD] border-[#D4A373]/40'
              }`}
              title="تغيير لون لوحة التحكم بين الأبيض والبني الداكن"
            >
              {isLightAdmin ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#00A859]" />
                  <span className="hidden md:inline">البني 🌙</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">الأبيض ☀️</span>
                </>
              )}
            </button>

            {/* HIGH VISIBILITY CLOSE BUTTON FOR MOBILE & DESKTOP */}
            <button
              onClick={() => toggleAdminModal(false)}
              className="p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 shrink-0 active:scale-95 shadow-2xs flex items-center gap-1 font-bold text-xs"
              title="إغلاق لوحة التحكم"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">إغلاق</span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION BAR */}
        <div className={`border-b px-2 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none transition-colors duration-300 ${
          isLightAdmin ? 'bg-slate-100 border-slate-200' : 'bg-[#1E1B18] border-[#00A859]/20'
        }`}>
          <button
            onClick={() => setActiveAdminTab('overview')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'overview' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>نظرة عامة والتحليلات</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('promos')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'promos' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>أكواد الخصم ({promoCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'settings' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>إعدادات الموقع والشعار</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('quickLinks')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'quickLinks' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>الروابط السريعة والصفحات ({quickLinksList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('products')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'products' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'orders' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>الطلبات ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('customers')}
            className={`px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeAdminTab === 'customers' 
                ? 'bg-[#00A859] text-white shadow-md' 
                : isLightAdmin 
                ? 'text-slate-700 hover:bg-white hover:text-slate-900'
                : 'text-[#FAEDCD]/70 hover:bg-[#2D2926] hover:text-[#FAEDCD]'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>العملاء ({customers.length})</span>
          </button>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className={`flex-1 overflow-y-auto p-2.5 sm:p-6 space-y-3 sm:space-y-6 transition-colors duration-300 ${
          isLightAdmin ? 'bg-slate-50 text-slate-800' : 'bg-[#1E1B18] text-[#FAEDCD]'
        }`}>
          
          {/* TAB 1: OVERVIEW ANALYTICS */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-3 sm:space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border ${
                  isLightAdmin ? 'bg-white border-slate-200' : 'bg-[#2D2926] border-[#FAEDCD]/10'
                }`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs opacity-75">إجمالي المبيعات</span>
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <span className="font-['Cairo'] font-black text-sm sm:text-2xl block truncate">
                    {totalRevenue.toFixed(0)} <span className="text-[10px] sm:text-xs font-normal">ل.س</span>
                  </span>
                </div>

                <div className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border ${
                  isLightAdmin ? 'bg-white border-slate-200' : 'bg-[#2D2926] border-[#FAEDCD]/10'
                }`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs opacity-75">عدد الطلبات</span>
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A373]" />
                  </div>
                  <span className="font-['Cairo'] font-black text-sm sm:text-2xl block">
                    {totalOrders}
                  </span>
                </div>

                <div className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border ${
                  isLightAdmin ? 'bg-white border-slate-200' : 'bg-[#2D2926] border-[#FAEDCD]/10'
                }`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs opacity-75">العملاء المسجلين</span>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <span className="font-['Cairo'] font-black text-sm sm:text-2xl block">
                    {totalCustomers}
                  </span>
                </div>

                <div className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border ${
                  isLightAdmin ? 'bg-white border-slate-200' : 'bg-[#2D2926] border-[#FAEDCD]/10'
                }`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs opacity-75">أكواد الخصم</span>
                    <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <span className="font-['Cairo'] font-black text-sm sm:text-2xl block">
                    {activePromosCount}
                  </span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className={`p-3 sm:p-6 rounded-xl sm:rounded-2xl border ${
                isLightAdmin ? 'bg-white border-slate-200' : 'bg-[#2D2926] border-[#FAEDCD]/10'
              }`}>
                <h3 className="font-bold text-xs sm:text-base mb-3">أحدث الطلبات القادمة</h3>
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full text-right text-[11px] sm:text-xs">
                    <thead>
                      <tr className="border-b border-[#D4A373]/20 text-[#D4A373]">
                        <th className="pb-2 sm:pb-3 px-1 sm:px-2">رقم الطلب</th>
                        <th className="pb-2 sm:pb-3 px-1 sm:px-2">اسم العميل</th>
                        <th className="pb-2 sm:pb-3 px-1 sm:px-2">الحالة</th>
                        <th className="pb-2 sm:pb-3 px-1 sm:px-2">نوع الخدمة</th>
                        <th className="pb-2 sm:pb-3 px-1 sm:px-2">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4A373]/10">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#1E1B18]/50">
                          <td className="py-2.5 px-1 sm:px-2 font-mono font-bold text-[#D4A373]">{ord.id}</td>
                          <td className="py-2.5 px-1 sm:px-2 font-bold">{ord.customerName}</td>
                          <td className="py-2.5 px-1 sm:px-2">{getStatusBadge(ord.status)}</td>
                          <td className="py-2.5 px-1 sm:px-2">{ord.deliveryType === 'table' ? 'طاولة' : ord.deliveryType === 'takeaway' ? 'سفري' : 'توصيل'}</td>
                          <td className="py-2.5 px-1 sm:px-2 font-bold">{ord.total.toFixed(0)} ل.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL WEBSITE SETTINGS */}
          {activeAdminTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
              
              {/* STORE STATUS TOGGLE CARD IN SETTINGS */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-xs ${
                settings.isStoreOpen === false
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100'
                  : isLightAdmin 
                    ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-xs'
                    : 'bg-[#00A859]/15 border-[#00A859]/40 text-[#FAEDCD]'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      settings.isStoreOpen === false ? 'bg-rose-600 text-white' : 'bg-[#00A859] text-white'
                    }`}>
                      {settings.isStoreOpen === false ? (
                        <Store className="w-6 h-6 animate-pulse" />
                      ) : (
                        <Store className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Cairo'] font-extrabold text-base sm:text-lg">
                          حالة استقبال الطلبات في المتجر:
                        </h3>
                        <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${
                          settings.isStoreOpen === false
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                            : 'bg-emerald-600 text-white border-emerald-700'
                        }`}>
                          {settings.isStoreOpen === false ? '🔴 المتجر مغلق (موقوف)' : '🟢 المتجر يعمل ويستقبل الطلبات'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${
                        settings.isStoreOpen === false ? 'text-rose-800' : isLightAdmin ? 'text-slate-600' : 'text-[#FAEDCD]/80'
                      }`}>
                        تستطيع توقيف استقبال الطلبات مؤقتاً بالضغط على الزر المقابل. الزبائن سيظهر لهم رسالة "المتجر مغلق حالياً".
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleStoreStatus}
                    className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 ${
                      settings.isStoreOpen === false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400'
                    }`}
                  >
                    {settings.isStoreOpen === false ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>إعادة فتح المتجر 🟢</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-5 h-5" />
                        <span>توقيف المتجر 🔴</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
                isLightAdmin ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-[#2D2926] border-[#D4A373]/30 text-[#FAEDCD]/90'
              }`}>
                <Info className="w-5 h-5 text-[#00A859] flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#00A859]">ملاحظات ومواصفات المقاسات الموصى بها:</p>
                  <p>• شعار الكافيه (Logo): مقاس مربع 512×512 بكسل (صيغة PNG شفافة أو GIF متحرك / SVG).</p>
                  <p>• بنرات العرض (Banners): مقاس 1920×1080 بكسل بجودة فائقة HD.</p>
                </div>
              </div>

              {settingsSavedMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم حفظ الإعدادات بنجاح والتحديث على الواجهة!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-extrabold mb-1 ${isLightAdmin ? 'text-slate-900' : 'text-[#D4A373]'}`}>
                    عنوان الكافيه
                  </label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold outline-none border focus:ring-2 focus:ring-[#00A859] ${
                      isLightAdmin 
                        ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' 
                        : 'bg-[#2D2926] border-[#D4A373]/20 text-[#FAEDCD]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-extrabold mb-1 ${isLightAdmin ? 'text-slate-900' : 'text-[#D4A373]'}`}>
                    الوصف الفرعي
                  </label>
                  <input
                    type="text"
                    value={siteSubtitle}
                    onChange={(e) => setSiteSubtitle(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold outline-none border focus:ring-2 focus:ring-[#00A859] ${
                      isLightAdmin 
                        ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' 
                        : 'bg-[#2D2926] border-[#D4A373]/20 text-[#FAEDCD]'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className={`block text-xs font-extrabold ${isLightAdmin ? 'text-slate-900' : 'text-[#D4A373]'}`}>
                    شعار الكافيه (Logo)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {logoUrl && (
                      <div className={`w-12 h-12 rounded-xl p-1 flex-shrink-0 border ${
                        isLightAdmin ? 'bg-slate-100 border-slate-300' : 'bg-[#181512] border-[#D4A373]/30'
                      }`}>
                        <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className={`flex-1 w-full rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none border focus:ring-2 focus:ring-[#00A859] ${
                        isLightAdmin 
                          ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' 
                          : 'bg-[#2D2926] border-[#D4A373]/20 text-[#FAEDCD]'
                      }`}
                    />
                    <label className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0 self-stretch sm:self-auto justify-center shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>رفع من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-extrabold mb-1 ${isLightAdmin ? 'text-slate-900' : 'text-[#D4A373]'}`}>
                    رقم الهاتف والتواصل
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold outline-none border focus:ring-2 focus:ring-[#00A859] ${
                      isLightAdmin 
                        ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' 
                        : 'bg-[#2D2926] border-[#D4A373]/20 text-[#FAEDCD]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-extrabold mb-1 ${isLightAdmin ? 'text-slate-900' : 'text-[#D4A373]'}`}>
                    عنوان الموقع الرئيسي الفرعي
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold outline-none border focus:ring-2 focus:ring-[#00A859] ${
                      isLightAdmin 
                        ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' 
                        : 'bg-[#2D2926] border-[#D4A373]/20 text-[#FAEDCD]'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-extrabold mb-1 flex items-center gap-1.5 ${
                    isLightAdmin ? 'text-slate-900' : 'text-[#D4A373]'
                  }`}>
                    <Clock className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>أوقات العمل وساعات الدوام</span>
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="مثال: يومياً من 6:00 صباحاً حتى 12:00 منتصف الليل"
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold outline-none border focus:ring-2 focus:ring-[#00A859] ${
                      isLightAdmin 
                        ? 'bg-white border-slate-300 text-slate-900 shadow-2xs' 
                        : 'bg-[#2D2926] border-[#D4A373]/20 text-[#FAEDCD]'
                    }`}
                  />
                </div>

                {/* BRANCHES & LOCATIONS MANAGEMENT */}
                <div className="sm:col-span-2 space-y-4 pt-4 border-t border-[#D4A373]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#00A859]" />
                      <h4 className="font-bold text-sm text-[#00A859]">
                        فروع ومواقع الكافيه ({branchesList.length} موقع)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة موقع / فرع جديد</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#FAEDCD]/70">
                    يمكنك إضافة أكثر من موقع وفرع للكافيه، وستظهر جميع الفروع لعملائك في أسفل الصفحة وفي قسم التواصل وعند إتمام الطلب.
                  </p>

                  <div className="space-y-3">
                    {branchesList.map((branch, index) => (
                      <div 
                        key={branch.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isLightAdmin 
                            ? 'bg-slate-100 border-slate-200' 
                            : 'bg-[#221C17] border-[#3D332A]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D4A373]/10">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#00A859]" />
                            <span className="font-bold text-xs text-[#D4A373]">
                              الموقع #{index + 1}: {branch.name || 'فرع بدون اسم'}
                            </span>
                            {branch.isMain && (
                              <span className="bg-[#00A859]/20 text-[#00A859] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#00A859]/30">
                                الفرع الرئيسي
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!branch.isMain && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBranch(branch.id, 'isMain', true)}
                                className="text-[11px] text-[#00A859] hover:underline font-bold cursor-pointer"
                              >
                                تعيين كفرع رئيسي
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer transition-colors"
                              title="حذف هذا الموقع"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">اسم الموقع / الفرع</label>
                            <input
                              type="text"
                              value={branch.name}
                              onChange={(e) => handleUpdateBranch(branch.id, 'name', e.target.value)}
                              placeholder="مثال: فرع حماة - الشريعة"
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none ${
                                isLightAdmin 
                                  ? 'bg-white border border-slate-200 text-slate-800' 
                                  : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">العنوان والتفاصيل</label>
                            <input
                              type="text"
                              value={branch.address}
                              onChange={(e) => handleUpdateBranch(branch.id, 'address', e.target.value)}
                              placeholder="مثال: سوريا - حماة - الشريعة"
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none ${
                                isLightAdmin 
                                  ? 'bg-white border border-slate-200 text-slate-800' 
                                  : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">رقم الهاتف للفرع (اختياري)</label>
                            <input
                              type="text"
                              value={branch.phone || ''}
                              onChange={(e) => handleUpdateBranch(branch.id, 'phone', e.target.value)}
                              placeholder="+963..."
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none ${
                                isLightAdmin 
                                  ? 'bg-white border border-slate-200 text-slate-800' 
                                  : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">رابط خريطة Google (اختياري)</label>
                            <input
                              type="text"
                              value={branch.mapUrl || ''}
                              onChange={(e) => handleUpdateBranch(branch.id, 'mapUrl', e.target.value)}
                              placeholder="https://maps.google.com/..."
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none font-mono ${
                                isLightAdmin 
                                  ? 'bg-white border border-slate-200 text-slate-800' 
                                  : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DELIVERY FEE SETTING */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-[#221C17] border border-[#00A859]/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#00A859]" />
                    <label className="text-xs font-bold text-[#00A859]">رسوم خدمة التوصيل (ل.س)</label>
                  </div>
                  <p className="text-[11px] text-[#FAEDCD]/70 leading-relaxed">
                    تضاف هذه الرسوم تلقائياً إلى الفاتورة الإجمالية للطلب عند اختيار العميل خيار "توصيل للموقع".
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      placeholder="15"
                      className="w-48 bg-[#2D2926] border border-[#00A859]/40 rounded-xl px-4 py-2.5 text-xs text-[#FAEDCD] font-mono font-bold outline-none"
                    />
                    <span className="text-xs font-bold text-[#00A859]">ليرة سورية</span>
                  </div>
                </div>

                {/* CUSTOM PAYMENT METHODS MANAGEMENT */}
                <div className="sm:col-span-2 space-y-4 pt-4 border-t border-[#D4A373]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-[#00A859]" />
                      <h4 className="font-bold text-sm text-[#00A859]">
                        إدارة طرق الدفع وتفاصيل التحويل ({paymentMethodsList.length} طريقة)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPaymentMethod}
                      className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة طريقة دفع جديدة</span>
                    </button>
                  </div>

                  {/* Image size instruction alert box */}
                  <div className="bg-[#2D2926] border border-[#00A859]/40 p-3.5 rounded-2xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#00A859] flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[#FAEDCD]/90 leading-relaxed space-y-1">
                      <p className="font-bold text-[#00A859]">💡 الحجم والقياس الموصى به لصور وأيقونات طرق الدفع:</p>
                      <p>• يُفضل استخدام صورة مصغرة ومربعة بمقاس <strong className="text-white bg-[#00A859]/30 px-1.5 py-0.5 rounded">200×200 بكسل</strong> (أو رمز QR / شعار الشركة خلفية شفافة PNG).</p>
                      <p>• الصورة تظهر بحجم صغير وأنيق في صفحة إتمام الطلب لتوجيه الزبون خطوة بخطوة.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {paymentMethodsList.map((pm, idx) => (
                      <div
                        key={pm.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isLightAdmin 
                            ? 'bg-slate-100 border-slate-200' 
                            : 'bg-[#221C17] border-[#3D332A]'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#D4A373]/10">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#00A859]" />
                            <span className="font-bold text-xs text-[#D4A373]">
                              طريقة #{idx + 1}: {pm.name || 'بدون اسم'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              pm.isActive 
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' 
                                : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                            }`}>
                              {pm.isActive ? 'مفعلة ومتوفرة للزبائن' : 'معطلة مؤقتاً'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdatePaymentMethod(pm.id, 'isActive', !pm.isActive)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                pm.isActive
                                  ? 'bg-rose-900/40 border-rose-500/30 text-rose-300 hover:bg-rose-800/50'
                                  : 'bg-emerald-900/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-800/50'
                              }`}
                            >
                              {pm.isActive ? 'تعطيل' : 'تفعيل'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePaymentMethod(pm.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer transition-colors"
                              title="حذف طريقة الدفع"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">اسم طريقة الدفع</label>
                            <input
                              type="text"
                              value={pm.name}
                              onChange={(e) => handleUpdatePaymentMethod(pm.id, 'name', e.target.value)}
                              placeholder="مثال: شام كاش / سيريتل كاش / تحويل بنكي"
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none ${
                                isLightAdmin 
                                  ? 'bg-white border border-slate-200 text-slate-800' 
                                  : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">
                              صورة أو رمز QR لطريقة الدفع (رفع مباشر من الجهاز)
                            </label>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {pm.imageUrl && (
                                  <img
                                    src={pm.imageUrl}
                                    alt={pm.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-[#D4A373]/40 flex-shrink-0 shadow-xs"
                                  />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`pm-file-${pm.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (reader.result) {
                                          handleUpdatePaymentMethod(pm.id, 'imageUrl', reader.result as string);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`pm-file-${pm.id}`}
                                  className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>رفع صورة من الجهاز</span>
                                </label>
                                {pm.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePaymentMethod(pm.id, 'imageUrl', '')}
                                    className="text-rose-400 hover:text-rose-300 text-xs font-bold underline cursor-pointer mr-1"
                                  >
                                    حذف الصورة
                                  </button>
                                )}
                              </div>
                              <input
                                type="text"
                                value={pm.imageUrl || ''}
                                onChange={(e) => handleUpdatePaymentMethod(pm.id, 'imageUrl', e.target.value)}
                                placeholder="أو أدخل رابط الصورة هنا (اختياري)"
                                className={`w-full rounded-xl px-3 py-1.5 text-[11px] outline-none font-mono ${
                                  isLightAdmin 
                                    ? 'bg-white border border-slate-200 text-slate-800' 
                                    : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-[#D4A373] mb-1">تفاصيل الحساب وتعليمات التحويل للعميل</label>
                            <textarea
                              rows={2}
                              value={pm.details}
                              onChange={(e) => handleUpdatePaymentMethod(pm.id, 'details', e.target.value)}
                              placeholder="مثال: رقم الحساب: 0912345678 — اسم المستفيد: كافيه كورتادو"
                              className={`w-full rounded-xl px-3 py-2 text-xs outline-none resize-none ${
                                isLightAdmin 
                                  ? 'bg-white border border-slate-200 text-slate-800' 
                                  : 'bg-[#2D2926] border border-[#D4A373]/20 text-[#FAEDCD]'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-1">بريد المدير المصرح (Admin Email)</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-[#221C17] border border-[#3D332A] rounded-xl px-4 py-2.5 text-xs text-[#FAEDCD] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-1">حساب انستغرام (Instagram)</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-[#221C17] border border-[#3D332A] rounded-xl px-4 py-2.5 text-xs text-[#FAEDCD] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-1">حساب واتساب (WhatsApp Link)</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#221C17] border border-[#3D332A] rounded-xl px-4 py-2.5 text-xs text-[#FAEDCD] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-1">رابط خرائط جوجل (Google Map)</label>
                  <input
                    type="text"
                    value={locationMap}
                    onChange={(e) => setLocationMap(e.target.value)}
                    className="w-full bg-[#221C17] border border-[#3D332A] rounded-xl px-4 py-2.5 text-xs text-[#FAEDCD] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className={`font-black text-xs px-7 py-3.5 rounded-2xl flex items-center gap-2.5 cursor-pointer transition-all duration-300 shadow-lg active:scale-90 ${
                    justSavedSettings
                      ? 'bg-emerald-600 text-white scale-105 ring-4 ring-emerald-500/40 shadow-emerald-500/30'
                      : isSavingSettings
                      ? 'bg-[#008A48] text-white opacity-90 cursor-wait'
                      : 'bg-[#00A859] hover:bg-[#008A48] text-white hover:scale-102 active:bg-emerald-700'
                  }`}
                >
                  {justSavedSettings ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 animate-bounce text-white" />
                      <span className="text-sm font-black">تم حفظ الإعدادات بنجاح! ✓</span>
                    </>
                  ) : isSavingSettings ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري الحفظ والربط... ⏳</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ إعدادات الموقع</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2.5: QUICK LINKS MANAGEMENT */}
          {activeAdminTab === 'quickLinks' && (
            <div className="space-y-4 max-w-5xl">
              {/* Header Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border ${
                isLightAdmin ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#2D2926] border-[#00A859]/30'
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00A859]/20 text-[#00A859] flex items-center justify-center font-bold">
                      <Globe className="w-4 h-4" />
                    </div>
                    <h3 className={`font-bold text-sm sm:text-base ${isLightAdmin ? 'text-slate-800' : 'text-[#FAEDCD]'}`}>
                      إدارة الروابط السريعة والصفحات التعريفية
                    </h3>
                  </div>
                  <p className={`text-xs mt-1 ${isLightAdmin ? 'text-slate-500' : 'text-[#FAEDCD]/70'}`}>
                    قم بتعديل محتوى الصفحات التعريفية، إخفائها، أو إضافة صفحات جديدة لتعزيز أرشفة محركات البحث وذكاء AI
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleAddNewQuickLink}
                    className="flex-1 sm:flex-none bg-[#00A859] hover:bg-[#008F4C] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة صفحة جديدة</span>
                  </button>
                </div>
              </div>

              {quickLinkSavedMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>تم حفظ وتحديث إعدادات الروابط السريعة بنجاح!</span>
                </div>
              )}

              {/* Quick Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {quickLinksList.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      item.isHidden 
                        ? (isLightAdmin ? 'bg-slate-100 border-slate-300 opacity-75' : 'bg-[#181513] border-red-500/20 opacity-70')
                        : (isLightAdmin ? 'bg-white border-slate-200 shadow-sm hover:border-[#00A859]/40' : 'bg-[#2D2926] border-[#00A859]/20 hover:border-[#00A859]/50')
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00A859]/15 text-[#00A859] border border-[#00A859]/30">
                            {item.badge || `صفحة ${idx + 1}`}
                          </span>
                          <span className={`text-xs font-mono text-slate-400`}>
                            #{item.id}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1">
                          {item.isHidden ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1 border border-amber-500/30">
                              <EyeOff className="w-3 h-3" />
                              <span>مخفية</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                              <Eye className="w-3 h-3" />
                              <span>ظاهرة</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className={`font-bold text-sm sm:text-base font-['Cairo'] ${isLightAdmin ? 'text-slate-900' : 'text-white'}`}>
                        {item.titleAr}
                      </h4>

                      <p className={`text-xs line-clamp-2 leading-relaxed ${isLightAdmin ? 'text-slate-600' : 'text-[#FAEDCD]/70'}`}>
                        {item.contentAr || 'لا يوجد محتوى مكتوب بعد'}
                      </p>

                      {item.customUrl && (
                        <div className="flex items-center gap-1 text-[11px] text-sky-500 font-mono truncate pt-1">
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.customUrl}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Control Actions */}
                    <div className={`pt-3 border-t flex items-center justify-between gap-2 ${
                      isLightAdmin ? 'border-slate-200' : 'border-white/10'
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleToggleQuickLinkHidden(item.id)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                          item.isHidden 
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                        title={item.isHidden ? 'إظهار الصفحة في التذييل' : 'إخفاء الصفحة من التذييل'}
                      >
                        {item.isHidden ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>إظهار الصفحة</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>إخفاء الصفحة</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingQuickLink(item)}
                          className="p-1.5 bg-[#00A859]/10 hover:bg-[#00A859]/20 text-[#00A859] rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 px-2.5"
                          title="تعديل تفاصيل الصفحة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuickLink(item.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="حذف الصفحة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDIT QUICK LINK MODAL */}
          {editingQuickLink && (
            <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
                isLightAdmin ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#1E1B18] border-[#00A859]/30 text-[#FAEDCD]'
              }`}>
                {/* Modal Header */}
                <div className="bg-[#181513] px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#00A859]" />
                    <h3 className="font-bold text-base text-white font-['Cairo']">
                      تعديل صفحة: {editingQuickLink.titleAr}
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingQuickLink(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Form Content */}
                <div className="p-5 space-y-4 overflow-y-auto font-['Cairo']">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      عنوان الصفحة (يظهر في أسفل الموقع وفي القائمة)
                    </label>
                    <input
                      type="text"
                      value={editingQuickLink.titleAr}
                      onChange={(e) => setEditingQuickLink({ ...editingQuickLink, titleAr: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00A859] ${
                        isLightAdmin ? 'bg-slate-50 border-slate-300' : 'bg-[#2D2926] border-white/10 text-white'
                      }`}
                      placeholder="مثال: تعريف Cortado Café"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      وسام الصفحة / التصنيف الفرعي
                    </label>
                    <input
                      type="text"
                      value={editingQuickLink.badge || ''}
                      onChange={(e) => setEditingQuickLink({ ...editingQuickLink, badge: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859] ${
                        isLightAdmin ? 'bg-slate-50 border-slate-300' : 'bg-[#2D2926] border-white/10 text-white'
                      }`}
                      placeholder="مثال: الرئيسية، خدماتنا، هويتنا..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      محتوى ومعلومات الصفحة المفصلة (هام جداً لمحركات البحث والذكاء الاصطناعي)
                    </label>
                    <textarea
                      rows={5}
                      value={editingQuickLink.contentAr || ''}
                      onChange={(e) => setEditingQuickLink({ ...editingQuickLink, contentAr: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00A859] ${
                        isLightAdmin ? 'bg-slate-50 border-slate-300' : 'bg-[#2D2926] border-white/10 text-white'
                      }`}
                      placeholder="اكتب هنا التفاصيل الكاملة للصفحة، الرؤية، الخدمات، أو البيانات المخصصة..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      رابط خارجي مخصص (اختياري - يفتح في نافذة جديدة عند النقر)
                    </label>
                    <input
                      type="url"
                      value={editingQuickLink.customUrl || ''}
                      onChange={(e) => setEditingQuickLink({ ...editingQuickLink, customUrl: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#00A859] ${
                        isLightAdmin ? 'bg-slate-50 border-slate-300' : 'bg-[#2D2926] border-white/10 text-white'
                      }`}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={editingQuickLink.isHidden || false}
                        onChange={(e) => setEditingQuickLink({ ...editingQuickLink, isHidden: e.target.checked })}
                        className="w-4 h-4 rounded text-[#00A859] focus:ring-[#00A859]"
                      />
                      <span>إخفاء هذه الصفحة من تذييل الموقع والروابط السريعة</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-[#181513] px-5 py-3 flex items-center justify-end gap-2 border-t border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingQuickLink(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickLinkModal}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00A859] hover:bg-[#008F4C] text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التغييرات</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & MENU MANAGEMENT */}
          {activeAdminTab === 'products' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="font-bold text-xs sm:text-base text-[#FAEDCD]">قائمة المنتجات والأصناف</h3>
                  <p className="text-[10px] sm:text-xs text-[#FAEDCD]/60">موزعة حسب الأقسام (باردة، ساخنة، حلويات، خلطات)</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="flex-1 sm:flex-none bg-[#2D2926] hover:bg-[#322A23] text-[#00A859] border border-[#00A859]/40 font-bold text-[11px] sm:text-xs px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>إدارة الأقسام ({categories.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setBulkItems([]);
                      setShowBulkModal(true);
                    }}
                    className="flex-1 sm:flex-none bg-[#D4A373] text-[#181512] hover:bg-[#c39262] font-bold text-[11px] sm:text-xs px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>رفع صور دفعة</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="flex-1 sm:flex-none bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-[11px] sm:text-xs px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة منتج</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('هل أنت تأكد من استعادة جميع المنتجات والبيانات الأصلية؟')) {
                        resetToInitialData();
                      }
                    }}
                    className="bg-[#2D2926] hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 font-bold text-[11px] sm:text-xs px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="استعادة البيانات الافتراضية"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إعادة ضبط</span>
                  </button>
                </div>
              </div>

              {/* Category Filter & Search Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 bg-[#26201B] p-2.5 rounded-xl sm:rounded-2xl border border-[#3D332A]">
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                  <button
                    onClick={() => setAdminCategoryFilter('all')}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      adminCategoryFilter === 'all'
                        ? 'bg-[#00A859] text-white shadow-xs'
                        : 'bg-[#1E1B18] text-[#FAEDCD]/70 hover:text-[#FAEDCD]'
                    }`}
                  >
                    جميع الأصناف ({products.length})
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setAdminCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                          adminCategoryFilter === cat.id
                            ? 'bg-[#00A859] text-white shadow-xs'
                            : 'bg-[#1E1B18] text-[#FAEDCD]/70 hover:text-[#FAEDCD]'
                        }`}
                      >
                        <span>{cat.nameAr}</span>
                        {cat.isHidden && <span className="text-[9px] text-rose-300">(مخفي)</span>}
                        <span className="text-[9px] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="w-full md:w-64">
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المنتج..."
                    className="w-full bg-[#1E1B18] border border-[#3D332A] rounded-lg px-3 py-1.5 text-xs text-[#FAEDCD] outline-none"
                  />
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => adminCategoryFilter === 'all' || p.categoryId === adminCategoryFilter)
                  .filter((p) => !adminSearchQuery.trim() || p.nameAr.includes(adminSearchQuery) || p.nameEn.toLowerCase().includes(adminSearchQuery.toLowerCase()))
                  .map((p) => (
                    <div key={p.id} className="bg-[#221C17] p-4 rounded-2xl border border-[#2D2721] flex gap-3 hover:border-[#00A859]/40 transition-all">
                      <img src={p.imageUrl} alt={p.nameAr} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm text-[#FAEDCD] truncate">{p.nameAr}</h4>
                            <span className="text-xs font-bold text-[#D4A373] whitespace-nowrap mr-1">{p.price} ر.س</span>
                          </div>
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            {getCategoryBadge(p.categoryId)}
                            {p.sizes && p.sizes.length > 0 && (
                              <span className="text-[10px] text-[#00A859] bg-[#00A859]/10 border border-[#00A859]/30 px-1.5 py-0.5 rounded-md font-bold font-['Cairo']">
                                {p.sizes.map(s => `${s.name}: ${s.price}`).join(' | ')}
                              </span>
                            )}
                          </div>
                          {p.descriptionAr && (
                            <p className="text-[11px] text-[#FAEDCD]/60 line-clamp-1">{p.descriptionAr}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#2D2721] mt-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="text-xs text-[#D4A373] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-xs text-rose-400 hover:underline flex items-center gap-1 mr-auto cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeAdminTab === 'orders' && (
            <div className="space-y-4">
              {/* STORE PAUSE / OPEN CONTROL CARD */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-xs ${
                settings.isStoreOpen === false
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100'
                  : isLightAdmin 
                    ? 'bg-emerald-50/90 border-emerald-300 text-slate-900 shadow-xs'
                    : 'bg-[#00A859]/15 border-[#00A859]/40 text-[#FAEDCD]'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      settings.isStoreOpen === false ? 'bg-rose-600 text-white' : 'bg-[#00A859] text-white'
                    }`}>
                      {settings.isStoreOpen === false ? (
                        <Store className="w-6 h-6 animate-pulse" />
                      ) : (
                        <Store className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Cairo'] font-extrabold text-base sm:text-lg">
                          حالة استقبال الطلبات في المتجر:
                        </h3>
                        <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs ${
                          settings.isStoreOpen === false
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                            : 'bg-emerald-600 text-white border-emerald-700'
                        }`}>
                          {settings.isStoreOpen === false ? '🔴 المتجر مغلق (موقوف)' : '🟢 المتجر يعمل ويستقبل الطلبات'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${
                        settings.isStoreOpen === false ? 'text-rose-800' : isLightAdmin ? 'text-slate-600' : 'text-[#FAEDCD]/80'
                      }`}>
                        {settings.isStoreOpen === false 
                          ? 'المتجر موقوف حالياً. أزرار إضافة للسلة والسلة معطلة وتظهر رسالة "المتجر مغلق" للزبائن.'
                          : 'المتجر يعمل بشكل طبيعي ويستقبل الطلبات مباشرة من القائمة وسلة الشراء.'}
                      </p>
                    </div>
                  </div>

                  {/* TOGGLE STORE STATUS BUTTON */}
                  <button
                    type="button"
                    onClick={handleToggleStoreStatus}
                    className={`px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 ${
                      settings.isStoreOpen === false
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                        : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400'
                    }`}
                  >
                    {settings.isStoreOpen === false ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>إعادة فتح المتجر الآن 🟢</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-5 h-5" />
                        <span>توقيف المتجر عن العمل 🔴</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-slate-400">
                    <p className="text-sm font-bold">لا توجد طلبات مسجلة حتى الآن</p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div 
                      key={ord.id} 
                      className={`p-5 rounded-2xl border shadow-md space-y-4 transition-all ${
                        isLightAdmin 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-[#2A221B] border-amber-500/20 text-slate-100'
                      }`}
                    >
                      {/* TOP BAR: ORDER ID, CUSTOMER INFO & STATUS */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200/80 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-lg text-[#00A859] bg-[#E6F6ED] dark:bg-[#00A859]/20 px-3 py-1 rounded-xl border border-[#00A859]/30">
                            #{ord.id}
                          </span>
                          <div className="flex flex-col">
                            <span className={`font-black text-base sm:text-lg flex items-center gap-2 ${
                              isLightAdmin ? 'text-black' : 'text-white'
                            }`}>
                              <span>{ord.customerName}</span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold ${
                                isLightAdmin 
                                  ? 'bg-slate-200 text-slate-900 border border-slate-300' 
                                  : 'bg-white/10 text-slate-200 border border-white/10'
                              }`}>
                                {ord.deliveryType === 'table' ? 'طاولة 🍽️' : ord.deliveryType === 'takeaway' ? 'سفري 🛍️' : 'توصيل للموقع 🚚'}
                              </span>
                            </span>
                            <span className="text-xs font-mono font-black text-[#00A859] mt-0.5 dir-ltr text-right">
                              📱 {ord.customerPhone}
                            </span>
                          </div>
                        </div>

                        {/* STATUS BADGE & SELECT */}
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ord.status)}
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className={`text-xs font-black border rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-[#00A859] ${
                              isLightAdmin
                                ? 'bg-slate-100 text-black border-slate-300'
                                : 'bg-[#181512] text-amber-100 border-amber-500/30'
                            }`}
                          >
                            <option value="pending">قيد الانتظار ⏳</option>
                            <option value="preparing">جاري التحضير 🍳</option>
                            <option value="delivering">جاري التوصيل 🚚</option>
                            <option value="delivered">تم التسليم 🟢</option>
                            <option value="completed">مكتمل وجاهز 🏆</option>
                            <option value="cancelled">ملغي ❌</option>
                          </select>
                        </div>
                      </div>

                      {/* ORDER ITEMS LIST */}
                      <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                        isLightAdmin
                          ? 'bg-slate-100/90 border-slate-300'
                          : 'bg-black/25 border-white/10'
                      }`}>
                        <p className={`text-xs sm:text-sm font-black mb-1.5 flex items-center gap-1 ${
                          isLightAdmin ? 'text-black' : 'text-slate-100'
                        }`}>
                          <span>📋 الأصناف المطلوبة</span>
                          <span className="text-xs font-bold text-[#00A859]">({ord.items.reduce((acc, i) => acc + i.quantity, 0)} قطعة):</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {ord.items.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`flex justify-between items-center p-3 rounded-xl border shadow-2xs transition-all ${
                                isLightAdmin
                                  ? 'bg-white border-slate-300 text-black'
                                  : 'bg-white/5 border-white/10 text-white'
                              }`}
                            >
                              <span className={`font-black text-sm sm:text-base ${
                                isLightAdmin ? 'text-black' : 'text-white'
                              }`}>
                                {item.nameAr}
                              </span>
                              <span className="bg-[#00A859]/15 text-[#007A40] dark:text-[#00C868] font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg font-mono shrink-0 mr-2">
                                ×{item.quantity} ({item.price * item.quantity} ل.س)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PAYMENT & NOTES */}
                      <div className="space-y-2 text-xs">
                        {ord.paymentMethodName && (
                          <div className={`flex items-center gap-2 p-2.5 rounded-xl border font-black ${
                            isLightAdmin
                              ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                          }`}>
                            <span>💳 طريقة الدفع المختارة:</span>
                            <span className="font-extrabold">{ord.paymentMethodName}</span>
                          </div>
                        )}

                        {ord.notes && (
                          <div className={`p-3 rounded-xl border text-xs font-bold ${
                            isLightAdmin
                              ? 'bg-amber-100/90 text-amber-950 border-amber-300'
                              : 'bg-amber-950/40 text-amber-100 border-amber-800/40'
                          }`}>
                            <span>📝 ملاحظات وتفاصيل إضافية:</span>
                            <p className={`font-black mt-1 text-sm ${
                              isLightAdmin ? 'text-black' : 'text-amber-100'
                            }`}>{ord.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* TOTAL SUMMARY */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/10 text-sm">
                        <span className={`font-black ${isLightAdmin ? 'text-black' : 'text-slate-200'}`}>
                          المبلغ الإجمالي المستحق:
                        </span>
                        <span className="font-black text-xl sm:text-2xl text-[#00A859] font-['Cairo']">
                          {ord.total ? ord.total.toFixed(2) : ord.subtotal.toFixed(2)} ل.س
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS MANAGER (REGISTERED VS GUEST CUSTOMERS) */}
          {activeAdminTab === 'customers' && (
            <div className="space-y-4">
              {(() => {
                const safeCustomers = Array.isArray(customers) ? customers.filter(Boolean) : [];
                const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];

                const registeredCusts = safeCustomers.filter(c => {
                  if (!c) return false;
                  const uidStr = c.uid ? String(c.uid) : '';
                  return c.isRegistered !== false && !uidStr.startsWith('guest-');
                });

                const guestCustsFromStore = safeCustomers.filter(c => {
                  if (!c) return false;
                  const uidStr = c.uid ? String(c.uid) : '';
                  return c.isRegistered === false || uidStr.startsWith('guest-');
                });

                return (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#26201B] p-4 rounded-2xl border border-[#3D332A]">
                      <div>
                        <h3 className="font-bold text-base text-[#FAEDCD] flex items-center gap-2">
                          <User className="w-5 h-5 text-[#00A859]" />
                          <span>قائمة العملاء وإدارة الزوار</span>
                        </h3>
                        <p className="text-xs text-[#FAEDCD]/60 mt-0.5">
                          جميع بيانات العملاء المسجلين والزوار الذين طلبوا بدون تسجيل دخول محفوظة ومزامنة.
                        </p>
                      </div>

                      {/* SUB TAB TOGGLE BUTTONS */}
                      <div className="flex items-center gap-2 bg-[#181512] p-1 rounded-xl border border-[#3D332A] w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setCustomerSubTab('registered')}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex-1 sm:flex-none ${
                            customerSubTab === 'registered'
                              ? 'bg-[#00A859] text-white shadow-xs'
                              : 'text-[#FAEDCD]/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>العملاء المسجلين ({registeredCusts.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerSubTab('guests')}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex-1 sm:flex-none ${
                            customerSubTab === 'guests'
                              ? 'bg-[#00A859] text-white shadow-xs'
                              : 'text-[#FAEDCD]/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>العملاء غير المسجلين (الزوار 🛍️)</span>
                        </button>
                      </div>
                    </div>

                    {/* VIEW 1: REGISTERED CUSTOMERS */}
                    {customerSubTab === 'registered' ? (
                      <div className="overflow-x-auto bg-[#221C17] rounded-2xl border border-[#2D2721] p-4 shadow-md">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-[#2D2721] text-[#D4A373]">
                              <th className="pb-3 font-bold">العميل المسجل</th>
                              <th className="pb-3 font-bold">البريد الإلكتروني</th>
                              <th className="pb-3 font-bold">رقم الجوال</th>
                              <th className="pb-3 font-bold">تاريخ الانضمام</th>
                              <th className="pb-3 font-bold">عدد الطلبات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2D2721]">
                            {registeredCusts.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-[#FAEDCD]/50 font-medium">
                                  لا يوجد عملاء مسجلين بحسابات حتى الآن
                                </td>
                              </tr>
                            ) : (
                              registeredCusts.map((c, idx) => {
                                const cName = String(c.name || 'عميل كورتادو');
                                return (
                                  <tr key={c.uid || idx} className="hover:bg-white/5 transition-colors">
                                    <td className="py-3 flex items-center gap-2">
                                      {c.photoURL ? (
                                        <img src={c.photoURL} alt={cName} className="w-7 h-7 rounded-full object-cover" />
                                      ) : (
                                        <div className="w-7 h-7 rounded-full bg-[#D4A373] text-[#181512] flex items-center justify-center font-extrabold text-xs">
                                          {cName.charAt(0)}
                                        </div>
                                      )}
                                      <span className="font-bold text-white">{cName}</span>
                                    </td>
                                    <td className="py-3 font-mono text-[#FAEDCD]/80">{c.email || '—'}</td>
                                    <td className="py-3 font-mono text-[#00A859] font-bold">{c.phone || '—'}</td>
                                    <td className="py-3 text-[#FAEDCD]/70">{c.joinedAt || '2025-01-01'}</td>
                                    <td className="py-3 font-extrabold text-[#D4A373]">{c.totalOrdersCount || 1} طلبات</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* VIEW 2: UNREGISTERED / GUEST CUSTOMERS */
                      <div className="overflow-x-auto bg-[#221C17] rounded-2xl border border-[#2D2721] p-4 shadow-md">
                        {(() => {
                          const guestCustsMap = new Map<string, any>();
                          
                          // From customers array
                          guestCustsFromStore.forEach(c => {
                            const key = (c.phone && String(c.phone).trim()) || (c.name && String(c.name).trim()) || String(c.uid || '');
                            if (key) guestCustsMap.set(key, c);
                          });

                          // From orders
                          safeOrders.forEach(o => {
                            if (!o.customerEmail || o.customerEmail === 'guest') {
                              const phone = o.customerPhone ? String(o.customerPhone).trim() : '';
                              const name = o.customerName ? String(o.customerName).trim() : '';
                              const key = phone || name;
                              
                              if (key && !guestCustsMap.has(key)) {
                                const matchingOrders = safeOrders.filter(x => 
                                  (phone && x.customerPhone && String(x.customerPhone).trim() === phone) ||
                                  (!phone && name && x.customerName && String(x.customerName).trim() === name)
                                );

                                guestCustsMap.set(key, {
                                  uid: `guest-ord-${o.id}`,
                                  name: name || 'زائر المتجر',
                                  phone: phone,
                                  email: o.customerEmail || 'طلب كزائر بدون بريد',
                                  joinedAt: o.createdAt ? String(o.createdAt).split('T')[0] : 'اليوم',
                                  totalOrdersCount: matchingOrders.length,
                                  totalSpent: matchingOrders.reduce((a, b) => a + (Number(b.total) || 0), 0)
                                });
                              }
                            }
                          });

                          const guestList = Array.from(guestCustsMap.values());

                          return (
                            <table className="w-full text-right text-xs">
                              <thead>
                                <tr className="border-b border-[#2D2721] text-[#D4A373]">
                                  <th className="pb-3 font-bold">اسم العميل (الزائر)</th>
                                  <th className="pb-3 font-bold">رقم الجوال</th>
                                  <th className="pb-3 font-bold">حالة البريد</th>
                                  <th className="pb-3 font-bold">عدد الطلبات</th>
                                  <th className="pb-3 font-bold">إجمالي المشتريات</th>
                                  <th className="pb-3 font-bold">تواصل مباشر</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#2D2721]">
                                {guestList.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="py-8 text-center text-[#FAEDCD]/50 font-medium">
                                      لا يوجد عملاء غير مسجلين (زوار) طلبوا بدون حساب حتى الآن
                                    </td>
                                  </tr>
                                ) : (
                                  guestList.map((g, idx) => {
                                    const gPhone = g.phone ? String(g.phone).trim() : '';
                                    const cleanPhone = gPhone.replace(/[^0-9]/g, '');

                                    return (
                                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-full bg-[#00A859]/20 text-[#00A859] border border-[#00A859]/30 flex items-center justify-center font-extrabold text-xs">
                                            🛍️
                                          </div>
                                          <span className="font-bold text-white">{g.name || 'زائر'}</span>
                                        </td>
                                        <td className="py-3 font-mono text-[#00A859] font-bold dir-ltr text-right">
                                          {gPhone || '—'}
                                        </td>
                                        <td className="py-3 text-[#FAEDCD]/70 font-mono text-[11px]">
                                          {g.email && String(g.email).includes('@') ? g.email : 'طلب كزائر (بدون حساب)'}
                                        </td>
                                        <td className="py-3 font-extrabold text-[#D4A373]">{g.totalOrdersCount || 1} طلبات</td>
                                        <td className="py-3 font-extrabold font-mono text-[#00A859]">
                                          {typeof g.totalSpent === 'number' ? g.totalSpent.toFixed(2) : '—'} ل.س
                                        </td>
                                        <td className="py-3">
                                          {cleanPhone ? (
                                            <a
                                              href={`https://wa.me/${cleanPhone}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all"
                                            >
                                              <span>واتساب 📱</span>
                                            </a>
                                          ) : '—'}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

            {/* TAB 6: PROMO CODE MANAGER TABLE & EXCEL EXPORT */}
          {activeAdminTab === 'promos' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-[#26201B] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#3D332A] shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#00A859]/20 border border-[#00A859]/40 flex items-center justify-center text-[#00A859]">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-[#FAEDCD] flex items-center gap-2">
                        <span>إدارة ومزامنة أكواد الخصم</span>
                        <span className="bg-[#00A859]/20 text-[#00A859] border border-[#00A859]/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                          {promoCodes.length} كود
                        </span>
                      </h3>
                      <p className="text-[11px] text-[#FAEDCD]/70 mt-0.5">
                        الأكواد تُحفظ سحابياً وعلى السيرفر بشكل دائم ومتزامن عبر كافة الفروع والأجهزة للأبد.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full xl:w-auto">
                  {/* Promo Sort Order Selector */}
                  <div className="flex items-center gap-1.5 bg-[#1C1814] border border-[#3D332A] px-2.5 py-1.5 rounded-lg sm:rounded-xl">
                    <span className="text-[11px] font-bold text-[#D4A373] shrink-0">ترتيب:</span>
                    <select
                      value={promoSortOrder}
                      onChange={(e) => setPromoSortOrder(e.target.value as any)}
                      className="bg-transparent text-xs font-black text-[#00A859] outline-none cursor-pointer"
                    >
                      <option value="newest" className="bg-[#1C1814] text-[#FAEDCD]">✨ الأحدث إنشاءً أولاً</option>
                      <option value="oldest" className="bg-[#1C1814] text-[#FAEDCD]">⌛ الأقدم أولاً</option>
                      <option value="discount" className="bg-[#1C1814] text-[#FAEDCD]">💰 الأعلى خصماً</option>
                      <option value="code" className="bg-[#1C1814] text-[#FAEDCD]">🔤 حسب الرمز (أبجدي)</option>
                    </select>
                  </div>

                  {/* Cloud Sync & Refresh Button */}
                  <button
                    onClick={async () => {
                      try {
                        setIsSyncingPromos(true);
                        const res = await syncAllPromoCodesAcrossCloud();
                        alert(`✅ تمت المزامنة السحابية بنجاح عبر كافة الأجهزة والفروع!\n\n• إجمالي الأكواد المتوفرة: ${res.totalCount} كود خصم\n• الأكواد المستهلكة/المحروقة: ${res.burnedCount} كود\n• الأكواد الجاهزة والنشطة: ${res.totalCount - res.burnedCount} كود\n\nتم حفظ وتثبيت كافة الأكواد في الداتابيز السحابية والسيرفر بشكل دائم.`);
                      } catch (e: any) {
                        alert(`حدث خطأ أثناء المزامنة: ${e.message || e}`);
                      } finally {
                        setIsSyncingPromos(false);
                      }
                    }}
                    disabled={isSyncingPromos}
                    className="bg-[#2D2721] hover:bg-[#3D332A] text-[#FAEDCD] font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 border border-[#00A859]/40 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none disabled:opacity-50"
                    title="مزامنة سحابية واسترجاع جميع الأكواد المحفوظة والمحروقة من السيرفر وفروع المقهى"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#00A859] ${isSyncingPromos ? 'animate-spin' : ''}`} />
                    <span>{isSyncingPromos ? 'جاري المزامنة...' : 'مزامنة سحابية 🔄'}</span>
                  </button>

                  {/* Backup JSON Download Button */}
                  <button
                    onClick={() => {
                      try {
                        const current = useStore.getState().promoCodes || [];
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(current, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `cortado_promo_codes_backup_${new Date().toISOString().split('T')[0]}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      } catch (err) {
                        alert('فشل تصدير ملف النسخة الاحتياطية.');
                      }
                    }}
                    className="bg-[#1F2937] hover:bg-[#374151] text-amber-300 font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 border border-amber-500/30 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                    title="تحميل نسخة احتياطية من جميع الأكواد كملف JSON لضمان حفظها للأبد"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>نسخة JSON 💾</span>
                  </button>

                  {/* Restore / Import JSON Button */}
                  <button
                    onClick={() => {
                      setImportPromoText('');
                      setImportFeedback(null);
                      setShowImportPromoModal(true);
                    }}
                    className="bg-[#1F2937] hover:bg-[#374151] text-emerald-300 font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 border border-emerald-500/30 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                    title="استيراد واسترجاع أكواد من ملف JSON أو نص منسوخ"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>استيراد 📥</span>
                  </button>

                  {/* Create Discount Image Card Button */}
                  <button
                    onClick={() => setShowPromoCardModal(true)}
                    className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 text-slate-950 font-extrabold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 border border-amber-200 flex-1 sm:flex-none"
                    title="تصميم وإنشاء بطاقة خصم مصورة طولية حتى 5 أكواد وتحميلها كصورة PNG"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                    <span>بطاقة خصم 💳</span>
                  </button>

                  {/* Excel Download Button */}
                  <button
                    onClick={handleExportPromoCSV}
                    className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                    title="تصدير جدول الخصومات إلى ملف أكسل CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel 📊</span>
                  </button>

                  {/* Bulk Promo Codes Generator Button */}
                  <button
                    onClick={() => setShowBulkPromoModal(true)}
                    className="bg-[#00A859] hover:bg-[#008A48] text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                    title="توليد 100+ كود خصم لمدرسة أو جامعة أو جهة معينة"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>بالجملة (100+) ⚡</span>
                  </button>

                  <button
                    onClick={() => {
                      const autoCode = 'CRT-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                      setCodeStr(autoCode);
                      setDiscountType('percentage');
                      setDiscountVal(15);
                      setMaxUses(1);
                      setExpiryDate('2027-12-31');
                      setShowPromoModal(true);
                    }}
                    className="bg-[#2D2926] hover:bg-[#322A23] text-[#FAEDCD] border border-[#3D332A] font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>تلقائي</span>
                  </button>

                  <button
                    onClick={() => {
                      setCodeStr('');
                      setDiscountType('percentage');
                      setDiscountVal(10);
                      setMaxUses(1);
                      setExpiryDate('2027-12-31');
                      setShowPromoModal(true);
                    }}
                    className="bg-[#D4A373] text-[#181512] hover:bg-[#c39262] font-bold text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>يدوي</span>
                  </button>
                </div>
              </div>

              {/* Responsive Promo Table (Newest codes at top by default) */}
              <div className="overflow-x-auto rounded-2xl border border-[#3D332A] bg-[#221C17]">
                <table className="w-full text-right text-xs text-[#FAEDCD]">
                  <thead className="bg-[#1C1814] text-[#D4A373] border-b border-[#3D332A] font-bold">
                    <tr>
                      <th className="p-3 text-center w-10">#</th>
                      <th className="p-3">رمز الكود / الجهة</th>
                      <th className="p-3">قيمة الخصم</th>
                      <th className="p-3">حالة الكود</th>
                      <th className="p-3">حد الاستخدام</th>
                      <th className="p-3">تاريخ ووقت الحرق</th>
                      <th className="p-3 text-center">إجراءات سريعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2721]">
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-[#FAEDCD]/50">
                          لا توجد أكواد خصم حالية. اضغط على "توليد أكواد بالجملة (100+)" أو "توليد كود تلقائي".
                        </td>
                      </tr>
                    ) : (
                      [...promoCodes]
                        .sort((a, b) => {
                          if (promoSortOrder === 'newest') {
                            const tA = getPromoTimestamp(a);
                            const tB = getPromoTimestamp(b);
                            if (tB !== tA) return tB - tA;
                            return (b.id || '').localeCompare(a.id || '');
                          }
                          if (promoSortOrder === 'oldest') {
                            const tA = getPromoTimestamp(a);
                            const tB = getPromoTimestamp(b);
                            if (tA !== tB) return tA - tB;
                            return (a.id || '').localeCompare(b.id || '');
                          }
                          if (promoSortOrder === 'discount') {
                            const valA = a.value ?? a.discountValue ?? 0;
                            const valB = b.value ?? b.discountValue ?? 0;
                            if (valB !== valA) return valB - valA;
                            return getPromoTimestamp(b) - getPromoTimestamp(a);
                          }
                          if (promoSortOrder === 'code') {
                            return (a.code || '').localeCompare(b.code || '');
                          }
                          return 0;
                        })
                        .map((p, idx) => {
                        const isBurned = p.isUsed || p.usedCount >= p.maxUses;
                        const isCopied = copiedCodeId === p.id;
                        return (
                          <tr key={p.id} className="hover:bg-[#2A231D] transition-colors">
                            <td className="p-3 text-center font-mono text-[#FAEDCD]/60 font-bold">
                              {idx + 1}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col items-start gap-1">
                                <span className="font-mono font-black text-sm tracking-wider text-[#00A859] bg-[#00A859]/10 border border-[#00A859]/30 px-2.5 py-0.5 rounded-lg inline-block">
                                  {p.code}
                                </span>
                                {p.groupName && (
                                  <span className="text-[10px] text-[#D4A373] bg-[#181512] border border-[#3D332A] px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-bold">
                                    <Building2 className="w-3 h-3 text-[#00A859]" />
                                    <span>{p.groupName}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-bold text-[#FAEDCD]">
                              {p.type === 'percentage' ? (
                                <span className="text-[#00A859]">{p.value}% (نسبة مئوية)</span>
                              ) : (
                                <span className="text-[#D4A373]">{p.value} ل.س (خصم ثابت)</span>
                              )}
                            </td>
                            <td className="p-3">
                              {isBurned ? (
                                <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                  <span>🔴</span> مستعمل / محروق
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                  <span>🟢</span> فعال وجاهز
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[#FAEDCD]/80">
                              {p.isOneTime !== false ? 'مرة واحدة فقط' : `حتى ${p.maxUses} مرات`}
                            </td>
                            <td className="p-3 font-mono text-xs text-[#D4A373]">
                              {p.usedAt ? (
                                <span className="text-amber-400 font-bold">{p.usedAt}</span>
                              ) : isBurned ? (
                                <span className="text-rose-400">سابقاً</span>
                              ) : (
                                <span className="text-emerald-400/80">لم يستهلك بعد</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleCopyCode(p.id, p.code)}
                                  className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                                    isCopied
                                      ? 'bg-[#00A859] text-white shadow-xs'
                                      : 'bg-[#2D2926] hover:bg-[#3D332A] text-[#FAEDCD]'
                                  }`}
                                  title="نسخ الكود"
                                >
                                  {isCopied ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                      <span>تم!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-[#00A859]" />
                                      <span>نسخ</span>
                                    </>
                                  )}
                                </button>

                                {!isBurned && (
                                  <button
                                    onClick={() => burnPromoCode(p.code)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-95"
                                    title="حرق الكود فوراً"
                                  >
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>حرق 🔥</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => deletePromoCode(p.id)}
                                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-1.5 rounded-lg cursor-pointer transition-colors"
                                  title="حذف الكود"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1814] border border-[#D4A373] rounded-3xl p-6 max-w-lg w-full space-y-4 text-right my-8 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between border-b border-[#3D332A] pb-3">
              <h3 className="font-bold text-base text-[#FAEDCD]">
                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد إلى القائمة'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-[#FAEDCD]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* IMAGE UPLOAD & PREVIEW SECTION */}
              <div className="space-y-2 bg-[#26201B] p-4 rounded-2xl border border-[#3D332A]">
                <label className="block text-xs font-bold text-[#D4A373]">صورة المنتج والمعاينة</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Thumbnail Preview */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#181512] border border-[#D4A373]/40 flex-shrink-0 flex items-center justify-center relative group">
                    {prodImageUrl ? (
                      <img src={prodImageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-[#D4A373]/40" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* File Upload Button */}
                    <label className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة من جهازك (ملف)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSingleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowPresetGallery(!showPresetGallery)}
                      className="w-full bg-[#3D332A] hover:bg-[#4D4238] text-[#FAEDCD] text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>{showPresetGallery ? 'إخفاء معرض الصور الجاهزة' : 'اختر من معرض الصور عالية الجودة'}</span>
                    </button>
                  </div>
                </div>

                {/* Preset Gallery Picker */}
                {showPresetGallery && (
                  <div className="mt-3 p-2 bg-[#181512] rounded-xl border border-[#3D332A] max-h-48 overflow-y-auto scrollbar-thin">
                    <p className="text-[11px] text-[#D4A373] font-bold mb-2">اضغط على صورة لتطبيقها واستخراج اسم المنتج تلقائياً:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRESET_STOCK_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProdImageUrl(preset.url);
                            if (!prodNameAr.trim()) setProdNameAr(preset.nameAr);
                            if (!prodNameEn.trim()) setProdNameEn(preset.nameEn);
                            setProdCat(preset.categoryId);
                            setProdPrice(preset.price);
                          }}
                          className="group relative rounded-lg overflow-hidden border border-[#3D332A] hover:border-[#00A859] transition-all cursor-pointer h-16 text-right"
                        >
                          <img src={preset.url} alt={preset.nameAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/60 p-1 flex items-end">
                            <span className="text-[9px] font-bold text-white line-clamp-1">{preset.nameAr}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] text-[#FAEDCD]/70 mb-1">أو أدخل رابط صورة مباشر (Image URL):</label>
                  <input
                    type="text"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#181512] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#D4A373]">القسم</label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-[11px] text-[#00A859] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة / تعديل قسم جديد</span>
                  </button>
                </div>
                <select
                  value={prodCat}
                  onChange={(e) => setProdCat(e.target.value as CategoryId)}
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr} {cat.isHidden ? '(مخفي عن الزبائن)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-1">اسم المنتج بالعربي</label>
                  <input
                    type="text"
                    required
                    value={prodNameAr}
                    onChange={(e) => setProdNameAr(e.target.value)}
                    placeholder="مثال: آيس كورتادو بيري"
                    className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4A373] mb-1">الاسم بالإنجليزي</label>
                  <input
                    type="text"
                    required
                    value={prodNameEn}
                    onChange={(e) => setProdNameEn(e.target.value)}
                    placeholder="e.g. Iced Cortado Berry"
                    className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">السعر (ر.س)</label>
                <input
                  type="number"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">الوصف</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="وصف مشهي للمنتج..."
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] h-16"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">المكونات (مفصولة بـ فاصلة ,)</label>
                <input
                  type="text"
                  value={prodIngredients}
                  onChange={(e) => setProdIngredients(e.target.value)}
                  placeholder="إسبريسو, حليب كامل الدسم, ثلج"
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                />
              </div>

              {/* Product Sizes / Variants Management (مثل: عادي / دبل) */}
              <div className="bg-[#221C17] p-3.5 rounded-2xl border border-[#3D332A] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4A373] flex items-center gap-1.5 font-['Cairo']">
                    <Layers className="w-4 h-4 text-[#00A859]" />
                    <span>خيارات الأحجام وأسعارها (مثل: عادي / دبل):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setProdSizes([...prodSizes, { name: '', price: prodPrice || 70 }])}
                    className="text-[11px] bg-[#00A859]/20 text-[#00A859] border border-[#00A859]/40 px-2.5 py-1 rounded-lg hover:bg-[#00A859] hover:text-white transition-all font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة حجم +</span>
                  </button>
                </div>

                {prodSizes.length === 0 ? (
                  <div className="text-center py-3 text-xs text-[#FAEDCD]/50 border border-dashed border-[#3D332A] rounded-xl">
                    لا توجد أحجام مضافة حالياً.{' '}
                    <button 
                      type="button"
                      onClick={() => setProdSizes([{ name: 'عادي', price: prodPrice || 70 }, { name: 'دبل', price: Math.round((prodPrice || 70) * 1.4) }])}
                      className="text-[#00A859] underline font-bold mx-1 cursor-pointer"
                    >
                      إضافة "عادي" و "دبل" تلقائياً
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                    {prodSizes.map((sz, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#181512] p-2 rounded-xl border border-[#3D332A]">
                        <div className="flex-1">
                          <span className="text-[10px] text-[#D4A373] block mb-0.5">اسم الحجم / الخيار</span>
                          <input
                            type="text"
                            value={sz.name}
                            onChange={(e) => {
                              const updated = [...prodSizes];
                              updated[idx].name = e.target.value;
                              setProdSizes(updated);
                            }}
                            placeholder="مثال: عادي، دبل..."
                            className="w-full bg-[#26201B] border border-[#3D332A] rounded-lg px-2.5 py-1.5 text-xs text-[#FAEDCD] font-bold"
                          />
                        </div>

                        <div className="w-28">
                          <span className="text-[10px] text-[#D4A373] block mb-0.5">السعر (ل.س)</span>
                          <input
                            type="number"
                            value={sz.price}
                            onChange={(e) => {
                              const updated = [...prodSizes];
                              updated[idx].price = Number(e.target.value);
                              setProdSizes(updated);
                              if (idx === 0) setProdPrice(Number(e.target.value));
                            }}
                            className="w-full bg-[#26201B] border border-[#3D332A] rounded-lg px-2 py-1.5 text-xs text-[#FAEDCD] font-mono font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setProdSizes(prodSizes.filter((_, i) => i !== idx));
                          }}
                          className="text-rose-400 hover:text-rose-300 p-2 mt-4 cursor-pointer"
                          title="حذف هذا الخيار"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#3D332A]">
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 bg-[#00A859] hover:bg-[#008A48] active:scale-95 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSavingProduct ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري حفظ المنتج...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ المنتج المخصص</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-[#26201B] hover:bg-[#322A23] active:scale-95 text-[#FAEDCD] font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BULK MULTI-IMAGE PRODUCT UPLOAD MODAL --- */}
      {showBulkModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1814] border border-[#D4A373] rounded-3xl p-6 max-w-2xl w-full space-y-4 text-right my-8 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex items-center justify-between border-b border-[#3D332A] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#FAEDCD] flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#D4A373]" />
                  <span>رفع مجموعة صور منتجات دفعة واحدة (Bulk Upload)</span>
                </h3>
                <p className="text-xs text-[#FAEDCD]/60">حدد صور المنتجات من جهازك وسيتم استخراج أسمائها تلقائياً وإضافتها للقائمة</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-[#FAEDCD]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bulk File Selection Dropzone */}
            <div className="border-2 border-dashed border-[#D4A373]/40 hover:border-[#00A859] rounded-2xl p-6 text-center bg-[#26201B]/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-[#D4A373] mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-[#FAEDCD] mb-1">اختر عدة صور منتجات من جهازك (PNG, JPG, WEBP)</p>
              <p className="text-[11px] text-[#FAEDCD]/60 mb-3">يمكنك تحديد 1 إلى 20 صورة في المرة الواحدة</p>
              
              <label className="inline-flex items-center gap-2 bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all">
                <FileUp className="w-4 h-4" />
                <span>اختر الملفات والصور الآن</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBulkFilesSelected}
                  className="hidden"
                />
              </label>
            </div>

            {/* Default Category and Price selection for bulk */}
            {bulkItems.length > 0 && (
              <div className="bg-[#26201B] p-3 rounded-2xl border border-[#3D332A] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#D4A373]">تم تحميل ({bulkItems.length}) صور منتجات:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#FAEDCD]/80">القسم الموحد:</span>
                    <select
                      value={defaultBulkCategory}
                      onChange={(e) => {
                        const cat = e.target.value as CategoryId;
                        setDefaultBulkCategory(cat);
                        setBulkItems(bulkItems.map(item => ({ ...item, categoryId: cat })));
                      }}
                      className="bg-[#181512] text-[#FAEDCD] border border-[#3D332A] rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="cold">مشروبات باردة ❄️</option>
                      <option value="hot">مشروبات ساخنة ☕</option>
                      <option value="desserts">حلويات طازجة 🍰</option>
                      <option value="special">خلطات خاصة ✨</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#FAEDCD]/80">السعر الموحد:</span>
                    <input
                      type="number"
                      value={defaultBulkPrice}
                      onChange={(e) => {
                        const pr = Number(e.target.value);
                        setDefaultBulkPrice(pr);
                        setBulkItems(bulkItems.map(item => ({ ...item, price: pr })));
                      }}
                      className="w-16 bg-[#181512] text-[#FAEDCD] border border-[#3D332A] rounded-lg px-2 py-1 outline-none text-center"
                    />
                    <span className="text-[#FAEDCD]/80">ر.س</span>
                  </div>
                </div>
              </div>
            )}

            {/* List of uploaded bulk items */}
            {bulkItems.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                {bulkItems.map((item, idx) => (
                  <div key={item.id} className="bg-[#221C17] p-3 rounded-xl border border-[#3D332A] flex items-center justify-between gap-3">
                    <img src={item.imageUrl} alt={item.nameAr} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <input
                        type="text"
                        value={item.nameAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBulkItems(bulkItems.map(b => b.id === item.id ? { ...b, nameAr: val } : b));
                        }}
                        placeholder="اسم المنتج بالعربي"
                        className="bg-[#181512] border border-[#3D332A] rounded-lg px-2.5 py-1.5 text-xs text-[#FAEDCD]"
                      />

                      <select
                        value={item.categoryId}
                        onChange={(e) => {
                          const cat = e.target.value as CategoryId;
                          setBulkItems(bulkItems.map(b => b.id === item.id ? { ...b, categoryId: cat } : b));
                        }}
                        className="bg-[#181512] border border-[#3D332A] rounded-lg px-2 py-1.5 text-xs text-[#FAEDCD]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameAr}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBulkItems(bulkItems.map(b => b.id === item.id ? { ...b, price: val } : b));
                          }}
                          className="w-full bg-[#181512] border border-[#3D332A] rounded-lg px-2 py-1.5 text-xs text-[#FAEDCD]"
                        />
                        <span className="text-[10px] text-[#D4A373]">ر.س</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBulkItems(bulkItems.filter(b => b.id !== item.id))}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="إزالة هذه الصورة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-[#3D332A]">
              <button
                type="button"
                disabled={bulkItems.length === 0 || isSavingBulk}
                onClick={handleSaveBulkProducts}
                className={`flex-1 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  bulkItems.length > 0 && !isSavingBulk
                    ? 'bg-[#00A859] hover:bg-[#008A48] text-white shadow-md cursor-pointer'
                    : 'bg-[#3D332A] text-[#FAEDCD]/40 cursor-not-allowed'
                }`}
              >
                {isSavingBulk ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ {bulkItems.length} منتجات...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ وإضافة جميع المنتجات المرفوعة ({bulkItems.length})</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="bg-[#26201B] hover:bg-[#322A23] text-[#FAEDCD] font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition-all active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD PROMO CODE MODAL --- */}
      {showPromoModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1814] border border-[#D4A373] rounded-3xl p-6 max-w-sm w-full space-y-4 text-right">
            <h3 className="font-bold text-base text-[#FAEDCD]">إنشاء كود خصم جديد</h3>

            <form onSubmit={handleSavePromo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">رمز الكود (Promo Code)</label>
                <input
                  type="text"
                  required
                  value={codeStr}
                  onChange={(e) => setCodeStr(e.target.value.toUpperCase())}
                  placeholder="مثال: SUMMER30"
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">نوع الخصم</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ر.س)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">قيمة الخصم</label>
                <input
                  type="number"
                  required
                  value={discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">الحد الأقصى لمرات الاستخدام</label>
                <input
                  type="number"
                  required
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#26201B] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isSavingPromo}
                  className="flex-1 bg-[#D4A373] hover:bg-[#c39262] text-[#181512] font-bold text-xs py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingPromo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#181512] border-t-transparent rounded-full animate-spin" />
                      <span>جاري حفظ الكود...</span>
                    </>
                  ) : (
                    <span>حفظ الكود</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="bg-[#26201B] hover:bg-[#322A23] text-[#FAEDCD] font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY MANAGEMENT MODAL --- */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* --- BULK PROMO GENERATOR MODAL --- */}
      <BulkPromoModal
        isOpen={showBulkPromoModal}
        onClose={() => setShowBulkPromoModal(false)}
      />

      {/* --- SOUND TONE SELECTOR MODAL --- */}
      {showSoundSelectorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-[#1E1B18] text-slate-900 dark:text-[#FAEDCD] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-amber-500/20 relative space-y-5 text-right my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00A859] text-white flex items-center justify-center font-bold shadow-md">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cairo'] font-black text-lg text-slate-900 dark:text-white">
                    اختيار نغمة تنبيه الطلبات الواردة 🎵
                  </h3>
                  <p className="text-xs text-[#00A859] font-bold">
                    اختر النغمة المناسبة وسيتم حفظها وتطبيقها فوراً دائماً
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSoundSelectorModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 font-bold flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>يمكنك الاستماع لأي نغمة قبل اختيارها، بمجرد تحديد النغمة تحفظ تلقائياً ولا تحتاج لإعادة ضبطها كل مرة!</span>
            </div>

            {/* Tones List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {SOUND_TONES.map((tone) => {
                const isSelected = currentSoundTone === tone.id;
                return (
                  <div
                    key={tone.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#E6F6ED] dark:bg-[#00A859]/20 border-[#00A859] shadow-sm ring-1 ring-[#00A859]'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-base">{tone.icon}</span>
                          <span>{tone.nameAr}</span>
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-black bg-[#00A859] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>المعتمدة</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {tone.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/10">
                      {/* Play preview */}
                      <button
                        type="button"
                        onClick={() => playOrderAlertSound(tone.id)}
                        className="flex-1 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="استماع للنغمة"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#00A859]" />
                        <span>استماع 🔊</span>
                      </button>

                      {/* Select tone */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSoundTone(tone.id);
                          setCurrentSoundTone(tone.id);
                          playOrderAlertSound(tone.id);
                        }}
                        className={`flex-1 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#00A859] text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-white/10 hover:bg-[#00A859] hover:text-white text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{isSelected ? 'تثبيت وحفظ ✅' : 'اختيار هذه النغمة'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSoundSelectorModal(false)}
                className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
              >
                حفظ وإغلاق 💾
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- PROMO CARD GENERATOR MODAL --- */}
      <PromoCardGeneratorModal
        isOpen={showPromoCardModal}
        onClose={() => setShowPromoCardModal(false)}
      />

      {/* --- PROMO CODES RESTORE / IMPORT JSON MODAL --- */}
      {showImportPromoModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1814] border border-[#00A859]/50 rounded-3xl p-6 max-w-xl w-full space-y-4 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#FAEDCD]">
                <Upload className="w-5 h-5 text-[#00A859]" />
                <h3 className="font-black text-sm sm:text-base">استيراد واسترجاع أكواد الخصم (JSON)</h3>
              </div>
              <button
                onClick={() => {
                  setShowImportPromoModal(false);
                  setImportPromoText('');
                  setImportFeedback(null);
                }}
                className="text-[#FAEDCD]/60 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#FAEDCD]/70 leading-relaxed">
              يمكنك رفع ملف نسخة احتياطية <span className="font-mono text-amber-300">.json</span> أو لصق مصفوفة الأكواد هنا مباشرة. سيتم دمج الأكواد بشكل ذكي وتحديث السيرفر والسحابة فوراً بدون تكرار وبحفظ كامل للأكواد المحروقة.
            </p>

            {/* File Upload Input */}
            <div>
              <label className="block text-xs font-bold text-[#D4A373] mb-1.5">رفع ملف نسخة احتياطية (.json):</label>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) {
                        setImportPromoText(content);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full text-xs text-[#FAEDCD]/80 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#00A859] file:text-white hover:file:bg-[#008A48] cursor-pointer bg-[#26201B] border border-white/10 rounded-xl p-2"
              />
            </div>

            {/* Textarea for JSON */}
            <div>
              <label className="block text-xs font-bold text-[#D4A373] mb-1.5">أو الصق كود JSON مباشرة:</label>
              <textarea
                value={importPromoText}
                onChange={(e) => setImportPromoText(e.target.value)}
                placeholder='[ { "code": "CRT-500", "type": "percentage", "value": 15, "maxUses": 1, "isUsed": false } ]'
                rows={6}
                className="w-full bg-[#26201B] border border-white/10 rounded-xl p-3 text-xs font-mono text-emerald-300 outline-none focus:border-[#00A859] dir-ltr text-left"
              />
            </div>

            {/* Feedback Message */}
            {importFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  importFeedback.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {importFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{importFeedback.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowImportPromoModal(false);
                  setImportPromoText('');
                  setImportFeedback(null);
                }}
                className="bg-[#2D2926] hover:bg-[#3D332A] text-[#FAEDCD] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!importPromoText.trim()) {
                    setImportFeedback({ type: 'error', message: 'يرجى لصق بيانات الأكواد أو رفع ملف JSON' });
                    return;
                  }
                  try {
                    let parsed = JSON.parse(importPromoText.trim());
                    if (!Array.isArray(parsed) && parsed.promoCodes && Array.isArray(parsed.promoCodes)) {
                      parsed = parsed.promoCodes;
                    }
                    if (!Array.isArray(parsed) || parsed.length === 0) {
                      setImportFeedback({ type: 'error', message: 'صيغة البيانات غير صحيحة. يجب أن تكون مصفوفة أكواد JSON' });
                      return;
                    }

                    const sanitized: PromoCode[] = parsed.map((p: any, idx: number) => ({
                      id: p.id || `imported-${Date.now()}-${idx}`,
                      code: String(p.code || p.id || `IMP-${idx}`).toUpperCase().trim(),
                      type: p.type || p.discountType || 'percentage',
                      value: Number(p.value ?? p.discountValue ?? 10),
                      minOrderValue: Number(p.minOrderValue || 0),
                      maxDiscountAmount: p.maxDiscountAmount ? Number(p.maxDiscountAmount) : undefined,
                      isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
                      isOneTime: typeof p.isOneTime === 'boolean' ? p.isOneTime : true,
                      maxUses: Number(p.maxUses || 1),
                      usedCount: Number(p.usedCount || 0),
                      isUsed: Boolean(p.isUsed || (p.usedCount && p.maxUses && p.usedCount >= p.maxUses)),
                      usedAt: p.usedAt,
                      groupName: p.groupName || 'مستورد',
                      expiryDate: p.expiryDate || '2027-12-31',
                      createdAt: p.createdAt || new Date().toISOString()
                    }));

                    addPromoCodesBulk(sanitized);
                    const syncRes = await syncAllPromoCodesAcrossCloud();
                    setImportFeedback({ 
                      type: 'success', 
                      message: `تم استيراد وحفظ ${sanitized.length} كود بنجاح ومزامنتها سحابياً! الإجمالي في النظام: ${syncRes.totalCount} كود.` 
                    });
                    setTimeout(() => {
                      setShowImportPromoModal(false);
                      setImportPromoText('');
                      setImportFeedback(null);
                    }, 2000);
                  } catch (err: any) {
                    setImportFeedback({ type: 'error', message: `خطأ في قراءة ملف JSON: ${err.message}` });
                  }
                }}
                className="bg-[#00A859] hover:bg-[#008A48] text-white text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                تأكيد الاستيراد والمزامنة السحابية 🚀
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
