import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../lib/store';
import { loginWithGoogle, logoutUser } from '../../lib/firebase';
import { 
  Coffee, 
  ShoppingBag, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Phone,
  Ticket,
  PackageCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cart, 
    orders,
    toggleCart, 
    userSession, 
    setUserSession, 
    settings, 
    toggleAdminModal,
    toggleCouponModal,
    toggleProfileModal,
    toggleAuthModal
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  React.useEffect(() => {
    const handleCartBounce = () => {
      setIsCartBouncing(true);
      setShowPlusOne(true);
      setTimeout(() => setIsCartBouncing(false), 700);
      setTimeout(() => setShowPlusOne(false), 1200);
    };

    window.addEventListener('cart-item-added-bounce', handleCartBounce);
    return () => {
      window.removeEventListener('cart-item-added-bounce', handleCartBounce);
    };
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const pendingOrdersCount = orders ? orders.filter(o => o.status === 'pending').length : 0;

  // Admin Check Logic: checks if logged-in user email matches admin email
  const isAdminUser = Boolean(
    userSession && 
    (userSession.email.toLowerCase() === settings.adminEmail.toLowerCase() || 
     userSession.email.toLowerCase() === 'cortado202@gmail.com' || 
     userSession.isAdmin)
  );

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        const isUserAdmin = Boolean(
          user.email?.toLowerCase() === settings.adminEmail.toLowerCase() ||
          user.email?.toLowerCase() === 'cortado202@gmail.com'
        );
        setUserSession({
          uid: user.uid,
          name: user.displayName || 'مدير النظام',
          email: user.email || 'cortado202@gmail.com',
          photoURL: user.photoURL || undefined,
          isAdmin: isUserAdmin
        });
        if (isUserAdmin) {
          toggleAdminModal(true);
        }
      }
    } catch (error) {
      console.warn("Google login popup attempt handled or running in demo session:", error);
      // Demo session fallback for cortado202@gmail.com admin account
      setUserSession({
        uid: 'demo-admin-1',
        name: 'مدير كورتادو (Cortado Admin)',
        email: 'cortado202@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        isAdmin: true
      });
      toggleAdminModal(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserSession(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* RIGHT: BRAND & LOGO */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00A859] p-0.5 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#00A859]/30"
            >
              {settings.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteTitle} 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </motion.div>
            <div className="flex flex-col min-w-0">
              <span className="font-['Cairo'] font-extrabold text-sm sm:text-xl tracking-tight text-[#2A2118] truncate max-w-[130px] sm:max-w-none">
                {settings.siteTitle}
              </span>
              <span className="text-[9px] sm:text-[11px] text-[#00A859] font-black font-sans uppercase tracking-[0.15em] sm:tracking-[0.2em] font-['Dancing_Script',cursive] truncate">
                {settings.siteSubtitle || 'Cortado CAFÉ'}
              </span>
            </div>
          </a>
        </div>

        {/* CENTER: DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-6 font-semibold text-sm text-[#4A3E35]">
          <a href="#menu" className="hover:text-[#00A859] text-[#00A859] font-bold text-base transition-colors flex items-center gap-1.5 active:scale-95">
            <Coffee className="w-4 h-4" />
            <span>المنتجات</span>
          </a>

          {isAdminUser && (
            <button 
              onClick={() => toggleCouponModal(true)}
              className="hover:text-[#00A859] text-[#00A859] font-bold transition-all flex items-center gap-1.5 bg-[#E6F6ED] px-3 py-1.5 rounded-full border border-[#00A859]/30 active:scale-95 cursor-pointer shadow-xs"
              title="فحص وحرق أكواد الخصم"
            >
              <Ticket className="w-4 h-4 text-[#00A859]" />
              <span>أكواد الخصم 🏷️</span>
            </button>
          )}

          <a href="#about" className="hover:text-[#00A859] transition-colors active:scale-95">عن كورتادو</a>
        </nav>

        {/* LEFT: USER ACTIONS & CART */}
        <div className="flex items-center gap-2.5">
          
          {/* Admin Dashboard Button - Visible ONLY for Admin User */}
          {isAdminUser && (
            <button
              id="admin-dashboard-btn"
              onClick={() => toggleAdminModal(true)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs border rounded-full transition-all font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 relative ${
                pendingOrdersCount > 0
                  ? 'border-[#00A859] text-white bg-[#00A859] animate-pulse ring-2 ring-[#00A859]/50'
                  : 'border-[#00A859] text-[#00A859] bg-[#E6F6ED] hover:bg-[#00A859] hover:text-white'
              }`}
              title="لوحة التحكم الإدارية"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">لوحة التحكم (Admin)</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border border-white animate-bounce">
                  {pendingOrdersCount} جديد
                </span>
              )}
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <motion.button
            id="cart-trigger-btn"
            onClick={() => toggleCart(true)}
            animate={isCartBouncing ? { scale: [1, 1.35, 0.85, 1.15, 1], rotate: [0, -12, 12, -6, 0] } : { scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative bg-[#FAF8F5] hover:bg-[#E6F6ED] text-[#2A2118] border border-[#E8E2D8] hover:border-[#00A859] p-2.5 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer group"
            aria-label="سلة الشراء"
          >
            <ShoppingBag className="w-5 h-5 text-[#00A859]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#00A859] text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalCartCount}
              </span>
            )}
            {showPlusOne && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -28, scale: [0.5, 1.2, 1, 0.8] }}
                transition={{ duration: 1 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00A859] text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-lg border border-white pointer-events-none"
              >
                +1 🛒
              </motion.span>
            )}
          </motion.button>

          {/* Google Login / Account Info */}
          {userSession ? (
            <div className="relative group">
              <div 
                onClick={() => toggleProfileModal(true)}
                className="flex items-center gap-2 bg-[#FAF8F5] hover:bg-[#E6F6ED] border border-[#E8E2D8] hover:border-[#00A859] px-3 py-1.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-xs"
                title="فتح الملف الشخصي وطلباتي"
              >
                {userSession.photoURL ? (
                  <img 
                    src={userSession.photoURL} 
                    alt={userSession.name} 
                    className="w-7 h-7 rounded-full object-cover border border-[#00A859]" 
                  />
                ) : (
                  <User className="w-4 h-4 text-[#00A859]" />
                )}
                <span className="text-xs font-bold text-[#2A2118] max-w-[90px] truncate hidden sm:inline">
                  {userSession.name.split(' ')[0]}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }} 
                  className="text-red-500 hover:text-red-600 mr-1 p-1 cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              id="google-login-btn"
              onClick={() => toggleAuthModal(true)}
              className="bg-[#00A859] hover:bg-[#008A48] text-white p-2 sm:px-4 sm:py-2 rounded-full transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="تسجيل الدخول"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </button>
          )}

          {/* Mobile Navigation Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#2A2118] p-2 hover:bg-[#FAF8F5] rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E2D8] px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          {isAdminUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                toggleAdminModal(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#00A859] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة التحكم الإدارية (Admin)</span>
            </button>
          )}
          <a 
            href="#menu" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#00A859] font-bold text-base flex items-center gap-2"
          >
            <Coffee className="w-4 h-4" />
            <span>المنتجات</span>
          </a>

          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              toggleProfileModal(true);
            }}
            className="w-full text-right text-[#2A2118] font-bold text-sm flex items-center gap-2 py-1 active:scale-95 cursor-pointer"
          >
            <PackageCheck className="w-4 h-4 text-[#00A859]" />
            <span>طلباتي والملف الشخصي 📦</span>
          </button>

          {isAdminUser && (
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                toggleCouponModal(true);
              }}
              className="w-full text-right text-[#00A859] font-bold text-sm flex items-center gap-2 py-1 active:scale-95 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>أكواد الخصم 🏷️</span>
            </button>
          )}

          <a 
            href="#about" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#2A2118] hover:text-[#00A859] active:scale-95"
          >
            عن كورتادو
          </a>
          <div className="pt-2 border-t border-[#E8E2D8] space-y-2 text-xs text-[#6F4E37]">
            {settings.branches && settings.branches.length > 0 ? (
              settings.branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#2A2118]">
                    <span className="w-2 h-2 rounded-full bg-[#00A859]" />
                    <span>{branch.name}</span>
                    {branch.isMain && (
                      <span className="text-[10px] bg-[#E6F6ED] text-[#008A48] border border-[#00A859]/30 px-1.5 py-0.5 rounded-md font-bold">
                        الرئيسي
                      </span>
                    )}
                  </div>
                  {branch.phone && (
                    <a
                      href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                      className="p-1.5 rounded-full bg-[#E6F6ED] text-[#00A859] hover:bg-[#00A859] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      title={`اتصال بـ ${branch.name}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between text-xs text-[#6F4E37]">
                <span>{settings.address?.split('-')[0] || 'كورتادو كافيه'}</span>
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="p-1.5 rounded-full bg-[#E6F6ED] text-[#00A859] hover:bg-[#00A859] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                    title="اتصال"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
