import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';
import { DEFAULT_QUICK_LINKS } from '../../data/initialData';
import { 
  X, 
  Info, 
  Coffee, 
  HelpCircle, 
  Phone, 
  MapPin, 
  Globe, 
  BookOpen, 
  ShieldCheck, 
  Network, 
  ChevronLeft, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Mail, 
  Building2,
  Heart,
  Truck,
  Utensils
} from 'lucide-react';

export interface InfoPage {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  content: React.ReactNode;
}

interface InfoModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultTab?: string;
}

export const INFO_PAGES: InfoPage[] = [
  {
    id: 'about',
    title: 'تعريف كورتادو كافيه (About Cortado Café)',
    icon: Info,
    badge: 'الرئيسية',
    content: (
      <div className="space-y-6 text-[#2A2118]">
        <div className="bg-[#E6F6ED] border border-[#00A859]/30 rounded-2xl p-4 sm:p-5 text-right space-y-2">
          <div className="flex items-center gap-2 text-[#00A859] font-black text-lg">
            <Coffee className="w-6 h-6" />
            <span>ما هو Cortado Café؟</span>
          </div>
          <p className="text-sm leading-relaxed text-[#2A2118] font-medium">
            <strong>Cortado Café (كورتادو كافيه)</strong> هو مقهى مختص ومخبز فاخر يقدم تجربة إيطالية وعالمية فريدة لعشاق القهوة الأصيلة والحلويات المبتكرة. نتميز بتقديم أجود أنواع البن المختص المحمص بحرفية، مع التركيز على مشروب الكورتادو الشهير الذي يمثل التوازن الذهبي بين الإسبريسو الغني والحليب المخملي.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
          <div className="bg-white border border-[#E8E2D8] rounded-xl p-4 space-y-2 shadow-2xs">
            <h4 className="font-black text-[#00A859] text-sm flex items-center gap-1.5">
              <Utensils className="w-4 h-4" />
              <span>ماذا نقدم؟</span>
            </h4>
            <ul className="text-xs text-[#523621] space-y-1.5 font-semibold list-disc list-inside">
              <li>مشروبات قهوة مختصة (كورتادو، إسبريسو، لاتيه، V60)</li>
              <li>مشروبات باردة ومنعشة، وسبانيش لاتيه مميز</li>
              <li>تشكيلة واسعة من الحلويات والمخبوزات الطازجة يومياً</li>
              <li>خدمة التوصيل السريع والطلبات السريعة</li>
            </ul>
          </div>

          <div className="bg-white border border-[#E8E2D8] rounded-xl p-4 space-y-2 shadow-2xs">
            <h4 className="font-black text-[#00A859] text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>أين نقع؟</span>
            </h4>
            <p className="text-xs text-[#523621] leading-relaxed font-medium">
              يقع المقر الرئيسي لمقهى كورتادو كافيه في مدينة <strong>Hillsboro</strong> بولاية <strong>Oregon</strong> في <strong>الولايات المتحدة الأمريكية (USA)</strong>، بالإضافة إلى فروعنا المتعددة لخدمة عشاق القهوة.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl p-4 text-right space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00A859]" />
              <span className="font-bold text-sm text-[#2A2118]">الموقع الرسمي لـ Cortado Café:</span>
            </div>
            <a 
              href="https://cortadocafe.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-mono font-bold text-[#00A859] hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#00A859]/30"
            >
              <span>https://cortadocafe.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-[#523621] leading-relaxed">
            هدفنا الدائم هو الارتقاء بثقافة القهوة المختصة وتقديم تجربة ضيافة استثنائية تعكس شغفنا وأصالتنا في كل كوب.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'who-we-are',
    title: 'من نحن (Who We Are)',
    icon: BookOpen,
    badge: 'هويتنا',
    content: (
      <div className="space-y-5 text-[#2A2118] text-right">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <h3 className="font-black text-base text-[#8B5E34] mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>قصة بداية Cortado Café</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#523621] leading-relaxed font-medium">
            بدأ مقهى كورتادو كافيه بشغف حقيقي تجاه القهوة المختصة. انطلقنا من رؤية واضحة لإنشاء مساحة تجمع بين دقة تحضير القهوة وحرارة الضيافة العربية والعالمية.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            <span>لماذا اخترنا اسم Cortado؟</span>
          </h4>
          <p className="text-xs sm:text-sm text-[#523621] leading-relaxed">
            كلمة <strong>Cortado</strong> تأتي من الفعل الإسباني الذي يعني "القص" أو "التخفيف". يعبر مشروب الكورتادو عن التوازن الهندسي الدقيق بين نسبة متساوية من الإسبريسو المكثف والحليب المتبخر الدافئ، مما يقلل حموضة الإسبريسو دون أن يطغى الحليب على طعم القهوة الغني. اخترنا هذا الاسم ليعكس فلسفتنا في تحقيق التوازن المثالي في كل منتج نقدمه.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>ما الذي يميز كورتادو كافيه عن غيره؟</span>
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#523621]">
            <li className="bg-white p-3 rounded-xl border border-[#E8E2D8] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A859] shrink-0" />
              <span>استيراد محاصيل بن عضية 100% عالية التقييم</span>
            </li>
            <li className="bg-white p-3 rounded-xl border border-[#E8E2D8] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A859] shrink-0" />
              <span>تحميص محلي بدرجات دقيقة لإبراز النكهات</span>
            </li>
            <li className="bg-white p-3 rounded-xl border border-[#E8E2D8] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A859] shrink-0" />
              <span>فريق باريستا محترف ومتخصص في فن القهوة</span>
            </li>
            <li className="bg-white p-3 rounded-xl border border-[#E8E2D8] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A859] shrink-0" />
              <span>تجربة طلب سلسة وسريعة أونلاين ومباشرة</span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'services',
    title: 'خدماتنا (Our Services)',
    icon: Utensils,
    badge: 'خدماتنا',
    content: (
      <div className="space-y-5 text-[#2A2118] text-right">
        <p className="text-xs sm:text-sm text-[#523621] leading-relaxed">
          في كورتادو كافيه نسعى لتقديم باقة متكاملة من الخدمات التي تضمن لعملائنا الاستمتاع بأفضل المذاقات وأعلى معايير الخدمة:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E8E2D8] p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#E6F6ED] text-[#00A859] flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#2A2118]">1. مشروبات القهوة المختصة</h4>
            <p className="text-xs text-[#523621] leading-relaxed">
              تحضير جميع أنواع القهوة الحارة والباردة: كورتادو، إسبانيش لاتيه، كابتشينو، فلات وايت، قهوة تقطير V60 وكولد برو.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D8] p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#2A2118]">2. الحلويات والمخبوزات</h4>
            <p className="text-xs text-[#523621] leading-relaxed">
              تشكيلة يومية طازجة من الكرواسان، التشيز كيك، الكوكيز، والحلويات الشرقية المصنوعة بأجود المكونات.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D8] p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#2A2118]">3. خدمة التوصيل السريع</h4>
            <p className="text-xs text-[#523621] leading-relaxed">
              توصيل مباشر وسريع للطلبات إلى المنازل والمكاتب مع الحفاظ على حرارة وجودة المشروبات.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D8] p-4 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00A859] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#2A2118]">4. الطلبات الخاصة وساعات العمل</h4>
            <p className="text-xs text-[#523621] leading-relaxed">
              نستقبل طلبات الفعاليات والاجتماعات الخاصة. نعمل يومياً من 9:00 صباحاً وحتى 2:00 منتصف الليل.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'faq',
    title: 'الأسئلة الشائعة (FAQ)',
    icon: HelpCircle,
    badge: 'أسئلة وأجوبة',
    content: (
      <div className="space-y-4 text-[#2A2118] text-right">
        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-4 space-y-1.5">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>س1: ما هو Cortado Café؟</span>
          </h4>
          <p className="text-xs text-[#523621] leading-relaxed pr-6">
            ج: Cortado Café هو مقهى مختص ومخبز فاخر يقدم أجود أنواع القهوة المختصة والحلويات الطازجة بمستويات عالمية.
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-4 space-y-1.5">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <Globe className="w-4 h-4 shrink-0" />
            <span>س2: ما هو الموقع الرسمي لـ Cortado Café؟</span>
          </h4>
          <p className="text-xs text-[#523621] leading-relaxed pr-6">
            ج: الموقع الرسمي المعتمد هو <strong className="text-[#00A859]">https://cortadocafe.com</strong> حيث يمكنك تصفح القائمة الكاملة والطلب مباشرة.
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-4 space-y-1.5">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <Truck className="w-4 h-4 shrink-0" />
            <span>س3: هل تقدمون خدمة توصيل الطلبات؟</span>
          </h4>
          <p className="text-xs text-[#523621] leading-relaxed pr-6">
            ج: نعم، نوفر خدمة التوصيل السريع إلى عنوانك، كما يمكن اختيار الاستلام المباشر من الفرع.
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-4 space-y-1.5">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>س4: أين يقع مقهى Cortado Café؟</span>
          </h4>
          <p className="text-xs text-[#523621] leading-relaxed pr-6">
            ج: يقع في مدينة Hillsboro بولاية Oregon في الولايات المتحدة الأمريكية (USA)، ولدينا عدة فروع محلية معتمدة.
          </p>
        </div>

        <div className="bg-white border border-[#E8E2D8] rounded-2xl p-4 space-y-1.5">
          <h4 className="font-bold text-sm text-[#00A859] flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" />
            <span>س5: كيف يمكنني التواصل معكم؟</span>
          </h4>
          <p className="text-xs text-[#523621] leading-relaxed pr-6">
            ج: يمكنك التواصل معنا عبر بريدنا الإلكتروني info@cortadocafe.com أو الهاتف المباشر أو عبر حساباتنا في واتساب وانستغرام.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'contact',
    title: 'اتصل بنا (Contact Us)',
    icon: Phone,
    badge: 'تواصل معنا',
    content: (
      <div className="space-y-5 text-[#2A2118] text-right">
        <p className="text-xs sm:text-sm text-[#523621] leading-relaxed">
          سعداء بتواصلكم واقتراحاتكم دائماً. يمكنك الوصول إلينا عبر وسائل التواصل التالية:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E8E2D8] p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-[#00A859] font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>البريد الإلكتروني الرسمي</span>
            </div>
            <p className="text-xs font-mono text-[#523621] font-bold">info@cortadocafe.com</p>
          </div>

          <div className="bg-white border border-[#E8E2D8] p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-[#00A859] font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>الموقع الرسمي</span>
            </div>
            <a 
              href="https://cortadocafe.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#00A859] font-bold hover:underline flex items-center gap-1"
            >
              <span>https://cortadocafe.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="bg-[#E6F6ED] border border-[#00A859]/30 p-4 rounded-2xl space-y-3">
          <h4 className="font-bold text-sm text-[#008A48] flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>معلومات المقر والتواصل الفوري</span>
          </h4>
          <div className="text-xs text-[#2A2118] space-y-1.5 font-medium">
            <p><strong>العنوان:</strong> Hillsboro, Oregon, USA</p>
            <p><strong>أوقات الاستجابة:</strong> يومياً من الساعة 9:00 صباحاً حتى 2:00 منتصف الليل</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'general-info',
    title: 'معلومات عامة (General Info)',
    icon: Building2,
    badge: 'دليل النشاط',
    content: (
      <div className="space-y-5 text-[#2A2118] text-right">
        <div className="bg-white border border-[#E8E2D8] rounded-2xl overflow-hidden">
          <div className="bg-[#00A859] text-white p-4 font-black text-sm flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span>بطاقة البيانات الجغرافية والمهنية لـ Cortado Café</span>
          </div>

          <div className="p-4 divide-y divide-[#E8E2D8] text-xs sm:text-sm">
            <div className="py-2.5 flex justify-between items-center">
              <span className="font-bold text-[#523621]">اسم النشاط التجاري:</span>
              <span className="font-black text-[#00A859]">Cortado Café (كورتادو كافيه)</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="font-bold text-[#523621]">نوع النشاط (Business Category):</span>
              <span className="font-bold text-[#2A2118]">Coffee Shop & Specialty Bakery</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="font-bold text-[#523621]">المدينة (City):</span>
              <span className="font-bold text-[#2A2118]">Hillsboro</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="font-bold text-[#523621]">الولاية (State):</span>
              <span className="font-bold text-[#2A2118]">Oregon</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="font-bold text-[#523621]">البلد (Country):</span>
              <span className="font-bold text-[#2A2118]">United States of America (USA)</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="font-bold text-[#523621]">رابط الموقع الرسمي:</span>
              <a href="https://cortadocafe.com" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-[#00A859] hover:underline">
                https://cortadocafe.com
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'story',
    title: 'قصتنا (Brand Story)',
    icon: Heart,
    badge: 'القصة والرؤية',
    content: (
      <div className="space-y-5 text-[#2A2118] text-right">
        <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-5 rounded-2xl space-y-3">
          <h3 className="font-black text-base text-[#00A859] flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>كيف بدأت الحكاية؟</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#523621] leading-relaxed">
            بدأت قصة كورتادو كافيه برؤية ملهمة: تقديم كوب قهوة لا يُنسى. كُنّا نؤمن بأن القهوة ليست مجرد مشروب صباحي، بل هي طقس يومي يستحق كل الاهتمام والدقة. اخترنا حبوب البن من أرقى المزارع العالمية المستدامة، وحرصنا على تحميصها بحب وحرفية عالية.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E8E2D8] p-4 rounded-xl space-y-2">
            <h4 className="font-bold text-sm text-[#00A859]">هدفنا (Our Mission)</h4>
            <p className="text-xs text-[#523621] leading-relaxed">
              إسعاد عملائنا يومياً بتقديم قهوة مختصة ذات جودة فائقة وحلويات طازجة في أجواء مريحة ومرحبة.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D8] p-4 rounded-xl space-y-2">
            <h4 className="font-bold text-sm text-[#00A859]">رؤيتنا (Our Vision)</h4>
            <p className="text-xs text-[#523621] leading-relaxed">
              أن نكون الوجهة الأولى والمفضلة لعشاق القهوة المختصة في Oregon وحول العالم.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'privacy',
    title: 'سياسة الخصوصية (Privacy Policy)',
    icon: ShieldCheck,
    badge: 'الأمان والخصوصية',
    content: (
      <div className="space-y-4 text-[#2A2118] text-right">
        <p className="text-xs sm:text-sm text-[#523621] leading-relaxed">
          في Cortado Café، نولي أهمية قصوى لخصوصية وأمان بيانات زوارنا وعملائنا الكرام. تلتزم سياسة الخصوصية بالنقاط التالية:
        </p>

        <div className="space-y-3 text-xs text-[#523621]">
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D8] space-y-1">
            <h4 className="font-bold text-sm text-[#00A859]">1. جمع البيانات واستخدامها</h4>
            <p className="leading-relaxed">نجمع فقط البيانات الضرورية لمعالجة وتوصيل طلباتكم (مثل الاسم، العنوان، ورقم الهاتف) لضمان تقديم أفضل خدمة possible.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D8] space-y-1">
            <h4 className="font-bold text-sm text-[#00A859]">2. سرية المعلومات</h4>
            <p className="leading-relaxed">لا نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي طرف ثالث لأغراض تسويقية إطلاقاً.</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D8] space-y-1">
            <h4 className="font-bold text-sm text-[#00A859]">3. أمان المعاملات الإلكترونية</h4>
            <p className="leading-relaxed">جميع عمليات الدفع وتفاصيل الطلبات محمية بأعلى بروتوكولات التشفير والأمان الإلكتروني المعمول بها عالمياً.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'sitemap',
    title: 'خريطة الموقع (Site Map)',
    icon: Network,
    badge: 'فهرس الصفحات',
    content: (
      <div className="space-y-4 text-[#2A2118] text-right">
        <p className="text-xs sm:text-sm text-[#523621] leading-relaxed">
          دليل وفهرس كامل لجميع صفحات وأقسام موقع <strong>Cortado Café Official Website</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D8] space-y-2">
            <h4 className="font-bold text-[#00A859] border-b border-[#E8E2D8] pb-1">أقسام الرئيسية والطلب</h4>
            <ul className="space-y-1 text-[#523621] font-medium">
              <li>• الرئيسية (Home Section)</li>
              <li>• القائمة والمنتجات (Menu & Drinks)</li>
              <li>• أكواد الخصم والقسائم (Promo Coupons)</li>
              <li>• سلة التسوق والدفع (Cart & Checkout)</li>
            </ul>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D8] space-y-2">
            <h4 className="font-bold text-[#00A859] border-b border-[#E8E2D8] pb-1">الصفحات التعريفية (SEO & AI)</h4>
            <ul className="space-y-1 text-[#523621] font-medium">
              <li>• تعريف كورتادو كافيه (About)</li>
              <li>• من نحن (Who We Are)</li>
              <li>• خدماتنا (Our Services)</li>
              <li>• الأسئلة الشائعة (FAQ)</li>
              <li>• اتصل بنا (Contact)</li>
              <li>• معلومات عامة (General Info)</li>
              <li>• قصتنا (Brand Story)</li>
              <li>• سياسة الخصوصية (Privacy Policy)</li>
              <li>• خريطة الموقع (Site Map)</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
];

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen: controlledIsOpen, onClose: controlledOnClose, defaultTab = 'about' }) => {
  const { settings } = useStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>(defaultTab);

  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const quickLinksList = settings.quickLinks && settings.quickLinks.length > 0 ? settings.quickLinks : DEFAULT_QUICK_LINKS;

  const visiblePages = INFO_PAGES.filter(page => {
    const ql = quickLinksList.find(q => q.id === page.id);
    return !ql || !ql.isHidden;
  }).map(page => {
    const ql = quickLinksList.find(q => q.id === page.id);
    if (!ql) return page;
    return {
      ...page,
      title: ql.titleAr || page.title,
      badge: ql.badge || page.badge,
      content: ql.contentAr ? (
        <div className="space-y-4 text-[#2A2118] text-right">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D8] leading-relaxed font-['Cairo'] text-sm sm:text-base space-y-3">
            <p className="whitespace-pre-line">{ql.contentAr}</p>
          </div>
        </div>
      ) : page.content
    };
  });

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId?: string }>;
      if (customEvent.detail?.tabId) {
        setActiveTabId(customEvent.detail.tabId);
      }
      setInternalIsOpen(true);
    };

    window.addEventListener('open-info-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-info-modal', handleOpenModal);
    };
  }, []);

  useEffect(() => {
    if (defaultTab) {
      setActiveTabId(defaultTab);
    }
  }, [defaultTab]);

  if (!isVisible) return null;

  const currentTab = visiblePages.find((p) => p.id === activeTabId) || visiblePages[0] || INFO_PAGES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#E8E2D8] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#1E1B18] text-[#FAEDCD] px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#00A859]/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00A859] text-white flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Cairo'] font-extrabold text-base sm:text-lg text-white">
                  مركز المعلومات والتعريف - Cortado Café
                </h3>
                <p className="text-[11px] text-[#D4A373] font-mono">
                  Official Directory & AI Metadata Info
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-[#FAEDCD]/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
            {/* Sidebar Navigation (Col-4) */}
            <div className="md:col-span-4 bg-white border-l border-[#E8E2D8] p-3 space-y-1 overflow-y-auto max-h-[220px] md:max-h-none shrink-0">
              <span className="text-[11px] font-bold text-[#8B5E34] px-3 py-1 block font-['Cairo']">
                الصفحات التعريفية المتاحة ({visiblePages.length})
              </span>
              {visiblePages.map((page) => {
                const IconComponent = page.icon;
                const isActive = page.id === activeTabId;
                return (
                  <button
                    key={page.id}
                    onClick={() => setActiveTabId(page.id)}
                    className={`w-full text-right px-3 py-2.5 rounded-xl font-['Cairo'] text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#00A859] text-white shadow-md'
                        : 'text-[#523621] hover:bg-[#FAF8F5] hover:text-[#00A859]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#00A859]'}`} />
                      <span className="truncate">{page.title.split('(')[0]}</span>
                    </div>
                    {page.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#E6F6ED] text-[#008A48]'
                      }`}>
                        {page.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area (Col-8) */}
            <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto font-['Cairo']">
              <div className="mb-4 pb-3 border-b border-[#E8E2D8] flex items-center justify-between flex-wrap gap-2 text-right">
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-[#00A859]">
                    {currentTab.title}
                  </h2>
                  <p className="text-xs text-[#523621]">
                    Cortado Café - Official Knowledge Base & Identity Page
                  </p>
                </div>
              </div>

              {currentTab.content}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-white border-t border-[#E8E2D8] px-4 py-3 flex items-center justify-between text-xs text-[#523621] font-['Cairo'] shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A859]" />
              <span className="font-bold">الموقع الرسمي: https://cortadocafe.com</span>
            </div>
            <button
              onClick={handleClose}
              className="bg-[#00A859] hover:bg-[#008A48] text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
