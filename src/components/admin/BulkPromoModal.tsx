import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { 
  X, 
  Sparkles, 
  Building2, 
  Hash, 
  Percent, 
  DollarSign, 
  Calendar, 
  Check, 
  FileSpreadsheet,
  AlertCircle,
  Zap,
  Layers
} from 'lucide-react';

interface BulkPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkPromoModal: React.FC<BulkPromoModalProps> = ({ isOpen, onClose }) => {
  const { addPromoCodesBulk } = useStore();

  const [groupName, setGroupName] = useState('جامعة دمشق');
  const [prefix, setPrefix] = useState('DAMAS-');
  const [count, setCount] = useState<number>(100);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountVal, setDiscountVal] = useState<number>(15);
  const [codePattern, setCodePattern] = useState<'random' | 'sequential'>('random');
  const [maxUses, setMaxUses] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [isDone, setIsDone] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  if (!isOpen) return null;

  // Auto update prefix when groupName changes if prefix is empty or default
  const handleGroupNameChange = (val: string) => {
    setGroupName(val);
    if (!prefix || prefix.length <= 4) {
      const clean = val.trim().replace(/\s+/g, '').substring(0, 5).toUpperCase();
      if (clean) {
        setPrefix(clean + '-');
      }
    }
  };

  const generatePreviewCodes = (): string[] => {
    const samples: string[] = [];
    const cleanPrefix = (prefix || 'CRT-').trim().toUpperCase();
    for (let i = 1; i <= Math.min(3, count); i++) {
      if (codePattern === 'sequential') {
        const numStr = String(i).padStart(3, '0');
        samples.push(`${cleanPrefix}${numStr}`);
      } else {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        samples.push(`${cleanPrefix}${rand}`);
      }
    }
    return samples;
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (count < 1 || count > 1000) {
      alert('يرجى إدخال عدد بين 1 و 1000 كود');
      return;
    }

    const cleanPrefix = (prefix || 'CRT-').trim().toUpperCase();
    const newPromos = [];
    const existingCodesSet = new Set<string>();

    for (let i = 1; i <= count; i++) {
      let codeStr = '';
      if (codePattern === 'sequential') {
        const numStr = String(i).padStart(count > 999 ? 4 : 3, '0');
        codeStr = `${cleanPrefix}${numStr}`;
      } else {
        let attempts = 0;
        do {
          const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
          codeStr = `${cleanPrefix}${rand}`;
          attempts++;
        } while (existingCodesSet.has(codeStr) && attempts < 50);
      }
      existingCodesSet.add(codeStr);

      newPromos.push({
        code: codeStr,
        type: discountType,
        value: discountVal,
        maxUses: maxUses,
        expiryDate: expiryDate,
        isActive: true,
        isOneTime: maxUses === 1,
        groupName: groupName.trim() || 'دفعة أكواد بالجملة'
      });
    }

    addPromoCodesBulk(newPromos);
    setGeneratedCount(newPromos.length);
    setIsDone(true);
  };

  const sampleCodes = generatePreviewCodes();

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#1C1814] border border-[#D4A373] rounded-3xl p-5 sm:p-6 max-w-xl w-full space-y-5 text-right text-[#FAEDCD] max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#3D332A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00A859]/20 border border-[#00A859]/40 flex items-center justify-center text-[#00A859]">
              <Zap className="w-5 h-5 text-[#00A859]" />
            </div>
            <div>
              <h3 className="font-['Cairo'] font-bold text-base sm:text-lg text-[#FAEDCD]">
                مولّد الأكواد بالجملة (Bulk Coupon Generator)
              </h3>
              <p className="text-[11px] text-[#FAEDCD]/60">
                توليد 100+ كود خصم دفعة واحدة وتسميتها باسم المدرسة أو الجامعة أو الجمعية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#FAEDCD]/60 hover:text-white p-1 hover:bg-[#26201B] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          /* SUCCESS SCREEN */
          <div className="bg-[#221C17] border border-[#00A859]/50 p-6 rounded-2xl text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 bg-[#00A859]/20 border border-[#00A859] rounded-full flex items-center justify-center mx-auto text-[#00A859]">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-emerald-400">
              تم توليد {generatedCount} كود خصم بنجاح! 🎉
            </h4>
            <p className="text-xs text-[#FAEDCD]/80 leading-relaxed">
              تمت إضافة الأكواد بنجاح إلى جدول القسائم تحت اسم جهة: <strong className="text-[#D4A373]">{groupName}</strong>.
              يمكنك الآن رؤيتها في الجدول أو تصديرها إلى ملف Excel 📊.
            </p>

            <div className="flex gap-2 pt-2 justify-center">
              <button
                type="button"
                onClick={() => setIsDone(false)}
                className="bg-[#2D2926] hover:bg-[#3D332A] text-[#FAEDCD] font-bold text-xs py-2.5 px-4 rounded-xl border border-[#3D332A] cursor-pointer"
              >
                توليد دفعة جديدة ⚡
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-md"
              >
                إغلاق وفتح القائمة
              </button>
            </div>
          </div>
        ) : (
          /* GENERATION FORM */
          <form onSubmit={handleGenerate} className="space-y-4">

            {/* GROUP NAME & INSTITUTION */}
            <div>
              <label className="block text-xs font-bold text-[#D4A373] mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#00A859]" />
                <span>اسم الجهة / المدرسة / الجامعة / الجمعية *</span>
              </label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => handleGroupNameChange(e.target.value)}
                placeholder="مثال: جامعة دمشق / مدرسة السلام / جمعية الأمل"
                className="w-full bg-[#26201B] border border-[#3D332A] focus:border-[#00A859] rounded-xl px-3.5 py-2.5 text-xs text-[#FAEDCD] outline-none"
              />
              <p className="text-[10px] text-[#FAEDCD]/50 mt-1">
                سيظهر هذا الاسم بجانب كل كود في الجدول لمنع الاختلاط ومعرفة مصدر كل كود.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PREFIX */}
              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>بادئة الرمز (Prefix)</span>
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. UNIV-"
                  className="w-full bg-[#26201B] border border-[#3D332A] focus:border-[#00A859] rounded-xl px-3 py-2 text-xs font-mono text-[#FAEDCD] outline-none dir-ltr text-right"
                />
              </div>

              {/* COUNT */}
              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>عدد الأكواد المطلوبة</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full bg-[#26201B] border border-[#3D332A] focus:border-[#00A859] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#FAEDCD] outline-none"
                  />
                  <div className="flex gap-1">
                    {[50, 100, 200].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                          count === n ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-[#26201B] border-[#3D332A] text-[#FAEDCD]/70 hover:text-white'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* DISCOUNT TYPE & VALUE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#26201B] p-3 rounded-2xl border border-[#3D332A]">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">نوع الخصم</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      discountType === 'percentage' 
                        ? 'bg-[#00A859] text-white border-[#00A859]' 
                        : 'bg-[#1C1814] border-[#3D332A] text-[#FAEDCD]/60'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>نسبة مئوية %</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      discountType === 'fixed' 
                        ? 'bg-[#D4A373] text-[#181512] border-[#D4A373]' 
                        : 'bg-[#1C1814] border-[#3D332A] text-[#FAEDCD]/60'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>مبلغ ثابت</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">
                  قيمة الخصم {discountType === 'percentage' ? '(%)' : '(ل.س)'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  className="w-full bg-[#1C1814] border border-[#3D332A] focus:border-[#00A859] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#FAEDCD] outline-none"
                />
              </div>
            </div>

            {/* CODE PATTERN & USAGE LIMIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1">صيغة الأكواد</label>
                <select
                  value={codePattern}
                  onChange={(e) => setCodePattern(e.target.value as 'random' | 'sequential')}
                  className="w-full bg-[#26201B] border border-[#3D332A] focus:border-[#00A859] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] outline-none"
                >
                  <option value="random">رموز عشوائية فريدة (مثال: DAMAS-8X4K)</option>
                  <option value="sequential">أرقام متسلسلة مرتبة (مثال: DAMAS-001)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4A373] mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>تاريخ انتهاء الأكواد</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#26201B] border border-[#3D332A] focus:border-[#00A859] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] outline-none font-mono"
                />
              </div>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="bg-[#181512] border border-[#3D332A] p-3 rounded-2xl space-y-1.5">
              <span className="text-[11px] font-bold text-[#D4A373] block">
                معاينة عيّنة الأكواد التي ستُولّد ({count} كود):
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleCodes.map((sc, i) => (
                  <span key={i} className="font-mono text-xs font-bold bg-[#00A859]/15 text-[#00A859] border border-[#00A859]/30 px-2.5 py-1 rounded-lg">
                    {sc}
                  </span>
                ))}
                {count > 3 && (
                  <span className="text-xs text-[#FAEDCD]/50 self-center font-mono">
                    ... و {count - 3} أرقام أخرى
                  </span>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد {count} كود خصم لـ ({groupName || 'المؤسسة'}) وتخزينها</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
