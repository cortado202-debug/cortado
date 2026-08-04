import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../../lib/store';
import { Bell, ShoppingBag, Truck, Utensils, X, ArrowLeft, Volume2 } from 'lucide-react';
import { Order } from '../../types';
import { playOrderAlertSound } from '../../lib/sound';

export const AdminOrderNotification: React.FC = () => {
  const { orders, userSession, settings, toggleAdminModal, setActiveAdminTab } = useStore();
  const [activeNotification, setActiveNotification] = useState<Order | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set(orders.map(o => o.id)));
  const isInitialMount = useRef(true);

  const isAdmin = Boolean(
    userSession && 
    userSession.email && 
    (userSession.email.toLowerCase() === 'cortado202@gmail.com' || 
     userSession.email.toLowerCase() === settings.adminEmail.toLowerCase())
  );

  useEffect(() => {
    // If initial load, record current IDs without notifying
    if (isInitialMount.current) {
      previousOrderIdsRef.current = new Set(orders.map(o => o.id));
      isInitialMount.current = false;
      return;
    }

    // Detect new order that wasn't in previous set
    const previousSet = previousOrderIdsRef.current;
    const newOrder = orders.find(o => !previousSet.has(o.id));

    if (newOrder && isAdmin) {
      setActiveNotification(newOrder);
      playOrderAlertSound();
    }

    // Update set of order IDs
    previousOrderIdsRef.current = new Set(orders.map(o => o.id));
  }, [orders, isAdmin]);

  if (!isAdmin || !activeNotification) return null;

  const handleOpenOrderInAdmin = () => {
    setActiveAdminTab('orders');
    toggleAdminModal(true);
    setActiveNotification(null);
  };

  const getDeliveryBadge = (type: 'table' | 'takeaway' | 'delivery') => {
    switch (type) {
      case 'takeaway':
        return { icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />, label: 'سفري' };
      case 'delivery':
        return { icon: <Truck className="w-3.5 h-3.5 text-blue-600" />, label: 'توصيل' };
      case 'table':
        return { icon: <Utensils className="w-3.5 h-3.5 text-emerald-600" />, label: 'طاولة بالداخل' };
    }
  };

  const badge = getDeliveryBadge(activeNotification.deliveryType);

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-[440px] z-[9999] animate-slideDown">
      <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl border-2 border-[#00A859] relative overflow-hidden text-right">
        
        {/* Animated Background Glow */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00A859]/15 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A859] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00A859]"></span>
            </span>
            <span className="font-['Cairo'] font-black text-sm text-[#00A859] flex items-center gap-1.5">
              <Bell className="w-5 h-5 text-[#00A859] animate-bounce" />
              <span>وصل طلب جديد للمتجر الآن! ☕</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => playOrderAlertSound()}
              className="text-[#00A859] hover:bg-[#E6F6ED] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold border border-[#00A859]/30"
              title="إعادة تشغيل التنبيه الصوتي"
            >
              <Volume2 className="w-4 h-4 text-[#00A859]" />
              <span>إعادة الصوت 🔔</span>
            </button>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="إغلاق الإشعار"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ORDER CONTENT */}
        <div className="py-3.5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono font-black text-base text-[#00A859] bg-[#E6F6ED] px-3 py-1 rounded-xl border border-[#00A859]/30">
              #{activeNotification.id}
            </span>
            <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>

          <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-300 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                العميل: <strong className="text-[#00A859] font-black">{activeNotification.customerName}</strong>
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-slate-900 dir-ltr bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                📱 {activeNotification.customerPhone}
              </span>
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed pt-2 border-t border-slate-300">
              <span className="text-slate-900 font-black">الأصناف المطلوبـة: </span>
              <span className="text-slate-900 font-bold">
                {activeNotification.items.map(i => `${i.nameAr} (×${i.quantity})`).join(' ، ')}
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-1.5 text-slate-900">
              <span className="font-extrabold">المبلغ الإجمالي:</span>
              <span className="font-black text-base sm:text-lg text-[#00A859] font-['Cairo']">
                {activeNotification.total ? activeNotification.total.toFixed(2) : activeNotification.subtotal.toFixed(2)} ل.س
              </span>
            </div>
            
            <span className="text-xs text-amber-950 font-black bg-amber-100 px-3 py-1 rounded-lg border border-amber-400 shadow-2xs">
              قيد الانتظار ⏳
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={handleOpenOrderInAdmin}
            className="flex-1 bg-[#00A859] hover:bg-[#008A48] text-white font-black text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <span>عرض وإدارة الطلب في لوحة التحكم</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveNotification(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-3 rounded-xl cursor-pointer transition-colors border border-slate-200"
          >
            تجاهل
          </button>
        </div>

      </div>
    </div>
  );
};
