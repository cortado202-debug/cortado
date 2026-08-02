import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { Product, ProductSize } from '../../types';
import { SimpleStageCanvas } from '../3d/SimpleStageCanvas';
import { 
  Snowflake, 
  Coffee, 
  Cake, 
  ChevronRight, 
  ChevronLeft, 
  ShoppingBag, 
  Flame, 
  CheckCircle2
} from 'lucide-react';

export const MenuSection: React.FC = () => {
  const { 
    categories, 
    activeCategoryId, 
    setActiveCategory, 
    products, 
    active3DIndex, 
    setActive3DIndex,
    next3DItem, 
    prev3DItem, 
    addToCart,
    settings
  } = useStore();

  const [use3dView, setUse3dView] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);

  const visibleCategories = categories.filter(c => !c.isHidden);
  const currentCategoryProducts = products.filter(p => p.categoryId === activeCategoryId);
  const currentProduct: Product | undefined = currentCategoryProducts[active3DIndex] || currentCategoryProducts[0];

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  const availableSizes: ProductSize[] = React.useMemo(() => {
    if (!currentProduct) return [];
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
      return currentProduct.sizes;
    }
    return [
      { id: 'sz-def-1', name: 'عادي', price: currentProduct.price },
      { id: 'sz-def-2', name: 'دبل', price: Math.round(currentProduct.price * 1.4) }
    ];
  }, [currentProduct]);

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [currentProduct?.id, availableSizes]);

  const activeSize = selectedSize || availableSizes[0] || null;
  const currentPrice = activeSize ? activeSize.price : (currentProduct?.price || 0);

  const handleAddToCartWithFly = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentProduct) return;

    if (settings.isStoreOpen === false) {
      window.dispatchEvent(new CustomEvent('show-closed-store-modal'));
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    window.dispatchEvent(
      new CustomEvent('fly-to-cart', {
        detail: {
          startX,
          startY,
          imageUrl: currentProduct.imageUrl,
          nameAr: currentProduct.nameAr
        }
      })
    );

    addToCart(currentProduct, 1, activeSize || undefined);
  };

  const touchStartX = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingScroll = useRef<boolean>(false);
  const startXScroll = useRef<number>(0);
  const scrollLeftVal = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingScroll.current = true;
    startXScroll.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftVal.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDraggingScroll.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXScroll.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        next3DItem();
      } else {
        prev3DItem();
      }
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'Cake': return <Cake className="w-5 h-5" />;
      case 'Sparkles': return <Coffee className="w-5 h-5" />;
      default: return <Coffee className="w-5 h-5" />;
    }
  };

  const handleCategoryClick = (catId: any) => {
    if (activeCategoryId === catId && isCategoryOpen) {
      setIsCategoryOpen(false);
      return;
    }
    setActiveCategory(catId);
    setActive3DIndex(0);
    setIsCategoryOpen(true);
    setTimeout(() => {
      const itemsSection = document.getElementById('category-items-section');
      if (itemsSection) {
        itemsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const isAnimatedBg = settings.isAnimatedBackgroundEnabled !== false;

  return (
    <section id="menu" className="py-12 sm:py-16 relative overflow-hidden bg-transparent text-[#2A2118]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#00A859]/30 text-[#00733B] text-xs font-bold mb-3 shadow-xs backdrop-blur-xs">
            <Coffee className="w-4 h-4 text-[#00A859]" />
            <span>قائمة كورتادو | Menu</span>
          </div>
          <h2 className="font-['Cairo'] font-extrabold text-3xl sm:text-4xl text-[#2A2118] mb-2 tracking-tight">
            المشروبات والحلويات
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#523621]/80">
            اختر صنفاً لعرض جميع مشروباته وحلوياته
          </p>
        </div>

        {/* --- SLEEK COMPACT CATEGORY BUTTONS (2 COLUMNS GRID ON MOBILE) --- */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2.5 sm:gap-3.5 mb-8 max-w-4xl mx-auto px-2">
          {visibleCategories.map((cat) => {
            const isActive = cat.id === activeCategoryId && isCategoryOpen;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-3.5 sm:px-5 py-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer shadow-2xs active:scale-95 text-center ${
                  isActive 
                    ? 'bg-[#00A859] text-white border-[#00A859] shadow-md shadow-[#00A859]/25 scale-102 ring-2 ring-[#00A859]/30' 
                    : 'bg-[#FAF8F5] hover:bg-[#E6F6ED] text-[#2A2118] border-[#E8E2D8] hover:border-[#00A859]'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-0.5 w-full">
                  <span className={isActive ? 'text-white' : 'text-[#00A859]'}>
                    {getCategoryIcon(cat.iconName)}
                  </span>
                  <span className="font-['Cairo'] font-extrabold text-xs sm:text-sm tracking-tight whitespace-nowrap">
                    {cat.nameAr}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-sans font-bold leading-tight tracking-wide ${
                  isActive ? 'text-white/90' : 'text-[#008A48]'
                }`}>
                  {cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* --- CATEGORY ITEMS SLIDE-DOWN SECTION (ONLY SHOWS ON CATEGORY CLICK) --- */}
        <AnimatePresence>
          {isCategoryOpen && (
            <motion.div 
              id="category-items-section"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mb-8 max-w-5xl mx-auto pt-2 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs sm:text-sm font-extrabold text-[#2A2118] flex items-center gap-2 font-['Cairo']">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A859] animate-pulse" />
                  <span>جميع أصناف ({categories.find(c => c.id === activeCategoryId)?.nameAr})</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#008A48] bg-[#E6F6ED] px-2.5 py-0.5 rounded-full border border-[#00A859]/30">
                    {currentCategoryProducts.length} منتج
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                      className="p-1 rounded-full bg-white border border-[#E8E2D8] text-[#00A859] hover:bg-[#E6F6ED] cursor-pointer shadow-2xs"
                      title="سحب لليمين"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                      className="p-1 rounded-full bg-white border border-[#E8E2D8] text-[#00A859] hover:bg-[#E6F6ED] cursor-pointer shadow-2xs"
                      title="سحب لليسار"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <motion.div
                key={activeCategoryId}
                ref={scrollRef}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className="grid grid-rows-2 grid-flow-col auto-cols-[210px] sm:auto-cols-[235px] gap-3 overflow-x-auto py-2 px-1 touch-pan-x cursor-grab active:cursor-grabbing no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
              >
                {currentCategoryProducts.map((prod, idx) => {
                  const isSelected = idx === active3DIndex;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setActive3DIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all duration-150 text-right cursor-pointer select-none shadow-xs ${
                        isSelected 
                          ? 'bg-[#00A859] text-white border-[#00A859] shadow-md scale-[1.02]' 
                          : 'bg-white/90 hover:bg-[#E6F6ED] text-[#2A2118] border-[#E8E2D8] hover:border-[#00A859]'
                      }`}
                    >
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.nameAr} 
                        loading="eager"
                        decoding="async"
                        className="w-13 h-15 sm:w-15 sm:h-17 rounded-xl object-cover shadow-xs flex-shrink-0 border border-white/80 pointer-events-none" 
                      />
                      <div className="flex flex-col min-w-[100px] max-w-[135px] overflow-hidden pointer-events-none">
                        <span className="text-xs sm:text-sm font-extrabold font-['Cairo'] truncate leading-tight">{prod.nameAr}</span>
                        <span className={`text-[11px] font-sans font-medium truncate ${isSelected ? 'text-white/90' : 'text-[#008A48]'}`}>
                          {prod.nameEn}
                        </span>
                        <span className={`text-xs sm:text-sm font-black mt-1 ${isSelected ? 'text-white' : 'text-[#00A859]'}`}>
                          {prod.price} ل.س
                        </span>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PRODUCT DISPLAY --- */}
        {currentProduct ? (
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* CENTER / MIDDLE VERTICAL PORTRAIT PRODUCT IMAGE DISPLAY */}
              <div 
                className="lg:col-span-7 relative flex flex-col items-center justify-center min-h-[420px] sm:min-h-[500px]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Previous & Next Floating Navigation Arrows */}
                <button
                  onClick={prev3DItem}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-[#00A859] hover:text-[#008A48] hover:scale-110 p-1 transition-all cursor-pointer active:scale-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  title="المنتج السابق"
                >
                  <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>

                <button
                  onClick={next3DItem}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-[#00A859] hover:text-[#008A48] hover:scale-110 p-1 transition-all cursor-pointer active:scale-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  title="المنتج التالي"
                >
                  <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
                </button>

                <div className="w-full flex items-center justify-center">
                  {!use3dView ? (
                    /* LARGE TALL VERTICAL PORTRAIT IMAGE */
                    <div className="relative group max-w-sm sm:max-w-md w-full">
                      <div className="relative h-[420px] sm:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#FAF8F5]">
                        <img 
                          key={currentProduct.id}
                          src={currentProduct.imageUrl} 
                          alt={currentProduct.nameAr} 
                          loading="eager"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    /* 3D Canvas View Option */
                    <div className="w-full max-w-md h-[400px]">
                      <SimpleStageCanvas product={currentProduct} />
                    </div>
                  )}
                </div>

                {/* Category Indicator Dots */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {currentCategoryProducts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActive3DIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        idx === active3DIndex ? 'w-5 bg-[#00A859]' : 'w-1.5 bg-[#00A859]/30 hover:bg-[#00A859]/60'
                      }`}
                      title={p.nameAr}
                    />
                  ))}
                </div>
              </div>

              {/* ITEM DETAILS SIDE PANEL */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6 text-right bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-sm">
                
                <div className="transition-all duration-200">
                  {/* Category Tag & Popular Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#00733B] bg-[#E6F6ED] px-3.5 py-1 rounded-full">
                        {categories.find(c => c.id === activeCategoryId)?.nameAr}
                      </span>
                      {currentProduct.isPopular && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>الأكثر مبيعاً</span>
                        </span>
                      )}
                    </div>

                    {/* Arabic Product Title */}
                    <h3 className="font-['Cairo'] font-black text-2xl sm:text-3xl text-[#2A2118] mb-1">
                      {currentProduct.nameAr}
                    </h3>

                    {/* English Product Title */}
                    <p className="text-sm font-sans font-bold text-[#008A48] mb-4 tracking-wide">
                      {currentProduct.nameEn}
                    </p>

                    {/* Price & Calories */}
                    <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-[#E8E2D8]">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[#00A859] font-['Cairo']">
                          {currentPrice}
                        </span>
                        <span className="text-sm font-bold text-[#6F4E37]">ل.س</span>
                        {activeSize && (
                          <span className="text-xs text-[#008A48] bg-[#E6F6ED] border border-[#00A859]/20 px-2 py-0.5 rounded-md font-bold">
                            ({activeSize.name})
                          </span>
                        )}
                      </div>
                      {currentProduct.calories && (
                        <span className="text-xs text-[#6F4E37] bg-[#EFEAE2] px-2.5 py-1 rounded-md font-medium">
                          {currentProduct.calories} سعرة حرارية
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {currentProduct.descriptionAr && (
                      <p className="text-sm text-[#4A3E35] leading-relaxed font-normal mb-4">
                        {currentProduct.descriptionAr}
                      </p>
                    )}

                    {/* Ingredients List - Completely borderless, elegant tags */}
                    <div className="space-y-1.5 mb-5">
                      <h4 className="text-xs font-extrabold text-[#008A48] flex items-center gap-1.5 font-['Cairo']">
                        <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                        <span>المكونات والمواصفات:</span>
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {currentProduct.ingredients && currentProduct.ingredients.length > 0 ? (
                          currentProduct.ingredients.map((ing, i) => (
                            <span 
                              key={i} 
                              className="text-xs text-[#3D2314] font-medium flex items-center gap-1.5 bg-[#F5EFE6]/60 px-2.5 py-1 rounded-full"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]" />
                              {ing}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#6F4E37]">
                            تحضير طازج بمكونات كورتادو الفاخرة
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Size Selector - Pure, borderless elegant pill options without outer rectangle container */}
                    {availableSizes.length > 0 && (
                      <div className="mb-5 space-y-2">
                        <div className="flex items-center justify-between text-xs font-extrabold text-[#2A2118]">
                          <span className="flex items-center gap-1.5 font-['Cairo'] text-[#2A2118]">
                            <span className="w-2 h-2 rounded-full bg-[#00A859]" />
                            اختر الحجم:
                          </span>
                          {activeSize && (
                            <span className="text-[#008A48] font-bold text-xs">
                              المحدد: {activeSize.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {availableSizes.map((sz) => {
                            const isSelected = activeSize?.name === sz.name;
                            return (
                              <button
                                key={sz.id || sz.name}
                                onClick={() => setSelectedSize(sz)}
                                className={`flex-1 py-3 px-4 rounded-full border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#00A859] text-white border-[#00A859] shadow-md shadow-[#00A859]/20 scale-[1.02]'
                                    : 'bg-[#FAF8F5] text-[#2A2118] border-[#E8E2D8] hover:border-[#00A859]/60 hover:bg-[#E6F6ED]/40'
                                }`}
                              >
                                <span className="font-['Cairo'] text-sm font-black">{sz.name}</span>
                                <span className={`font-mono text-xs font-black ${isSelected ? 'text-white' : 'text-[#00A859]'}`}>
                                  {sz.price} ل.س
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                <div className="pt-2 border-t border-[#E8E2D8]">
                  <button
                    id={`add-to-cart-${currentProduct.id}`}
                    onClick={handleAddToCartWithFly}
                    className={`w-full font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer relative overflow-hidden active:scale-[0.98] ${
                      settings.isStoreOpen === false
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 ring-2 ring-rose-400'
                        : 'bg-[#00A859] hover:bg-[#008A48] text-white shadow-[#00A859]/25'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {settings.isStoreOpen === false ? (
                      <span>المتجر مغلق حالياً ☕ (انقر لمزيد من التفاصيل)</span>
                    ) : (
                      <span>إضافة للسلة ({currentPrice} ل.س){activeSize ? ` - ${activeSize.name}` : ''}</span>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="text-center py-12 text-[#6F4E37]">
            لا توجد منتجات متوفرة حالياً في هذا القسم
          </div>
        )}

      </div>
    </section>
  );
};
