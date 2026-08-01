import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { ShieldCheck, CheckCircle2, AlertCircle, Flame, KeyRound, X, Ticket } from 'lucide-react';

export const CouponValidator: React.FC = () => {
  const { userSession, settings, promoCodes, burnPromoCode, isCouponModalOpen, toggleCouponModal } = useStore();
  const [inputCode, setInputCode] = useState('');
  const [checkedPromo, setCheckedPromo] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00A859', '#10B981', '#FF5722', '#6F4E37']
    });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const clean = inputCode.trim().toUpperCase();
    const found = promoCodes.find(p => p.code === clean);

    if (!found) {
      setCheckedPromo(null);
      setFeedback({ success: false, text: 'رمز كود الخصم غير موجود بالنظام' });
      return;
    }

    setCheckedPromo(found);
    if (found.isUsed) {
      setFeedback({ 
        success: false, 
        text: `⚠️ هذا الكود مستخدم بالفعل من قبل بتاريخ (${found.usedAt || 'سابقاً'})` 
      });
    } else {
      setFeedback({ 
        success: true, 
        text: `✅ الكود فعال وصالح للاستخدام! الخصم: ${found.type === 'percentage' ? `${found.value}%` : `${found.value} ل.س`}` 
      });
    }
  };

  const handleBurnCode = (codeStr: string) => {
    const res = burnPromoCode(codeStr);
    setFeedback({ success: res.success, text: res.message });

    if (res.success) {
      triggerConfetti();
      const updated = promoCodes.find(p => p.code === codeStr);
      if (updated) {
        setCheckedPromo({ ...updated, isUsed: true, usedAt: new Date().toLocaleTimeString('ar-SA') });
      }
    }
  };

  return (
    <AnimatePresence>
      {isCouponModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 text-right"
        >
          {/* BACKDROP CLICK */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0" 
            onClick={() => toggleCouponModal(false)} 
          />

          {/* MAIN MODAL CONTENT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-2xl relative overflow-hidden max-w-2xl w-full z-10 space-y-6"
          >
            {/* TOP BADGE & CLOSE BUTTON */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F6ED] text-[#00A859] flex items-center justify-center font-bold shadow-xs">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-['Cairo'] font-extrabold text-lg text-[#2A2118]">
                    لوحة حرق وإدخال أكواد الخصم السريعة
                  </h3>
                  <p className="text-xs text-[#6F4E37]">
                    التحقق من صحة الكوبون وحرقه للطلبات المباشرة فوراً
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => toggleCouponModal(false)}
                className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-rose-50 text-[#2A2118] hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer border border-[#E8E2D8] active:scale-90"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VERIFICATION FORM */}
            <form onSubmit={handleVerifyCode} className="space-y-2">
              <label className="block text-xs font-bold text-[#2A2118] text-right">
                أدخل رمز كود الخصم للتحقق من فعاليته وحرقه:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="أدخل رمز الكود (مثال: CORTADO20)"
                  className="flex-1 bg-[#FAF8F5] border border-[#E8E2D8] focus:border-[#00A859] rounded-xl px-4 py-3 text-sm text-[#2A2118] font-mono uppercase outline-none text-right font-bold"
                />
                <button
                  type="submit"
                  className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>التحقق</span>
                </button>
              </div>
            </form>

            {/* FEEDBACK STATUS */}
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                feedback.success 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  {feedback.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>

                {/* DIRECT BURN ACTION BUTTON */}
                {checkedPromo && !checkedPromo.isUsed && feedback.success && (
                  <button
                    onClick={() => handleBurnCode(checkedPromo.code)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs animate-bounce active:scale-95"
                  >
                    <Flame className="w-4 h-4 fill-white" />
                    <span>حرق الكود الآن 🔥</span>
                  </button>
                )}
              </motion.div>
            )}

            {/* DETAILED CHECKED PROMO CARD */}
            {checkedPromo && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8] text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2A2118]">تفاصيل الكود المفحوص:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    checkedPromo.isUsed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {checkedPromo.isUsed ? 'مستعمل / غير فعال' : 'فعال وجاهز'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#523621] pt-1">
                  <div>الرمز: <strong className="font-mono text-[#00A859]">{checkedPromo.code}</strong></div>
                  <div>الخصم: <strong>{checkedPromo.type === 'percentage' ? `${checkedPromo.value}%` : `${checkedPromo.value} ل.س`}</strong></div>
                  <div>النوع: <strong>{checkedPromo.isOneTime ? 'استخدام لمرة واحدة' : 'متعدد'}</strong></div>
                  <div>تاريخ الاستخدام: <strong>{checkedPromo.usedAt || (checkedPromo.isUsed ? 'سابقاً' : 'لم يستهلك بعد')}</strong></div>
                </div>
              </motion.div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

