import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { X, CheckCircle2, ShoppingBag, ShieldCheck, Truck, Utensils, MapPin, Tag, Sparkles, PackageCheck, CreditCard, Wallet, Info, MailOpen, Heart } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { 
    cart, 
    isCheckoutOpen, 
    toggleCheckout, 
    createOrder, 
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    toggleProfileModal,
    settings,
    setActiveCategory
  } = useStore();

  const activePaymentMethods = (settings.paymentMethods || []).filter(pm => pm.isActive);

  const [deliveryType, setDeliveryType] = useState<'table' | 'takeaway' | 'delivery'>('takeaway');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    settings.branches && settings.branches.length > 0 ? settings.branches[0].id : ''
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    activePaymentMethods.length > 0 ? activePaymentMethods[0].id : ''
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ isSuccess: boolean; text: string } | null>(null);

  const isFormValid = customerName.trim().length >= 2 && customerPhone.trim().length >= 5;

  const handleClose = () => {
    setCompletedOrder(null);
    toggleCheckout(false);
  };

  // Auto close and redirect to home after 4 seconds when order is completed
  useEffect(() => {
    if (completedOrder) {
      const timer = setTimeout(() => {
        handleClose();
        if (settings.branches && settings.branches.length > 0) {
          // Reset view to main category
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [completedOrder]);

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.selectedSize ? item.selectedSize.price : item.product.price;
    return acc + (itemPrice * item.quantity);
  }, 0);
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const deliveryFee = (deliveryType === 'delivery' && settings.deliveryFee) ? settings.deliveryFee : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const selectedPayment = activePaymentMethods.find(pm => pm.id === selectedPaymentId) || activePaymentMethods[0];

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMsg({ isSuccess: res.success, text: res.message });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.isStoreOpen === false) {
      alert('عذراً، المتجر مغلق حالياً ولا استقبال للطلبات في الوقت الحالي.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) return;

    const selectedBranch = settings.branches?.find(b => b.id === selectedBranchId);
    const branchNote = selectedBranch ? `[الفرع: ${selectedBranch.name}]` : '';
    const finalNotes = [branchNote, notes].filter(Boolean).join(' - ');

    const newOrder = createOrder({
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined,
      deliveryType,
      paymentMethodName: selectedPayment?.name || 'دفع نقدي',
      notes: finalNotes || undefined
    });

    setCompletedOrder(newOrder);
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden text-right"
        >
          {/* BACKDROP CLICK */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0" 
            onClick={handleClose} 
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col border border-[#E8E2D8] shadow-2xl text-right my-auto overflow-hidden relative z-10"
          >
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00A859]" />
            <h2 className="font-['Cairo'] font-bold text-base sm:text-lg text-[#2A2118]">
              {completedOrder ? 'تم استلام طلبك بنجاح' : 'إتمام الطلب والدفع'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#2A2118]/60 hover:text-[#2A2118] p-1.5 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {completedOrder ? (
            /* ANIMATED ENVELOPE OPENING & THANK YOU LETTER */
            <div className="text-center space-y-4 py-2">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative w-24 h-24 mx-auto flex items-center justify-center"
              >
                {/* Glowing aura */}
                <div className="absolute inset-0 bg-[#00A859]/20 rounded-full blur-xl animate-pulse" />
                
                {/* Envelope background */}
                <motion.div 
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-20 h-20 bg-gradient-to-tr from-[#00A859] to-[#008A48] rounded-2xl shadow-xl flex items-center justify-center text-white border-2 border-emerald-300"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
                  >
                    <MailOpen className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md">
                    <Heart className="w-4 h-4 fill-amber-950" />
                  </span>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-b from-[#FAF8F5] to-white p-5 rounded-2xl border-2 border-[#00A859]/30 text-right space-y-3 shadow-lg relative overflow-hidden"
              >
                <div className="text-center pb-2 border-b border-[#E8E2D8]">
                  <h3 className="font-['Cairo'] font-extrabold text-xl text-[#2A2118] mb-1 flex items-center justify-center gap-1.5">
                    <span>رسالة شكر من كورتادو كافيه</span>
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                  </h3>
                  <p className="text-xs font-bold text-[#00A859]">
                    شكراً لك أ. {completedOrder.customerName}! ❤️
                  </p>
                </div>

                <p className="text-xs font-bold text-[#2A2118] leading-relaxed text-center bg-[#E6F6ED] p-3 rounded-xl border border-[#00A859]/20">
                  تم استلام طلبك بنجاح وسيتم التواصل معك مباشرة فور تجهيز الطلب! ☕✨
                </p>

                <div className="text-xs space-y-1.5 text-[#523621] pt-1">
                  <div className="flex justify-between">
                    <span>رقم الطلب:</span>
                    <strong className="text-[#00A859] font-mono font-black">{completedOrder.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>طريقة الاستلام:</span>
                    <strong className="text-[#2A2118]">
                      {completedOrder.deliveryType === 'table' ? 'تقديم للطاولة 🍽️' : completedOrder.deliveryType === 'takeaway' ? 'سفري / سفري 🛍️' : 'توصيل للموقع 🚚'}
                    </strong>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#2A2118] pt-1 border-t border-[#E8E2D8]">
                    <span>الإجمالي:</span>
                    <strong className="text-[#00A859]">{completedOrder.total ? completedOrder.total.toFixed(2) : completedOrder.totalAmount} ل.س</strong>
                  </div>
                </div>

                {/* 4-Second Auto Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] text-[#523621]/70 mb-1">
                    <span>جاري تحويلك للصفحة الرئيسية تلقائياً...</span>
                    <span>4 ثوانٍ</span>
                  </div>
                  <div className="w-full bg-[#E8E2D8] h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                      className="bg-[#00A859] h-full"
                    />
                  </div>
                </div>
              </motion.div>

              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="w-full bg-[#2A2118] hover:bg-[#00A859] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>الانتقال فوراً للصفحة الرئيسية</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* Delivery Type Options */}
              <div>
                <label className="block text-xs font-bold text-[#2A2118] mb-2 flex items-center justify-between">
                  <span>اختر طريقة الاستلام:</span>
                  {deliveryType === 'delivery' && settings.deliveryFee && (
                    <span className="text-[11px] font-extrabold text-[#00A859] bg-[#E6F6ED] px-2 py-0.5 rounded-full border border-[#00A859]/30">
                      + رسوم التوصيل ({settings.deliveryFee} ل.س)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('takeaway')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      deliveryType === 'takeaway'
                        ? 'bg-[#00A859] text-white border-[#00A859] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#2A2118] border-[#E8E2D8] hover:border-[#00A859]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>استلام سفري</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer relative ${
                      deliveryType === 'delivery'
                        ? 'bg-[#00A859] text-white border-[#00A859] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#2A2118] border-[#E8E2D8] hover:border-[#00A859]'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>توصيل للموقع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('table')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      deliveryType === 'table'
                        ? 'bg-[#00A859] text-white border-[#00A859] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#2A2118] border-[#E8E2D8] hover:border-[#00A859]'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>طاولة بالداخل</span>
                  </button>
                </div>
              </div>

              {/* Branch Picker if multiple branches exist */}
              {settings.branches && settings.branches.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#2A2118] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>اختر الفرع / الموقع المطلوب:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {settings.branches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`p-2.5 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                          selectedBranchId === b.id
                            ? 'bg-[#00A859]/10 border-[#00A859] ring-2 ring-[#00A859]/20'
                            : 'bg-[#FAF8F5] border-[#E8E2D8] hover:border-[#00A859]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#2A2118]">{b.name}</p>
                          {b.isMain && (
                            <span className="text-[9px] bg-[#00A859] text-white px-1.5 py-0.2 rounded font-bold">الرئيسي</span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#523621] truncate mt-0.5">{b.address}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#2A2118] mb-1">
                    الاسم الكامل <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسمك هنا"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D8] focus:border-[#00A859] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2118] outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A2118] mb-1">
                    رقم الجوال <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="050xxxxxxx"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D8] focus:border-[#00A859] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2118] outline-none text-right font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A2118] mb-1">
                    البريد الإلكتروني (اختياري):
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D8] focus:border-[#00A859] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2118] outline-none text-right font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A2118] mb-1">
                    ملاحظات الطلب أو الحساسيات:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: بدون سكر، حليب لوز بديل..."
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D8] focus:border-[#00A859] rounded-xl px-3.5 py-2 text-xs text-[#2A2118] outline-none text-right resize-none"
                  />
                </div>
              </div>

              {/* PROMO CODE DISCOUNT FIELD */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2D8] space-y-2">
                <label className="block text-xs font-bold text-[#2A2118] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#00A859]" />
                    <span>كود الخصم أو القسيمة (اختر أو أدخل كودك):</span>
                  </span>
                  {appliedPromo && (
                    <span className="text-[11px] font-extrabold text-[#00A859]">
                      تم تخصيم (-{appliedPromo.discountAmount.toFixed(2)} ل.س)
                    </span>
                  )}
                </label>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-[#E6F6ED] border border-[#00A859]/40 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00A859]" />
                      <span className="font-mono font-black text-sm text-[#00A859]">{appliedPromo.promo.code}</span>
                      <span className="text-[#2A2118] text-[11px] font-bold">
                        ({appliedPromo.promo.type === 'percentage' ? `${appliedPromo.promo.value}% خصم` : `${appliedPromo.promo.value} ل.س خصم`})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removePromoCode();
                        setPromoMsg(null);
                      }}
                      className="text-rose-600 hover:text-rose-700 text-[11px] font-bold underline cursor-pointer active:scale-95"
                    >
                      إلغاء الكود
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoMsg(null);
                      }}
                      placeholder="أدخل رمز كود الخصم (مثال: CORTADO20)"
                      className="flex-1 bg-white border border-[#E8E2D8] focus:border-[#00A859] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2A2118] outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-[#2A2118] hover:bg-[#00A859] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
                    >
                      تطبيق الكود
                    </button>
                  </div>
                )}

                {promoMsg && (
                  <p className={`text-[11px] font-bold mt-1 ${promoMsg.isSuccess ? 'text-[#00A859]' : 'text-rose-600'}`}>
                    {promoMsg.text}
                  </p>
                )}
              </div>

              {/* PAYMENT METHODS SECTION */}
              {activePaymentMethods.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <label className="block text-xs font-bold text-[#2A2118] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#00A859]" />
                      <span>اختر طريقة الدفع المناسبة:</span>
                    </span>
                    <span className="text-[10px] text-[#008A48] font-bold">متاحة ومباشرة</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activePaymentMethods.map((pm) => {
                      const isSelected = selectedPaymentId === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setSelectedPaymentId(pm.id)}
                          className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[#E6F6ED] border-[#00A859] ring-2 ring-[#00A859]/30 text-[#00A859] shadow-2xs'
                              : 'bg-[#FAF8F5] border-[#E8E2D8] text-[#2A2118] hover:border-[#00A859]/50'
                          }`}
                        >
                          {pm.imageUrl ? (
                            <img
                              src={pm.imageUrl}
                              alt={pm.name}
                              className="w-10 h-10 object-cover rounded-xl border border-[#E8E2D8] shrink-0"
                            />
                          ) : (
                            <CreditCard className="w-5 h-5 text-[#00A859] shrink-0" />
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-extrabold font-['Cairo'] text-[#2A2118] leading-tight">{pm.name}</span>
                            <span className="text-[11px] text-[#523621] opacity-80 leading-snug mt-0.5">{pm.details}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* DISPLAY INSTRUCTIONS FOR SELECTED PAYMENT (WITHOUT BOX / RECTANGLE) */}
                  {selectedPayment && (
                    <div className="pt-2 px-1 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[#00A859] font-bold text-xs">
                        <Info className="w-4 h-4 shrink-0 text-[#00A859]" />
                        <span>تعليمات الدفع ({selectedPayment.name}):</span>
                      </div>
                      <p className="text-[12px] text-[#2A2118] font-medium leading-relaxed pr-5">
                        {selectedPayment.details}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E2D8] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#523621]">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold">{subtotal.toFixed(2)} ل.س</span>
                </div>
                {deliveryType === 'delivery' && settings.deliveryFee ? (
                  <div className="flex justify-between text-[#00A859] font-bold">
                    <span>رسوم خدمة التوصيل:</span>
                    <span className="font-mono">+{settings.deliveryFee.toFixed(2)} ل.س</span>
                  </div>
                ) : null}
                {discount > 0 && (
                  <div className="flex justify-between text-[#00A859] font-bold">
                    <span>خصم كود الخصم:</span>
                    <span className="font-mono">-{discount.toFixed(2)} ل.س</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#E8E2D8]">
                  <span className="font-bold text-[#2A2118]">الإجمالي النهائي للطلب:</span>
                  <span className="font-black text-xl text-[#00A859] font-['Cairo']">{total.toFixed(2)} ل.س</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                onClick={(e) => {
                  if (!isFormValid) {
                    e.preventDefault();
                    alert('⚠️ يرجى إدخال معلومات الاسم ورقم الجوال لتأكيد الطلب');
                  }
                }}
                className={`w-full font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isFormValid 
                    ? 'bg-[#00A859] hover:bg-[#008A48] text-white shadow-md active:scale-98' 
                    : 'bg-slate-300 text-slate-600 hover:bg-slate-350 opacity-90 border border-slate-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isFormValid ? 'تأكيد الطلب الآن' : 'تأكيد الطلب الآن (يرجى تعبئة البيانات)'}</span>
              </button>

            </form>
          )}
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
