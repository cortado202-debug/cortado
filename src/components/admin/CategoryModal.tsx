import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Category } from '../../types';
import { 
  X, 
  Plus, 
  Layers, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Coffee, 
  Snowflake, 
  Cake, 
  Sparkles, 
  Flame, 
  Heart, 
  Cookie, 
  GlassWater,
  Check,
  AlertCircle
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryHidden,
    products 
  } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [iconName, setIconName] = useState('Coffee');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const ICON_OPTIONS = [
    { name: 'Coffee', label: 'قهوة ☕', icon: Coffee },
    { name: 'Snowflake', label: 'بارد ❄️', icon: Snowflake },
    { name: 'Cake', label: 'كيك وحلويات 🍰', icon: Cake },
    { name: 'Sparkles', label: 'مميز ✨', icon: Sparkles },
    { name: 'Flame', label: 'ساخن 🔥', icon: Flame },
    { name: 'Cookie', label: 'بسكويت / مخبوزات 🍪', icon: Cookie },
    { name: 'GlassWater', label: 'عصائر / مياه 🥤', icon: GlassWater },
    { name: 'Heart', label: 'مفضل ❤️', icon: Heart },
  ];

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setNameAr(cat.nameAr);
    setNameEn(cat.nameEn);
    setIconName(cat.iconName || 'Coffee');
    setDescriptionAr(cat.descriptionAr || '');
    setMsg(null);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setNameAr('');
    setNameEn('');
    setIconName('Coffee');
    setDescriptionAr('');
    setMsg(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      setMsg({ type: 'error', text: 'يرجى إدخال اسم القسم بالعربي' });
      return;
    }

    if (editingId) {
      updateCategory({
        id: editingId,
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || nameAr.trim(),
        iconName,
        descriptionAr: descriptionAr.trim()
      });
      setMsg({ type: 'success', text: 'تم تعديل بيانات القسم بنجاح! ✓' });
    } else {
      const generatedId = `cat-${Date.now()}`;
      addCategory({
        id: generatedId,
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim() || nameAr.trim(),
        iconName,
        descriptionAr: descriptionAr.trim()
      });
      setMsg({ type: 'success', text: 'تمت إضافة القسم الجديد بنجاح! 🎉' });
    }

    handleResetForm();
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = (cat: Category) => {
    const count = products.filter(p => p.categoryId === cat.id).length;
    if (count > 0) {
      if (!confirm(`تنبيه: يوجد ${count} منتجات مرتبطة بهذا القسم. هل أنت أُكيد من حذف القسم؟ (يمكنك بدلاً من ذلك إخفاؤه)`)) {
        return;
      }
    } else {
      if (!confirm(`هل أنت أُكيد من حذف قسم "${cat.nameAr}"؟`)) {
        return;
      }
    }
    deleteCategory(cat.id);
    setMsg({ type: 'success', text: `تم حذف قسم "${cat.nameAr}"` });
    setTimeout(() => setMsg(null), 2500);
  };

  const renderIcon = (name: string) => {
    const opt = ICON_OPTIONS.find(i => i.name === name);
    if (!opt) return <Coffee className="w-4 h-4 text-[#00A859]" />;
    const IconComp = opt.icon;
    return <IconComp className="w-4 h-4 text-[#00A859]" />;
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#1C1814] border border-[#D4A373] rounded-3xl p-5 sm:p-6 max-w-2xl w-full space-y-5 text-right text-[#FAEDCD] max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#3D332A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00A859]/20 border border-[#00A859]/40 flex items-center justify-center text-[#00A859]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Cairo'] font-bold text-base text-[#FAEDCD]">
                إدارة أقسام القائمة (Categories)
              </h3>
              <p className="text-[11px] text-[#FAEDCD]/60">
                إضافة قسم جديد، تعديل الأسماء والأيقونات، أو إخفاء/إظهار الأقسام
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

        {msg && (
          <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}>
            {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* ADD / EDIT FORM */}
        <form onSubmit={handleSaveCategory} className="bg-[#26201B] p-4 rounded-2xl border border-[#3D332A] space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#3D332A] pb-2">
            <span className="text-xs font-bold text-[#D4A373]">
              {editingId ? 'تعديل بيانات القسم المحدد' : 'إضافة قسم جديد للقائمة'}
            </span>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[11px] text-amber-400 hover:underline font-bold"
              >
                إلغاء التعديل
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#D4A373] mb-1">اسم القسم بالعربي *</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: عصائر طبيعية"
                className="w-full bg-[#181512] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] outline-none focus:border-[#00A859]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D4A373] mb-1">الاسم بالإنجليزي</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Fresh Juices"
                className="w-full bg-[#181512] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] outline-none focus:border-[#00A859]"
              />
            </div>
          </div>

          {/* ICON SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-[#D4A373] mb-1.5">اختر أيقونة للقسم</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = iconName === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIconName(opt.name)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00A859] text-white border-[#00A859] shadow-xs'
                        : 'bg-[#181512] text-[#FAEDCD]/80 border-[#3D332A] hover:border-[#00A859]/50'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#00A859]'}`} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D4A373] mb-1">الوصف (اختياري)</label>
            <input
              type="text"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف مختصر للأصناف التابعة لهذا القسم..."
              className="w-full bg-[#181512] border border-[#3D332A] rounded-xl px-3 py-2 text-xs text-[#FAEDCD] outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'حفظ تعديلات القسم' : 'إضافة القسم الجديد'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-[#3D332A] text-[#FAEDCD] font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        {/* EXISTING CATEGORIES LIST */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-[#D4A373]">الأقسام الحالية المعتمدة ({categories.length})</h4>
          <div className="grid grid-cols-1 gap-2.5">
            {categories.map((cat) => {
              const prodCount = products.filter(p => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    cat.isHidden
                      ? 'bg-[#181512]/60 border-rose-900/30 opacity-70'
                      : 'bg-[#221C17] border-[#3D332A] hover:border-[#00A859]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#181512] border border-[#3D332A] flex items-center justify-center flex-shrink-0">
                      {renderIcon(cat.iconName)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#FAEDCD]">{cat.nameAr}</span>
                        <span className="text-[10px] font-mono text-[#D4A373]/70">({cat.nameEn})</span>
                        {cat.isHidden ? (
                          <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            مخفي عن الزبائن
                          </span>
                        ) : (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            ظاهر في القائمة
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#FAEDCD]/60 mt-0.5">
                        عدد المنتجات: <strong className="text-[#00A859]">{prodCount}</strong> منتج
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-1.5">
                    {/* Toggle Hide/Show */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryHidden(cat.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        cat.isHidden
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900'
                      }`}
                      title={cat.isHidden ? 'إظهار القسم في القائمة' : 'إخفاء القسم عن الزبائن'}
                    >
                      {cat.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{cat.isHidden ? 'إظهار' : 'إخفاء'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 rounded-xl bg-[#2D2926] hover:bg-[#3D332A] text-[#D4A373] border border-[#3D332A] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="تعديل القسم"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-all cursor-pointer"
                      title="حذف القسم"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
