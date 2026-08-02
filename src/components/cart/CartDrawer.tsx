import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Ticket } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    appliedPromo,
    removePromoCode,
    toggleCheckout,
    settings 
  } = useStore();

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-hidden text-right"
        >
          {/* Dark Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => toggleCart(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.div 
              initial={{ x: "-100%", opacity: 0.8 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-screen max-w-md bg-white border-r border-[#E8E2D8] shadow-2xl flex flex-col justify-between text-right pointer-events-auto relative z-10"
            >
          
          {/* CART HEADER */}
          <div className="p-5 border-b border-[#E8E2D8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00A859]" />
              <h2 className="font-['Cairo'] font-bold text-xl text-[#2A2118]">
                سلة المشتريات
              </h2>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="text-[#2A2118]/60 hover:text-[#2A2118] p-2 hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* CLOSED STORE ALERT BANNER INSIDE CART */}
          {settings.isStoreOpen === false && (
            <div className="bg-rose-50 border-b border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping mt-1 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">🔴 المتجر مغلق حالياً:</p>
                <p>{settings.closedStoreNotice || 'استقبال الطلبات موقوف مؤقتاً. لا يمكن إتمام الطلب الآن.'}</p>
              </div>
            </div>
          )}

          {/* CART ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#E6F6ED] border border-[#00A859]/30 flex items-center justify-center text-[#00A859] mb-4 shadow-2xs">
                  <ShoppingBag className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-base font-bold text-[#2A2118] mb-1">السلة فارغة حالياً</p>
                <p className="text-xs text-[#523621] mb-6">تصفح المنتجات وأضف مشروباتك وحلوياتك المفضلة</p>
                <button
                  onClick={() => toggleCart(false)}
                  className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  تصفح القائمة
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#523621] pb-2 border-b border-[#E8E2D8]">
                  <span>المنتجات المحددة ({cart.length})</span>
                  <button onClick={clearCart} className="text-rose-600 hover:underline cursor-pointer font-bold">
                    تفريغ السلة
                  </button>
                </div>

                {cart.map((item) => {
                  const itemPrice = item.selectedSize ? item.selectedSize.price : item.product.price;
                  return (
                    <div 
                      key={`${item.product.id}-${item.selectedSize?.name || 'default'}`}
                      className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8E2D8] flex items-center gap-3"
                    >
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.nameAr} 
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8E2D8]" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-[#2A2118] truncate">
                            {item.product.nameAr}
                          </h4>
                          {item.selectedSize && (
                            <span className="text-[10px] font-bold text-[#008A48] bg-[#E6F6ED] border border-[#00A859]/20 px-1.5 py-0.5 rounded">
                              {item.selectedSize.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-sans font-medium text-[#008A48]">
                          {item.product.nameEn}
                        </p>
                        <p className="text-xs text-[#00A859] font-black mt-0.5">
                          {itemPrice} ل.س
                        </p>
                      </div>

                      {/* Quantity Adjustment Controls */}
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-[#E8E2D8] shadow-2xs">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize?.name)}
                          className="text-[#2A2118] hover:text-[#00A859] p-1 cursor-pointer"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-xs font-bold text-[#2A2118] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize?.name)}
                          className="text-[#2A2118] hover:text-[#00A859] p-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* CART FOOTER / SUMMARY & CHECKOUT */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#FAF8F5] border-t border-[#E8E2D8] space-y-4">
              
              {/* Promo Applied Banner */}
              {appliedPromo && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    <span>تم تطبيق كود الخصم: <strong>{appliedPromo.promo.code}</strong></span>
                  </div>
                  <button onClick={removePromoCode} className="text-rose-600 hover:underline cursor-pointer font-bold">
                    إلغاء
                  </button>
                </div>
              )}

              {/* Price Calculation */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#523621]">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} ل.س</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>قيمة الخصم:</span>
                    <span>-{discount.toFixed(2)} ل.س</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#00A859] pt-2 border-t border-[#E8E2D8]">
                  <span>الإجمالي النهائي:</span>
                  <span>{total.toFixed(2)} ل.س</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                id="checkout-proceed-btn"
                disabled={settings.isStoreOpen === false}
                onClick={() => {
                  if (settings.isStoreOpen === false) {
                    window.dispatchEvent(new CustomEvent('show-closed-store-modal'));
                    return;
                  }
                  toggleCart(false);
                  toggleCheckout(true);
                }}
                className={`w-full font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all ${
                  settings.isStoreOpen === false
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed border border-gray-400/30'
                    : 'bg-[#00A859] hover:bg-[#008A48] text-white cursor-pointer'
                }`}
              >
                {settings.isStoreOpen === false ? (
                  <span>المتجر مغلق حالياً (الطلبات متوقفة)</span>
                ) : (
                  <>
                    <span>متابعة الشراء وتأكيد الطلب</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          )}

        </motion.div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
