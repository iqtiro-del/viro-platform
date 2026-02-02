import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthPageProps {
  mode: "login" | "register";
}

export function AuthPage({ mode }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(data.username, data.password);
        toast({
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeTo"),
        });
      } else {
        const registerData = data as RegisterFormData;
        await register({
          username: registerData.username,
          password: registerData.password,
          fullName: registerData.fullName,
          email: registerData.email,
        });
        toast({
          title: t("auth.accountCreated"),
          description: t("auth.welcomeToPlatform"),
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-morphism-strong border-primary/20 neon-glow-primary">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-4">
            <h1 className="text-4xl font-accent font-bold neon-text-glow tracking-tight">
              {t("home.title")}
            </h1>
          </div>
          <CardTitle className="text-2xl text-center">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "login" 
              ? t("auth.enterCredentials")
              : t("auth.joinTiro")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "login" ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.username")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full neon-glow-primary" 
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.login")}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.fullName")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                          data-testid="input-fullname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="example@email.com"
                          {...field} 
                          className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.username")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="glass-morphism border-border/50 focus:border-primary focus:ring-primary"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full neon-glow-primary" 
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.createAccount")}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === "login" ? t("auth.dontHaveAccount") : t("auth.alreadyHaveAccount")}
            </span>
            {" "}
            <a 
              href={mode === "login" ? "/register" : "/login"} 
              className="text-primary hover:text-primary/80 font-medium hover-elevate inline-block px-2 py-1 rounded transition-all"
              data-testid={mode === "login" ? "link-register" : "link-login"}
            >
              {mode === "login" ? t("auth.signUp") : t("auth.login")}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
