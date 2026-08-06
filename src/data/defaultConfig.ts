import { SiteConfig, ServiceItem } from '../types';

export const defaultServices: ServiceItem[] = [
  {
    id: 'web-design',
    title: 'تصميم مواقع ومتاجر إلكترونية',
    subtitle: 'تصميم مواقع الويب والمتاجر الإلكترونية',
    description: 'نصمم مواقع ومتاجر إلكترونية سريعة وآمنة ومتوافقة مع جميع الأجهزة، مع تجربة مستخدم مدروسة تزيد من تفاعل العملاء وتحويلاتهم.',
    iconType: 'web',
    badge: 'تصميم وبناء',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    whatsappMessage: 'مرحباً ADIX MEDIA، أرغب بالاستفسار عن تصميم وتطوير موقع/متجر إلكتروني'
  },
  {
    id: 'social-media',
    title: 'إدارة حسابات التواصل الاجتماعي',
    subtitle: 'إدارة حسابات وسائل التواصل الاجتماعي',
    description: 'نقدم إدارة حسابات التواصل الاجتماعي باحترافية ودعم التواجد القوي والجذاب. ندير حساباتك على فيسبوك، إنستغرام، تويتر، لينكدإن، وتيكتوك، ونعمل على تطوير استراتيجية مخصصة لكل تفاعل مع جمهورك المستهدف، بناء هوية علامتك، وتحليل الأداء، والمساهمة المستمرة لتحقيق النتائج.',
    iconType: 'social',
    badge: 'إدارة شاملة',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
    whatsappMessage: 'مرحباً ADIX MEDIA، أرغب بالاستفسار عن خدمات إدارة حسابات التواصل الاجتماعي'
  },
  {
    id: 'paid-ads',
    title: 'إعلانات مدفوعة عبر حساباتنا الإعلانية',
    subtitle: 'الإعلانات من خلال حساباتنا الإعلانية',
    description: 'إعلانات مدفوعة فعالة من خلال حساباتنا الإعلانية على مختلف المنصات. نحن نوفر لك إعلاناً مخصصاً لتحقيق أفضل النتائج مع فريقنا المتخصص على إعداد حملات الإعلانات لجمهورك بذكاء، من خلال مراقبة الأداء وتحقيق أهدافك التسويقية.',
    iconType: 'ads',
    badge: 'حسابات وكالة موثوقة',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop',
    whatsappMessage: 'مرحباً ADIX MEDIA، مهتم بخدمة الإعلانات الممولة عبر حساباتكم الإعلانية'
  },
  {
    id: 'ad-design',
    title: 'تصميمات إعلانية لوسائل التواصل الاجتماعي',
    subtitle: 'تصميم إعلاني',
    description: 'تصميم جذاب وموجه إلى الجمهور يتفاعل مع رسالتك، ويبرز علامتك التجارية بأعلى جودة للثانية.',
    iconType: 'design',
    badge: 'إبداع بصري',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    whatsappMessage: 'مرحباً ADIX MEDIA، أرغب بطلب تصميمات إعلانية احترافية لعلامتي التجارية'
  },
  {
    id: 'vision',
    title: 'يبدأ كل تصميم برؤية تتجاوز الحدود',
    subtitle: 'دعنا نساعدك',
    description: 'هنا تحول أفكارك إلى بصمات ملهمة تنير لك طريق النجاح. دع إبداعك يقودك نحو مستقبل مشرق.',
    iconType: 'vision',
    badge: 'شغف وإتقان',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    whatsappMessage: 'مرحباً ADIX MEDIA، أرغب بالتواصل لمعرفة المزيد وبدء مشروع جديد'
  }
];

