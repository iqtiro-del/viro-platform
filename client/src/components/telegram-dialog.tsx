import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { SiTelegram } from "react-icons/si";

export function TelegramDialog() {
  const { showTelegramDialog, setShowTelegramDialog } = useAuth();

  const handleJoinChannel = () => {
    window.open("https://t.me/viroiq1", "_blank");
    setShowTelegramDialog(false);
  };

  return (
    <Dialog open={showTelegramDialog} onOpenChange={setShowTelegramDialog}>
      <DialogContent className="glass-morphism-strong border-primary/30 neon-glow-primary max-w-md text-right" dir="rtl">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0088cc] to-[#00aced] flex items-center justify-center neon-glow-accent">
              <SiTelegram className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            📢 كن على اطلاع دائم!
          </DialogTitle>
          <DialogDescription className="text-base text-center leading-relaxed text-muted-foreground">
            انضم إلى قناة التليجرام الرسمية للمنصة لتصلك جميع الأخبار والتحديثات والعروض أولًا بأول.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-4">
          <Button 
            onClick={handleJoinChannel}
            className="w-full gap-2 neon-glow-accent bg-gradient-to-r from-[#0088cc] to-[#00aced] hover:from-[#0077b5] hover:to-[#009ad6] text-white"
            data-testid="button-join-telegram"
          >
            <SiTelegram className="w-5 h-5" />
            الانضمام إلى قناة التليجرام
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setShowTelegramDialog(false)}
            className="w-full text-muted-foreground hover:text-foreground"
            data-testid="button-close-telegram-dialog"
          >
            لاحقاً
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
