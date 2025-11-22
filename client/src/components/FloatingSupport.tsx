import { useState, useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FAQs = [
  {
    question: "كيف أقوم بالتسجيل كبائع؟",
    answer: "للتسجيل كبائع، اذهب إلى صفحة الملف الشخصي واضغط على 'طلب التحقق كبائع'. سيتم مراجعة طلبك من قبل الإدارة خلال 24-48 ساعة."
  },
  {
    question: "كيف أشحن محفظتي؟",
    answer: "اذهب إلى صفحة المحفظة واختر 'إيداع'. اختر طريقة الدفع المناسبة (زين كاش، الرافدين، أو FIB) وارفع صورة الوصل. سيتم مراجعته من قبل الإدارة."
  },
  {
    question: "ما هي نسبة العمولة؟",
    answer: "نسبة العمولة على المنصة هي 10% من جميع عمليات الإيداع والسحب. هذه الرسوم تساعدنا في تحسين الخدمة وضمان الأمان."
  },
  {
    question: "كيف تعمل المحادثات؟",
    answer: "عند شراء منتج، يتم فتح محادثة تلقائية بينك وبين البائع لمدة 72 ساعة. المال يبقى محفوظًا في النظام حتى يتم إغلاق المحادثة أو انتهاء المدة."
  },
  {
    question: "متى أستلم أموالي كبائع؟",
    answer: "يتم الاحتفاظ بالمال في النظام لمدة 72 ساعة. إذا أغلق المشتري المحادثة، يتم تحويل المال بعد 10 ساعات. أو يمكن للإدارة تحويل المال يدويًا."
  },
  {
    question: "كيف أسحب أموالي؟",
    answer: "اذهب إلى صفحة المحفظة واختر 'سحب'. أدخل رقم حسابك البنكي والمبلغ المطلوب. سيتم خصم المبلغ فورًا ومراجعة الطلب من قبل الإدارة."
  }
];

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Initialize position after mount (SSR-safe)
  useEffect(() => {
    setPosition({ x: 20, y: window.innerHeight - 100 });
  }, []);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    dragStartPos.current = { x: clientX, y: clientY };
    setIsDragging(true);
    setHasDragged(false);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    // Check if moved more than 5 pixels (threshold for drag vs click)
    const deltaX = Math.abs(clientX - dragStartPos.current.x);
    const deltaY = Math.abs(clientY - dragStartPos.current.y);
    if (deltaX > 5 || deltaY > 5) {
      setHasDragged(true);
    }

    const buttonSize = 60;
    const maxX = window.innerWidth - buttonSize;
    const maxY = window.innerHeight - buttonSize;

    const newX = Math.max(0, Math.min(maxX, clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(maxY, clientY - dragOffset.y));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click event to check it
    setTimeout(() => setHasDragged(false), 100);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleEnd = () => handleDragEnd();

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    const handleResize = () => {
      const buttonSize = 60;
      const maxX = window.innerWidth - buttonSize;
      const maxY = window.innerHeight - buttonSize;
      setPosition(prev => ({
        x: Math.min(prev.x, maxX),
        y: Math.min(prev.y, maxY)
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleButtonClick = () => {
    // Only open if we didn't just drag the button
    if (!hasDragged) {
      setIsOpen(!isOpen);
    }
  };

  const handleFAQClick = (index: number) => {
    setSelectedFAQ(index);
  };

  return (
    <>
      <button
        ref={buttonRef}
        data-testid="button-floating-support"
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onClick={handleButtonClick}
        aria-label="فتح الدعم الفني"
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-purple-600 to-pink-600 text-white shadow-lg hover-elevate active-elevate-2 flex items-center justify-center cursor-move transition-transform"
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          touchAction: "none",
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0" data-testid="card-support-chat">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              الدعم الفني
            </DialogTitle>
            <DialogDescription className="sr-only">
              مركز الدعم الفني - الأسئلة الشائعة والتواصل عبر تيليجرام
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                مرحباً! كيف يمكننا مساعدتك؟ يرجى اختيار أحد الأسئلة الشائعة:
              </p>
            </div>

            <div className="space-y-2" role="list" aria-label="الأسئلة الشائعة">
              {FAQs.map((faq, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-right justify-start h-auto py-3 px-4"
                  onClick={() => handleFAQClick(index)}
                  data-testid={`button-faq-${index}`}
                  aria-expanded={selectedFAQ === index}
                >
                  {faq.question}
                </Button>
              ))}
            </div>

            {selectedFAQ !== null && (
              <div
                className="bg-primary/10 border-r-4 border-primary p-4 rounded-lg animate-in slide-in-from-bottom-2"
                data-testid="answer-faq"
                role="region"
                aria-label="الإجابة"
              >
                <Badge className="mb-2" data-testid="badge-faq-answer">الجواب</Badge>
                <p className="text-sm leading-relaxed">{FAQs[selectedFAQ].answer}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                لم تجد إجابة؟ تواصل معنا على تيليجرام:
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => window.open("https://t.me/viroiq", "_blank")}
                data-testid="button-telegram-support"
                aria-label="فتح تيليجرام للتواصل مع الدعم"
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                تواصل عبر تيليجرام
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