export const defaultConfig: SiteConfig = {
  companyName: 'ADIX MEDIA',
  customLogoUrl: 'https://i.ibb.co/vCMjRfSm/ADIX2-1-11.png',
  heroTitle: 'نبتكر لعلامتك حضوراً مؤكداً',
  heroSubtitle: 'منصتك الشاملة لبناء وتطوير رقمي للأسواق والمواقع، وإدارة الصوشيال ميديا والإعلانات بأعلى كفاءة.',
  whatsappNumber: '+962779769501',
  email: 'info@adixmedia.com',
  address: 'عَمّان - الأردن / خدماتنا متاحة لكافة دول العالم العربي',
  adminPin: '1234',
  sectionVisibility: {
    hero: true,
    services: true,
    pricing: true,
    calculator: true,
    portfolio: true,
    contact: true,
  },
  servicesList: defaultServices,
  calculatorConfig: {
    title: 'حاسبة التكلفة التقديرية المخصصة',
    subtitle: 'حدد الخدمات المطلوبة بدقة للحصول على إجمالي سعر فوري مع خيار الطلب المباشر',
    websitePrice: 280,
    websiteLabel: 'تطوير موقع/متجر إلكتروني شامل',
    pricePerPost: 12,
    postLabel: 'عدد منشورات التواصل الاجتماعي الشهري:',
    minPosts: 0,
    maxPosts: 30,
    reelsPrice: 80,
    reelsLabel: 'إنتاج ومونتاج فيديوهات ريلز / تيك توك',
    adsPrice: 90,
    adsLabel: 'إدارة ومتابعة حملات الإعلانات الممولة',
    resultLabel: 'التكلفة التقديرية الخاطفة',
    resultNote: 'شاملة الخدمة والإعداد والاستشارة',
    whatsappButtonText: 'إرسال هذا التقدير مباشرة للواتساب',
  },
  socialLinks: {
    facebook: 'https://facebook.com/adixmediaa',
    instagram: 'https://instagram.com/adixmediaa',
    behance: 'https://behance.net/adixmedia',
    whatsapp: 'https://wa.me/962779769501',
    tiktok: 'https://tiktok.com/@adixmediaa',
    linkedin: '',
    youtube: '',
    twitter: ''
  },
  logoGlowColors: {
    blue: '#00a8ff',
    yellow: '#ffb700',
    red: '#ff3366',
    green: '#00e676'
  },
  portfolioItems: [
    {
      id: 'p1',
      title: 'متجر فاخر للموضة والأزياء',
      category: 'تصميم متجر إلكتروني',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://wa.me/962779769501?text=' + encodeURIComponent('مرحباً أديكس ميديا، أود مشاهدة نماذج المتاجر الإلكترونية'),
      clientName: 'Elegant Fashion',
      description: 'تصميم متجر إلكتروني متكامل سريع ومتجاوب مع بوابة دفع وسلة شراء سلسة.'
    },
    {
      id: 'p2',
      title: 'إدارة وتصميم حسابات مطعم وكافيه',
      category: 'إدارة صوشيال ميديا',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://instagram.com/adixmediaa',
      clientName: 'Aroma Lounge',
      description: 'صناعة محتوى تصويري وتصاميم إعلانية مبتكرة ضاعفت تفاعل العملاء 300%.'
    },
    {
      id: 'p3',
      title: 'حملة إعلانات ممولة لبراند تجميل',
      category: 'إعلانات مدفوعة',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://wa.me/962779769501?text=' + encodeURIComponent('استفسار عن الحملات الإعلانية الممولة'),
      clientName: 'Glow Beauty',
      description: 'حملة إعلانات موجهة حققت أكثر من 45,000 زائر للمتجر بأقل تكلفة نقرة.'
    },
    {
      id: 'p4',
      title: 'هوية بصرية وتصميم إعلانات شركة عقار',
      category: 'تصميم إعلاني وهويات',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://behance.net/adixmedia',
      clientName: 'Skyline Real Estate',
      description: 'تصاميم بوستات وسلايدات احترافية جذابة تعكس فخامة المشاريع العقارية.'
    },
    {
      id: 'p5',
      title: 'منصة حجز واستشارات طبيب أسنان',
      category: 'تطوير موقع إلكتروني',
      imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://wa.me/962779769501?text=' + encodeURIComponent('طلب استشارة لتطوير موقع طبي/خدمي'),
      clientName: 'Dental Care Center',
      description: 'موقع إلكتروني متكامل لنظام حجز مواعيد أونلاين وتجربة زائر فائقة السلاسة.'
    },
    {
      id: 'p6',
      title: 'حملة فيديوهات ريلز وتيك توك واسعة الانتشار',
      category: 'إنتاج محتوى وفيديو',
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop',
      linkUrl: 'https://tiktok.com/@adixmediaa',
      clientName: 'Tech Jordan',
      description: 'إنتاج 12 فيديو قصير سريع وممتع تجاوزت ملايين المشاهدات على تيك توك.'
    }
  ],
  pricingPlans: [
    {
      id: 'starter',
      name: 'باقة الانطلاق',
      price: '$190',
      duration: 'شهرياً',
      popular: false,
      badge: 'للمشاريع الناشئة',
      description: 'الحل المثالي لبدء بناء حضورك الرقمي وإثبات وجود علامتك في السوق.',
      features: [
        'تصميم 8 منشورات احترافية شهرياً',
        'إدارة منصتين للتواصل الاجتماعي (انستغرام + فيسبوك)',
        'كتابة محتوى إبداعي وجذاب (Captions + Hashtags)',
        'إعداد وإطلاق 1 حملة إعلانية ممولة',
        'تقرير أداء وتحليلات تفصيلية نهاية الشهر',
        'دعم استشاري مخصص عبر الواتساب'
      ]
    },
    {
      id: 'growth',
      name: 'باقة النمو الذهبية',
      price: '$380',
      duration: 'شهرياً',
      popular: true,
      badge: 'الأكثر طلباً 🔥',
      description: 'الخيار الخارق لزيادة المبيعات ومضاعفة التفاعل وتوسيع شريحة عملائك.',
      features: [
        'تصميم 16 منشوراً إبداعياً بدقة عالية',
        'إنتاج ومونتاج 4 فيديوهات Reels / TikTok جذابة',
        'إدارة 4 منصات تواصل اجتماعي بالكامل',
        'إدارة وإعادة استهداف الحملات الإعلانية الممولة',
        'تصميم بروفايل وغلاف وتحديث أبرز Highlights',
        'الرد السريع وتوجيه استفسارات العملاء',
        'تقرير أسبوعي ومتابعة مستمرة عبر الواتساب المباشر'
      ]
    },
    {
      id: 'pro',
      name: 'باقة الشركات والحلول الشاملة',
      price: '$750',
      duration: 'شهرياً',
      popular: false,
      badge: 'حلول 360 درجة',
      description: 'تغطية شاملة لكل احتياجاتك الرقمية من تصميم مواقع، محتوى مكثف، وإعلانات ضخمة.',
      features: [
        'تصميم وتطوير موقع أو متجر إلكتروني احترافي مجاناً',
        'تصميم 24 منشور + 8 فيديوهات قصيرة احترافية',
        'إدارة شاملة لكافة حسابات الصوشيال ميديا بلا حدود',
        'إصدار وتنفيذ خطة إعلانات ممولة استراتيجية مكثفة',
        'هوية بصرية شاملة وتطوير علامة تجارية كاملة',
        'مدير حسابات مخصص واستجابة مباشرة خلال 24/7',
        'استشارات تسويق وتوسّع غير محدودة'
      ]
    }
  ]
};
