import React, { useState, useRef } from 'react';
import { X, Download, Plus, Trash2, Sparkles, CreditCard, Check, Copy, Tag, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useStore } from '../../lib/store';
import { PromoCode } from '../../types';

interface PromoCardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardCodeItem {
  id: string;
  code: string;
  discountVal: number;
  discountType: 'percentage' | 'fixed';
  note: string;
}

export const PromoCardGeneratorModal: React.FC<PromoCardGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { settings, promoCodes } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Card Content Customization
  const [cardTheme, setCardTheme] = useState<'emerald' | 'gold' | 'diamond'>('emerald');
  const [cardTitle, setCardTitle] = useState('بطاقة خصم');
  const [cardSubtitle, setCardSubtitle] = useState('عميل مميز');
  const [codeLabelText, setCodeLabelText] = useState('كود خصم');
  const [footerNote, setFooterNote] = useState('يسري في جميع الفروع وعبر الطلب المباشر من التطبيق');

  // Codes List (1 to 5 codes max)
  const [codeItems, setCodeItems] = useState<CardCodeItem[]>([
    {
      id: '1',
      code: 'CORTADO20',
      discountVal: 20,
      discountType: 'percentage',
      note: 'خصم 20% على إجمالي الطلب',
    },
  ]);

  const [showImportDropdown, setShowImportDropdown] = useState(false);

  // Switch Theme & Update Default Headlines automatically if desired
  const handleThemeChange = (newTheme: 'emerald' | 'gold' | 'diamond') => {
    setCardTheme(newTheme);
    if (newTheme === 'emerald') {
      setCardTitle('بطاقة خصم');
      setCardSubtitle('عميل مميز');
      setCodeLabelText('كود خصم');
    } else if (newTheme === 'gold') {
      setCardTitle('بطاقة العميل الذهبي');
      setCardSubtitle('امتياز حصري');
      setCodeLabelText('كود خصم');
    } else if (newTheme === 'diamond') {
      setCardTitle('بطاقة العميل الماسي');
      setCardSubtitle('امتيازات غير محدودة');
      setCodeLabelText('كود الماسي');
    }
  };

  if (!isOpen) return null;

  // Add new code item (up to 5 max)
  const handleAddCode = () => {
    if (codeItems.length >= 5) {
      alert('⚠️ الحد الأقصى للأكواد في البطاقة الواحدة هو 5 أكواد فقط');
      return;
    }
    const nextNum = codeItems.length + 1;
    setCodeItems([
      ...codeItems,
      {
        id: Date.now().toString(),
        code: `CORTADO${nextNum}0`,
        discountVal: 10 * nextNum,
        discountType: 'percentage',
        note: `خصم خاص ${10 * nextNum}%`,
      },
    ]);
  };

  // Remove code item
  const handleRemoveCode = (id: string) => {
    if (codeItems.length <= 1) {
      alert('⚠️ يجب إبقاء كود واحد على الأقل في البطاقة');
      return;
    }
    setCodeItems(codeItems.filter((item) => item.id !== id));
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof CardCodeItem, value: any) => {
    setCodeItems(
      codeItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Import existing promo code from store
  const handleImportPromo = (promo: PromoCode) => {
    if (codeItems.length >= 5) {
      alert('⚠️ الحد الأقصى 5 أكواد. يرجى حذف أحد الأكواد الحالية أولاً');
      return;
    }
    setCodeItems([
      ...codeItems,
      {
        id: Date.now().toString() + Math.random(),
        code: promo.code,
        discountVal: promo.value,
        discountType: promo.type,
        note: promo.type === 'percentage' ? `خصم ${promo.value}%` : `خصم ${promo.value} ر.س`,
      },
    ]);
    setShowImportDropdown(false);
  };

  // Download Card as PNG Image
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3, // High resolution PNG
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `Cortado_${cardTheme}_Discount_Card_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
      alert('حدث خطأ أثناء إنشاء الصورة. يرجى إعادة المحاولة.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Exact Logo URL
  const logoSrc = settings.logoUrl || '/logo.png';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-[#1C1815] text-[#FAEDCD] rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-amber-500/20 relative my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00A859] to-[#006633] text-white flex items-center justify-center font-bold shadow-lg ring-2 ring-amber-400/30">
              <CreditCard className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-['Cairo'] font-black text-lg sm:text-xl text-white flex items-center gap-2">
                <span>إنشاء بطاقة خصومات مصورة (VIP Card)</span>
                <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-400/30 font-bold">
                  تصميم جديد ✨
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                صمم بطاقة خصم طولية أنيقة بالنمط المطلوب (أخضر / ذهبي / ماسي) وتحميلها كصورة فائقة الدقة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: CONTROLS & INPUT FORM (6 Cols) */}
          <div className="lg:col-span-6 space-y-4 text-right">
            
            {/* Card Theme Picker */}
            <div className="bg-[#25201B] p-4 rounded-2xl border border-white/10 space-y-2">
              <label className="text-xs font-bold text-amber-300 block">اختر ثيم ونمط البطاقة 🎨</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('emerald')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cardTheme === 'emerald'
                      ? 'bg-[#00A859] text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>أخضر 🌿</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('gold')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cardTheme === 'gold'
                      ? 'bg-[#D4A373] text-slate-950 border-amber-300 shadow-md ring-2 ring-amber-300/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>ذهبي 🏆</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('diamond')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cardTheme === 'diamond'
                      ? 'bg-gradient-to-r from-cyan-600 to-slate-800 text-white border-cyan-300 shadow-md ring-2 ring-cyan-300/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>ماسي 💎</span>
                </button>
              </div>
            </div>

            {/* Card Headings Input */}
            <div className="bg-[#25201B] p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">عنوان البطاقة</label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    className="w-full bg-[#181512] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00A859]"
                    placeholder="بطاقة خصم"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الصفة / الفرعي</label>
                  <input
                    type="text"
                    value={cardSubtitle}
                    onChange={(e) => setCardSubtitle(e.target.value)}
                    className="w-full bg-[#181512] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A859]"
                    placeholder="عميل مميز"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">عنوان حقل الكود</label>
                <input
                  type="text"
                  value={codeLabelText}
                  onChange={(e) => setCodeLabelText(e.target.value)}
                  className="w-full bg-[#181512] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A859]"
                  placeholder="كود خصم"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">ملاحظة سفلية (اختياري)</label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full bg-[#181512] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00A859]"
                  placeholder="ملاحظة سفلية"
                />
              </div>
            </div>

            {/* CODES LIST MANAGEMENT */}
            <div className="bg-[#25201B] p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#00A859]" />
                  <span>قائمة أكواد الخصم بالبطاقة ({codeItems.length} من 5)</span>
                </span>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowImportDropdown(!showImportDropdown)}
                    className="text-[11px] font-bold text-[#00A859] hover:text-emerald-400 bg-[#00A859]/10 hover:bg-[#00A859]/20 px-2.5 py-1 rounded-lg border border-[#00A859]/30 transition-all cursor-pointer"
                  >
                    📥 استيراد كود من المتجر
                  </button>

                  {/* Import Dropdown Menu */}
                  {showImportDropdown && (
                    <div className="absolute left-0 mt-1 w-64 bg-[#181512] border border-amber-500/30 rounded-2xl p-2 shadow-2xl z-50 max-h-48 overflow-y-auto text-right">
                      <div className="text-[10px] text-slate-400 font-bold px-2 py-1 border-b border-white/10 mb-1">
                        اختر كود لإضافته للبطاقة:
                      </div>
                      {promoCodes.length === 0 ? (
                        <div className="text-xs text-slate-500 p-2 text-center">لا توجد أكواد مسجلة بعد</div>
                      ) : (
                        promoCodes.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleImportPromo(p)}
                            className="w-full text-right p-2 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between text-xs cursor-pointer border-b border-white/5 last:border-none"
                          >
                            <span className="font-mono font-bold text-amber-300">{p.code}</span>
                            <span className="text-emerald-400 font-bold">
                              {p.type === 'percentage' ? `${p.value}%` : `${p.value} ر.س`}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Items Inputs */}
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {codeItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-[#181512] p-3 rounded-xl border border-white/10 relative space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        كود #{index + 1}
                      </span>

                      {codeItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCode(item.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="حذف الكود"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      {/* Code Name */}
                      <div className="col-span-6">
                        <label className="text-[10px] text-slate-400 block mb-0.5">الكود</label>
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => handleUpdateItem(item.id, 'code', e.target.value.toUpperCase())}
                          className="w-full bg-[#25201B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-300 uppercase focus:outline-none focus:border-[#00A859]"
                          placeholder="CORTADO20"
                        />
                      </div>

                      {/* Discount Value */}
                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">الخصم</label>
                        <input
                          type="number"
                          value={item.discountVal}
                          onChange={(e) => handleUpdateItem(item.id, 'discountVal', Number(e.target.value))}
                          className="w-full bg-[#25201B] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#00A859]"
                        />
                      </div>

                      {/* Type */}
                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">النوع</label>
                        <select
                          value={item.discountType}
                          onChange={(e) => handleUpdateItem(item.id, 'discountType', e.target.value)}
                          className="w-full bg-[#25201B] border border-white/10 rounded-lg px-1.5 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[#00A859]"
                        >
                          <option value="percentage">% نسبة</option>
                          <option value="fixed">مبلغ ثابت</option>
                        </select>
                      </div>
                    </div>

                    {/* Note line */}
                    <div>
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => handleUpdateItem(item.id, 'note', e.target.value)}
                        className="w-full bg-[#25201B]/60 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-[#00A859]"
                        placeholder="ملاحظة فرعية لكود الخصم"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Code Button */}
              {codeItems.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddCode}
                  className="w-full py-2 bg-[#00A859]/20 hover:bg-[#00A859]/30 text-[#00A859] hover:text-emerald-300 border border-[#00A859]/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة كود آخر للبطاقة ({codeItems.length}/5)</span>
                </button>
              )}
            </div>

            {/* Action Download Button */}
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="w-full py-3.5 bg-gradient-to-r from-[#00A859] via-[#00C868] to-[#00A859] hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-xl border border-amber-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>جاري إنشاء وتحميل الصورة...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-amber-300" />
                  <span>تحميل البطاقة كصورة عالية الدقة PNG 📥</span>
                </>
              )}
            </button>

          </div>

          {/* COLUMN 2: CARD VISUAL PREVIEW - VERTICAL CARD (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-[#15120F] p-4 sm:p-6 rounded-3xl border border-white/10 shadow-inner min-h-[620px]">
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>معاينة البطاقة الطولية (مطابقة للنماذج)</span>
            </div>

            {/* --- VERTICAL CARD CONTAINER (EXACT STYLING MATCHING USER IMAGES) --- */}
            <div
              ref={cardRef}
              className="w-[320px] sm:w-[340px] min-h-[580px] rounded-[36px] p-6 relative flex flex-col justify-between overflow-hidden text-center dir-rtl select-none shadow-2xl transition-all border border-slate-200/60"
              style={{
                backgroundColor: cardTheme === 'diamond' ? '#EDF4F8' : '#FFFFFF',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 25px rgba(0, 0, 0, 0.08)',
              }}
            >
              
              {/* --- BACKGROUND FINE WAVY LINES SVG --- */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 340 580"
                fill="none"
                preserveAspectRatio="none"
              >
                {/* Theme-based Stroke Color */}
                {(() => {
                  const stroke =
                    cardTheme === 'emerald'
                      ? '#00A859'
                      : cardTheme === 'gold'
                      ? '#D4A373'
                      : '#94A3B8';
                  
                  return (
                    <g opacity={cardTheme === 'diamond' ? '0.6' : '0.75'} stroke={stroke} strokeWidth="1.2">
                      {/* Left side wavy parallel lines */}
                      <path d="M -20 0 C 40 70, 70 140, 20 230 C -30 320, 60 410, 10 580" />
                      <path d="M -10 0 C 50 70, 80 140, 30 230 C -20 320, 70 410, 20 580" />
                      <path d="M 0 0 C 60 70, 90 140, 40 230 C -10 320, 80 410, 30 580" />
                      <path d="M 10 0 C 70 70, 100 140, 50 230 C 0 320, 90 410, 40 580" />
                      <path d="M 20 0 C 80 70, 110 140, 60 230 C 10 320, 100 410, 50 580" />
                      <path d="M 30 0 C 90 70, 120 140, 70 230 C 20 320, 110 410, 60 580" />

                      {/* Right side wavy parallel lines */}
                      <path d="M 360 0 C 300 70, 270 140, 320 230 C 370 320, 280 410, 330 580" />
                      <path d="M 350 0 C 290 70, 260 140, 310 230 C 360 320, 270 410, 320 580" />
                      <path d="M 340 0 C 280 70, 250 140, 300 230 C 350 320, 260 410, 310 580" />
                      <path d="M 330 0 C 270 70, 240 140, 290 230 C 340 320, 250 410, 300 580" />
                      <path d="M 320 0 C 260 70, 230 140, 280 230 C 330 320, 240 410, 290 580" />
                      <path d="M 310 0 C 250 70, 220 140, 270 230 C 320 320, 230 410, 280 580" />
                    </g>
                  );
                })()}
              </svg>

              {/* Diamond Sparkles Texture Background (For Diamond Theme Only) */}
              {cardTheme === 'diamond' && (
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:12px_12px]" />
              )}

              {/* CARD TOP SECTION: CORTADO LOGO */}
              <div className="relative z-10 space-y-2 pt-2">
                
                {/* Logo Frame matching Theme */}
                <div className="flex justify-center">
                  {cardTheme === 'emerald' && (
                    <div className="w-24 h-24 rounded-full bg-[#00A859] p-1 shadow-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={logoSrc}
                        alt="Cortado Cafe"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}

                  {cardTheme === 'gold' && (
                    <div className="w-26 h-26 rounded-full p-1.5 shadow-xl flex items-center justify-center bg-gradient-to-tr from-[#B8860B] via-[#FFEBB0] to-[#9A6825] ring-2 ring-amber-300/60">
                      <div className="w-full h-full rounded-full bg-[#00A859] p-0.5 overflow-hidden flex items-center justify-center">
                        <img
                          src={logoSrc}
                          alt="Cortado Cafe"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {cardTheme === 'diamond' && (
                    <div className="relative flex items-center justify-center">
                      {/* Diamond Polygon Frame */}
                      <div className="w-28 h-28 bg-gradient-to-tr from-[#94A3B8] via-[#F8FAFC] to-[#475569] p-1.5 shadow-2xl flex items-center justify-center clip-diamond">
                        <div className="w-full h-full bg-[#007A40] p-1 flex items-center justify-center clip-diamond">
                          <img
                            src={logoSrc}
                            alt="Cortado Cafe"
                            className="w-full h-full object-cover clip-diamond"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Card Title */}
                <h2
                  className="font-['Cairo'] font-black text-2xl sm:text-3xl tracking-tight mt-3"
                  style={{
                    color:
                      cardTheme === 'emerald'
                        ? '#00A859'
                        : cardTheme === 'gold'
                        ? '#B8860B'
                        : '#334155',
                  }}
                >
                  {cardTitle}
                </h2>

                {/* Subtitle / Role */}
                <p
                  className="font-['Cairo'] font-bold text-base sm:text-lg -mt-1"
                  style={{
                    color:
                      cardTheme === 'emerald'
                        ? '#1E293B'
                        : cardTheme === 'gold'
                        ? '#451A03'
                        : '#475569',
                  }}
                >
                  {cardSubtitle}
                </p>
              </div>

              {/* CARD MIDDLE SECTION: CODES DISPLAY */}
              <div className="relative z-10 my-4 space-y-3 px-2">
                <span className="text-xs font-bold text-slate-600 block mb-1">
                  {codeLabelText}
                </span>

                {codeItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-white border shadow-md relative flex flex-col items-center justify-center"
                    style={{
                      borderColor:
                        cardTheme === 'emerald'
                          ? '#00A859'
                          : cardTheme === 'gold'
                          ? '#D4A373'
                          : '#CBD5E1',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {item.note && (
                      <span className="text-[11px] font-bold text-slate-500 mb-0.5 block">
                        {item.note}
                      </span>
                    )}

                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-wider">
                        {item.code || 'CORTADO'}
                      </span>
                      <span className="text-xs font-extrabold text-[#00A859] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {item.discountType === 'percentage'
                          ? `%${item.discountVal}`
                          : `${item.discountVal} ر.س`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CARD BOTTOM SECTION: FOOTER NOTE ONLY (NO EMAIL OR WEBSITE LINKS) */}
              <div className="relative z-10 pt-2 border-t border-slate-200/80 text-center pb-1">
                <p className="text-[11px] font-bold text-slate-500 leading-snug">
                  {footerNote}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Inline styles for custom diamond clip-path */}
      <style>{`
        .clip-diamond {
          clip-path: polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%);
        }
      `}</style>
    </div>
  );
};

