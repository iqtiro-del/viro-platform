import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    "nav.services": "Services",
    "nav.wallet": "Wallet",
    "nav.myProducts": "My Products",
    "nav.promote": "Promote",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    
    // Dashboard/Home
    "home.title": "TIRO",
    "home.subtitle": "Iraq's Premier Digital Services Marketplace",
    "home.description": "Connect with verified sellers, discover quality services, and grow your digital business",
    "home.search.placeholder": "Search for services...",
    "home.search.button": "Search",
    "home.stats.activeServices": "Active Services",
    "home.stats.verifiedSellers": "Verified Sellers",
    "home.stats.totalSales": "Total Sales",
    "home.featuredServices": "Featured Services",
    "home.featuredServices.subtitle": "Top-rated services from verified sellers",
    "home.viewAll": "View All",
    "home.cta.title": "Ready to Start Selling?",
    "home.cta.description": "Join thousands of sellers on Iraq's fastest-growing digital marketplace",
    "home.cta.getStarted": "Get Started",
    "home.startingAt": "Starting at",
    "home.viewDetails": "View Details",
    
    // Services Page
    "services.title": "Digital Services",
    "services.searchPlaceholder": "Search services...",
    "services.filters": "Filters",
    "services.category": "Category",
    "services.priceRange": "Price Range",
    "services.all": "All",
    "services.allCategories": "All Categories",
    "services.allPrices": "All Prices",
    "services.under25": "Under $25",
    "services.25to100": "$25 - $100",
    "services.over100": "Over $100",
    "services.buyNow": "Buy Now",
    "services.noResults": "No services found",
    "services.tryDifferent": "Try adjusting your filters",
    
    // Wallet
    "wallet.title": "Wallet",
    "wallet.balance": "Balance",
    "wallet.totalEarnings": "Total Earnings",
    "wallet.deposit": "Deposit",
    "wallet.withdraw": "Withdraw",
    "wallet.transactions": "Transactions",
    "wallet.noTransactions": "No transactions yet",
    "wallet.startUsing": "Start using your wallet to see transactions",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
  },
  ar: {
    // Navigation
    "nav.services": "الخدمات",
    "nav.wallet": "المحفظة",
    "nav.myProducts": "منتجاتي",
    "nav.promote": "الترويج",
    "nav.profile": "الملف الشخصي",
    "nav.logout": "تسجيل الخروج",
    "nav.login": "تسجيل الدخول",
    "nav.signup": "إنشاء حساب",
    
    // Dashboard/Home
    "home.title": "تيرو",
    "home.subtitle": "منصة العراق الرائدة للخدمات الرقمية",
    "home.description": "تواصل مع بائعين موثوقين، اكتشف خدمات عالية الجودة، وقم بتنمية عملك الرقمي",
    "home.search.placeholder": "ابحث عن الخدمات...",
    "home.search.button": "بحث",
    "home.stats.activeServices": "خدمات نشطة",
    "home.stats.verifiedSellers": "بائعين موثوقين",
    "home.stats.totalSales": "إجمالي المبيعات",
    "home.featuredServices": "الخدمات المميزة",
    "home.featuredServices.subtitle": "خدمات بتقييم عالي من بائعين موثوقين",
    "home.viewAll": "عرض الكل",
    "home.cta.title": "هل أنت مستعد لبدء البيع؟",
    "home.cta.description": "انضم إلى آلاف البائعين في أسرع سوق رقمي نمواً في العراق",
    "home.cta.getStarted": "ابدأ الآن",
    "home.startingAt": "يبدأ من",
    "home.viewDetails": "عرض التفاصيل",
    
    // Services Page
    "services.title": "الخدمات الرقمية",
    "services.searchPlaceholder": "ابحث عن الخدمات...",
    "services.filters": "التصفيات",
    "services.category": "الفئة",
    "services.priceRange": "نطاق السعر",
    "services.all": "الكل",
    "services.allCategories": "جميع الفئات",
    "services.allPrices": "جميع الأسعار",
    "services.under25": "أقل من 25$",
    "services.25to100": "25$ - 100$",
    "services.over100": "أكثر من 100$",
    "services.buyNow": "اشتر الآن",
    "services.noResults": "لا توجد خدمات",
    "services.tryDifferent": "حاول تعديل التصفيات",
    
    // Wallet
    "wallet.title": "المحفظة",
    "wallet.balance": "الرصيد",
    "wallet.totalEarnings": "إجمالي الأرباح",
    "wallet.deposit": "إيداع",
    "wallet.withdraw": "سحب",
    "wallet.transactions": "المعاملات",
    "wallet.noTransactions": "لا توجد معاملات بعد",
    "wallet.startUsing": "ابدأ باستخدام محفظتك لرؤية المعاملات",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.cancel": "إلغاء",
    "common.confirm": "تأكيد",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("language");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    
    // Update document direction and lang attribute
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    
    // Update font family for Arabic
    if (language === "ar") {
      document.documentElement.style.fontFamily = "'Tajawal', 'Inter', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "'Inter', 'Tajawal', sans-serif";
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
