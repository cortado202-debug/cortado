import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { 
  X, 
  User, 
  PackageCheck, 
  Clock, 
  Utensils, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Flame, 
  Copy, 
  Phone, 
  Sparkles,
  Coffee,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

export const UserProfileModal: React.FC = () => {
  const { 
    isProfileModalOpen, 
    toggleProfileModal, 
    userSession, 
    setUserSession,
    orders, 
    reorderPastOrder,
    settings
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders strictly related to this user session or created on this device
  const userEmail = userSession?.email?.toLowerCase();
  const userPhone = userSession?.phone?.trim();

  const getLocalOrderIds = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('cortado_my_order_ids') || '[]');
    } catch {
      return [];
    }
  };

  const localOrderIds = getLocalOrderIds();

  // STRICT ORDER PRIVACY FILTERING:
  // A customer MUST ONLY see their OWN orders.
  let filteredOrders = orders.filter(ord => {
    const isMyEmail = Boolean(userEmail && ord.customerEmail?.toLowerCase() === userEmail);
    const isMyPhone = Boolean(userPhone && ord.customerPhone?.trim() === userPhone);
    const isMyLocalOrder = localOrderIds.includes(ord.id);
    const isOwner = isMyEmail || isMyPhone || isMyLocalOrder;

    // Search query match check
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matchId = ord.id.toLowerCase().includes(query);
      const matchPhone = ord.customerPhone?.includes(query);
      const matchName = ord.customerName?.toLowerCase().includes(query);
      if (matchId || matchPhone || matchName) return true;
    }

    if (!isOwner) return false;

    if (activeTab === 'active') {
      return ord.status === 'pending' || ord.status === 'preparing' || ord.status === 'delivering';
    }
    if (activeTab === 'completed') {
      return ord.status === 'delivered' || ord.status === 'completed';
    }

    return true;
  });

  const totalOrdersCount = filteredOrders.length;
  const activeOrdersCount = filteredOrders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'delivering').length;
  const totalSpent = filteredOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'قيد الانتظار ⏳',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
          dot: 'bg-amber-500 animate-pulse'
        };
      case 'preparing':
        return {
          label: 'جاري التحضير والطهي 🍳',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
          dot: 'bg-blue-500 animate-ping'
        };
      case 'delivering':
        return {
          label: 'جاري التوصيل 🚚',
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300',
          dot: 'bg-purple-500 animate-pulse'
        };
      case 'delivered':
        return {
          label: 'تم التسليم 🟢',
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300',
          dot: 'bg-teal-500'
        };
      case 'completed':
        return {
          label: 'مكتمل وجاهز 🏆',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'cancelled':
        return {
          label: 'ملغى ❌',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
          dot: 'bg-rose-500'
        };
      default:
        return {
          label: status,
          bg: 'bg-gray-500/10 border-gray-500/30 text-gray-700 dark:text-gray-300',
          dot: 'bg-gray-500'
        };
    }
  };

  const getDeliveryTypeBadge = (type: 'table' | 'takeaway' | 'delivery') => {
    switch (type) {
      case 'table':
        return { icon: <Utensils className="w-3.5 h-3.5 text-[#00A859]" />, text: 'طاولة بالداخل' };
      case 'takeaway':
        return { icon: <ShoppingBag className="w-3.5 h-3.5 text-[#00A859]" />, text: 'استلام سفري' };
      case 'delivery':
        return { icon: <Truck className="w-3.5 h-3.5 text-[#00A859]" />, text: 'توصيل للموقع' };
    }
  };

  return (
    <AnimatePresence>
      {isProfileModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-4 my-0 text-right"
        >
          {/* BACKDROP CLICK */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={() => toggleProfileModal(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-[#FAF8F5] rounded-3xl max-w-2xl w-full border border-[#E8E2D8] shadow-2xl overflow-hidden text-right my-auto sm:my-6 relative z-10"
          >
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#E6F6ED] border border-[#00A859]/30 flex items-center justify-center text-[#00A859] shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Cairo'] font-bold text-base sm:text-lg text-[#2A2118]">
                الملف الشخصي وطلباتي ☕
              </h2>
              <p className="text-[11px] text-[#523621]">
                متابعة حالة طلباتك، الفرع المختار، وإعادة الطلب مباشرة بنقرة واحدة
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleProfileModal(false)}
            className="text-[#2A2118]/60 hover:text-[#2A2118] p-1.5 hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROFILE BANNER & USER STATS */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E2D8] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2D8] gap-3">
            <div className="flex items-center gap-3">
              {userSession?.photoURL ? (
                <img 
                  src={userSession.photoURL} 
                  alt={userSession.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00A859]" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#00A859] text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {userSession?.name ? userSession.name.charAt(0) : 'ك'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#2A2118] flex items-center gap-1.5 flex-wrap">
                  <span>{userSession?.name || 'مُستخدم كورتادو'}</span>
                  <span className="text-[10px] bg-[#00A859]/10 text-[#00A859] border border-[#00A859]/30 px-2 py-0.5 rounded-full font-bold">
                    {userSession?.isAdmin ? 'إداري 🛡️' : 'عميل متميز ☕'}
                  </span>
                </h3>
                <p className="text-xs text-[#523621] font-mono dir-ltr text-right">
                  {userSession?.email || 'مسجل كزائر للمتجر'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {userSession && (
                <button
                  onClick={() => {
                    setUserSession(null);
                    toggleProfileModal(false);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="تسجيل الخروج من الحساب الحساب"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
              <div className="hidden sm:block text-left pl-2">
                <span className="text-[10px] text-[#523621] block">متجر كورتادو</span>
                <span className="text-xs font-bold text-[#00A859]">Cortado CAFÉ</span>
              </div>
            </div>
          </div>

          {/* QUICK STATS METRICS */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D8]">
              <span className="text-[10px] text-[#523621] block mb-0.5">إجمالي الطلبات</span>
              <strong className="font-extrabold text-sm text-[#2A2118]">{orders.length} طلب</strong>
            </div>
            <div className="bg-[#E6F6ED] p-2.5 rounded-xl border border-[#00A859]/30">
              <span className="text-[10px] text-[#00A859] font-bold block mb-0.5">طلبات جارية الآن</span>
              <strong className="font-extrabold text-sm text-[#00A859]">{activeOrdersCount} طلب</strong>
            </div>
            <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D8]">
              <span className="text-[10px] text-[#523621] block mb-0.5">إجمالي المشتريات</span>
              <strong className="font-extrabold text-sm text-[#00A859] font-mono">{totalSpent.toFixed(0)} ل.س</strong>
            </div>
          </div>
        </div>

        {/* ORDER SEARCH & STATUS TAB FILTER */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#E8E2D8] flex flex-col sm:flex-row gap-2.5 items-center justify-between sticky top-[69px] z-10 shadow-2xs">
          
          {/* SEARCH BOX */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#523621]/60 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الطلب أو الجوال..."
              className="w-full bg-[#FAF8F5] border border-[#E8E2D8] focus:border-[#00A859] rounded-xl pr-9 pl-3 py-1.5 text-xs text-[#2A2118] outline-none"
            />
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E2D8] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#00A859] text-white shadow-xs' : 'text-[#523621] hover:text-[#2A2118]'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active' ? 'bg-[#00A859] text-white shadow-xs' : 'text-[#523621] hover:text-[#2A2118]'
              }`}
            >
              قيد التحضير ({activeOrdersCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'completed' ? 'bg-[#00A859] text-white shadow-xs' : 'text-[#523621] hover:text-[#2A2118]'
              }`}
            >
              المكتملة
            </button>
          </div>

        </div>

        {/* ORDERS LIST - Unified Flow */}
        <div className="p-4 space-y-3.5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-white p-6 rounded-2xl border border-[#E8E2D8]">
              <div className="w-14 h-14 rounded-full bg-[#E6F6ED] text-[#00A859] mx-auto flex items-center justify-center">
                <Coffee className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-[#2A2118]">لا توجد طلبات مطابقة في السجل</h4>
              <p className="text-xs text-[#523621] max-w-sm mx-auto">
                لم نجد أية طلبات سابقة بنفس معايير البحث. يمكنك استعراض المشروبات والحلويات وإجراء طلبك الآن بسهولة!
              </p>
              <button
                onClick={() => toggleProfileModal(false)}
                className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all"
              >
                تصفح قائمة المشروبات والطلب الآن ☕
              </button>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const statusInfo = getStatusDisplay(ord.status);
              const delBadge = getDeliveryTypeBadge(ord.deliveryType);
              const isExpanded = expandedOrderId === ord.id;
              const formattedDate = new Date(ord.createdAt).toLocaleString('ar-SY', {
                dateStyle: 'short',
                timeStyle: 'short'
              });

              return (
                <div 
                  key={ord.id}
                  className="bg-white rounded-2xl border border-[#E8E2D8] shadow-xs overflow-hidden transition-all hover:border-[#00A859]/50"
                >
                  {/* CARD TOP BAR */}
                  <div className="p-3.5 border-b border-[#E8E2D8] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#2A2118] bg-white px-2.5 py-1 rounded-lg border border-[#E8E2D8]">
                        #{ord.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#523621] text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00A859]" />
                        <span>{formattedDate}</span>
                      </span>
                      
                      <button
                        onClick={() => handleCopyOrderId(ord.id)}
                        className="text-[#523621] hover:text-[#00A859] p-1 rounded transition-colors cursor-pointer"
                        title="نسخ رقم الطلب"
                      >
                        {copiedOrderId === ord.id ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CARD BODY DETAILS */}
                  <div className="p-3.5 space-y-3">
                    
                    {/* META BADGES: Delivery Method + Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E8E2D8] flex items-center gap-2">
                        {delBadge.icon}
                        <span className="font-bold text-[#2A2118]">طريقة الاستلام: {delBadge.text}</span>
                      </div>

                      <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E8E2D8] flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#00A859]" />
                        <span className="font-bold text-[#2A2118] truncate">
                          الفرع: {ord.notes?.includes('[الفرع المحدد:') 
                            ? ord.notes.split('[الفرع المحدد:')[1].split(']')[0] 
                            : settings.branches?.[0]?.name || 'فرع حماة الرئيسي'}
                        </span>
                      </div>
                    </div>

                    {/* CUSTOMER CONTACT & NOTES */}
                    <div className="text-xs text-[#523621] space-y-1 bg-[#FAF8F5]/60 p-2.5 rounded-xl border border-[#E8E2D8]/60">
                      <div className="flex justify-between">
                        <span>اسم صاحب الطلب: <strong className="text-[#2A2118]">{ord.customerName}</strong></span>
                        <span className="font-mono" dir="ltr">{ord.customerPhone}</span>
                      </div>
                      {ord.notes && (
                        <p className="text-[11px] text-[#523621]/80 pt-1 border-t border-[#E8E2D8]/50">
                          ملاحظات: {ord.notes}
                        </p>
                      )}
                    </div>

                    {/* ITEMS LIST (ITEMS SUMMARY) */}
                    <div className="border border-[#E8E2D8] rounded-xl overflow-hidden bg-[#FAF8F5]">
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                        className="p-2.5 flex items-center justify-between text-xs font-bold text-[#2A2118] cursor-pointer hover:bg-[#E6F6ED]/50 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-[#00A859]" />
                          <span>المنتجات المطلوبة ({ord.items.length} صنف):</span>
                        </span>
                        <div className="flex items-center gap-1 text-[#00A859]">
                          <span className="text-[11px]">{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Items Details List */}
                      <div className={`p-2.5 space-y-1.5 border-t border-[#E8E2D8] text-xs bg-white ${isExpanded ? 'block' : 'hidden sm:block'}`}>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-b border-[#FAF8F5] last:border-0 pb-1 last:pb-0">
                            <span className="font-bold text-[#2A2118]">
                              {item.nameAr} <span className="text-[#00A859] font-mono font-bold">× {item.quantity}</span>
                            </span>
                            <span className="font-mono text-[#523621]">{(item.price * item.quantity).toFixed(2)} ل.س</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PRICING & REORDER ACTION */}
                    <div className="pt-2 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <div className="text-xs text-right w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-[#523621]">الإجمالي المدفوع:</span>
                          <span className="font-black text-base text-[#00A859] font-['Cairo']">
                            {ord.total ? ord.total.toFixed(2) : ord.subtotal.toFixed(2)} ل.س
                          </span>
                        </div>
                        {ord.promoCodeUsed && (
                          <span className="text-[10px] text-[#00A859] font-bold block">
                            (مُطبّق كود خصم: {ord.promoCodeUsed})
                          </span>
                        )}
                      </div>

                      {/* REORDER DIRECTLY BUTTON */}
                      <button
                        onClick={() => reorderPastOrder(ord)}
                        className="w-full sm:w-auto bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                        title="إضافة كل مكونات هذا الطلب للسلّة والانتقال للدفع فوراً"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>إعادة طلب نفس المنتجات مباشرة 🔄</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 border-t border-[#E8E2D8] bg-white flex items-center justify-between text-xs text-[#523621]">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#00A859]" />
            <span>كورتادو CAFÉ - طلب مباشر وسريع</span>
          </div>
          <div className="flex items-center gap-2">
            {userSession && (
              <button
                onClick={() => {
                  setUserSession(null);
                  toggleProfileModal(false);
                }}
                className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 font-bold px-3 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <button
              onClick={() => toggleProfileModal(false)}
              className="bg-[#2A2118] hover:bg-[#00A859] text-white font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
