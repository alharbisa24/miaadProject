"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { redirect, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    let strength = 0;
    if (newPassword.length > 6) strength += 1;
    if (newPassword.length > 10) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            setLoading(false);
          },
        }
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white flex items-center justify-center p-4 py-16 overflow-hidden">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center relative overflow-hidden">
        
        <div className="absolute -z-10 top-1/4 -left-20 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute -z-10 bottom-1/4 -right-20 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-40"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex flex-col items-center justify-center p-10 space-y-6"
        >
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Image src="/logo.png" alt="logo" width={120} height={120}/>
          </Link>
          
          <div className="p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100 w-full max-w-md">
            <h2 className="text-2xl font-bold text-purple-900 mb-4 text-right">مرحباً بك</h2>
            <p className="text-gray-600 mb-6 text-right">انضم إلينا اليوم وابدأ في تنظيم مواعيدك بشكل أكثر فعالية وإنتاجية.</p>
            
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-3 text-purple-700">
                <CheckCircle size={18} className="flex-shrink-0" />
                <span>إدارة الحجوزات بسهولة</span>
              </div>
              <div className="flex items-center gap-3 text-purple-700">
                <CheckCircle size={18} className="flex-shrink-0" />
                <span>تلقي التنبيهات والإشعارات</span>
              </div>
              <div className="flex items-center gap-3 text-purple-700">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>دعم فني على مدار الساعة</span>
            </div>
            <div className="flex items-center gap-3 text-purple-700">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>تجربة مستخدم مميزة</span>
            </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-xl border border-purple-100 w-full max-w-lg mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-purple-900">إنشاء حساب</h1>
            
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">الاسم</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 pr-10 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
                />
                <User size={18} className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400" />
              </div>
            </div>

           
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">البريد الإلكتروني</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pr-10 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
                />
                <Mail size={18} className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="h-12 pr-10 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
                />
                <Lock size={18} className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < passwordStrength 
                            ? passwordStrength < 3 
                              ? "bg-red-400" 
                              : passwordStrength < 4 
                                ? "bg-yellow-400" 
                                : "bg-green-400"
                            : "bg-gray-200"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {passwordStrength < 3 ? "ضعيفة" : passwordStrength < 4 ? "متوسطة" : "قوية"}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <span className="text-red-500">{error}</span>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                {!loading && <ArrowLeft size={16} />}
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-purple-700 hover:text-purple-900 font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}