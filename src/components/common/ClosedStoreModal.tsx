import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { AlertTriangle, Coffee, X, Clock, ShoppingBag } from 'lucide-react';

export const ClosedStoreModal: React.FC = () => {
  const { settings, userSession } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If store is closed and user is not admin, auto open modal
    if (settings.isStoreOpen === false && !userSession?.isAdmin) {
      setIsOpen(true);
    } else if (settings.isStoreOpen === true) {
      setIsOpen(false);
    }
  }, [settings.isStoreOpen, userSession?.isAdmin]);

  useEffect(() => {
    const handleShowModal = () => {
      setIsOpen(true);
    };

    window.addEventListener('show-closed-store-modal', handleShowModal);
    return () => {
      window.removeEventListener('show-closed-store-modal', handleShowModal);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-right">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8E2D8] relative overflow-hidden"
        >
          {/* Top Decorative Header */}
          <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="font-['Cairo'] font-extrabold text-xl text-slate-900 mb-2">
              المتجر مغلق حالياً ☕
            </h3>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 my-3 text-right text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
              <p className="font-bold mb-1 flex items-center gap-1.5 text-rose-700">
                <Clock className="w-4 h-4 shrink-0" />
                <span>تنبيه استقبال الطلبات:</span>
              </p>
              <p>
                {settings.closedStoreNotice || 'عذراً، المتجر موقوف عن استقبال طلبات الشراء في الوقت الحالي. يرجى المحاولة لاحقاً فور إعادة فتح المتجر.'}
              </p>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              يسعدنا دائماً تصفحكم لقائمة المشروبات والحلويات، وسنكون بانتظاركم فور إعادة التفعيل!
            </p>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              <span>فهمت ذلك - العودة للمتجر</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
