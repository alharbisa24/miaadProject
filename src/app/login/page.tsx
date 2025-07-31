"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await authClient.signIn.email(
        {
          email,
          password,
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
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider:"google",
        callbackURL:"/dashboard"
      
      });
    }catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-900">تسجيل الدخول</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">البريد الالكتروني</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="user"
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
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-10 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
              />
              <Lock size={18} className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400" />
            </div>
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
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">أو</span>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <Image src="/google.webp" alt="Google" width={20} height={20} />
            <span>تسجيل الدخول باستخدام Google</span>
          </Button>
          
          <div className="text-center mt-6">
            <p className="text-gray-600">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-purple-700 hover:text-purple-900 font-medium">
                إنشاء حساب
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}