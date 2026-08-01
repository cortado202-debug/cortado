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
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-[420px] z-[9999] animate-slideDown">
      <div className="bg-[#2A2118] text-white rounded-2xl p-4 shadow-2xl border-2 border-[#00A859] relative overflow-hidden backdrop-blur-md">
        
        {/* Animated Background Glow */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00A859]/30 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A859] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00A859]"></span>
            </span>
            <span className="font-['Cairo'] font-black text-xs text-[#00A859] tracking-wide flex items-center gap-1">
              <Bell className="w-4 h-4 text-[#00A859] animate-bounce" />
              <span>إشعار إداري: وصل طلب جديد الآن!</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => playOrderAlertSound()}
              className="text-emerald-400 hover:text-emerald-300 px-2 py-1 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-emerald-500/30"
              title="إعادة إعادة تشغيل التنبيه الصوتي"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>إعادة الصوت 🔔</span>
            </button>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="إغلاق الإشعار"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ORDER CONTENT */}
        <div className="py-3 space-y-2 text-right">
          <div className="flex justify-between items-center">
            <span className="font-mono font-black text-sm text-[#00A859] bg-[#00A859]/10 px-2.5 py-0.5 rounded-lg border border-[#00A859]/30">
              #{activeNotification.id}
            </span>
            <span className="text-xs font-bold text-white/90 bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>العميل:</span>
              <span className="text-[#00A859]">{activeNotification.customerName}</span>
              <span className="text-white/60 text-[11px] font-mono dir-ltr">({activeNotification.customerPhone})</span>
            </p>
            <p className="text-white/80 text-[11px] truncate">
              {activeNotification.items.map(i => `${i.nameAr} (×${i.quantity})`).join(' ، ')}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-white/70">المبلغ الإجمالي:</span>
              <span className="font-black text-sm text-[#00A859] font-['Cairo']">
                {activeNotification.total ? activeNotification.total.toFixed(2) : activeNotification.subtotal.toFixed(2)} ل.س
              </span>
            </div>
            
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              قيد الانتظار ⏳
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={handleOpenOrderInAdmin}
            className="flex-1 bg-[#00A859] hover:bg-[#008A48] text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all active:scale-95"
          >
            <span>عرض وإدارة الطلب في لوحة التحكم</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setActiveNotification(null)}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            تجاهل
          </button>
        </div>

      </div>
    </div>
  );
};
