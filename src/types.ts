export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  behance?: string;
  tiktok?: string;
  whatsapp?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  linkUrl: string;
  clientName?: string;
  description?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  duration: string;
  popular?: boolean;
  description: string;
  features: string[];
  badge?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconType: 'web' | 'social' | 'ads' | 'design' | 'vision' | 'growth';
  imageUrl: string;
  badge?: string;
  whatsappMessage?: string;
}

export interface CalculatorConfig {
  title: string;
  subtitle: string;
  websitePrice: number;
  websiteLabel: string;
  pricePerPost: number;
  postLabel: string;
  minPosts: number;
  maxPosts: number;
  reelsPrice: number;
  reelsLabel: string;
  adsPrice: number;
  adsLabel: string;
  resultLabel: string;
  resultNote: string;
  whatsappButtonText: string;
}

export interface SectionVisibility {
  hero: boolean;
  services: boolean;
  pricing: boolean;
  calculator: boolean;
  portfolio: boolean;
  contact: boolean;
}

export interface SiteConfig {
  companyName: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  email: string;
  address: string;
  customLogoUrl?: string;
  adminPin?: string;
  sectionVisibility?: SectionVisibility;
  servicesList?: ServiceItem[];
  calculatorConfig?: CalculatorConfig;
  socialLinks: SocialLinks;
  portfolioItems: PortfolioItem[];
  pricingPlans: PricingPlan[];
  logoGlowColors: {
    blue: string;
    yellow: string;
    red: string;
    green: string;
  };
}
