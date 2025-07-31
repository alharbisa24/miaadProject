import type { Metadata } from "next";
import "./globals.css";

import { arabicFont } from "./fonts";
import { cn } from "@/lib/utils";




export const metadata: Metadata = {
  title: "ميعاد - منصة تنسيق المواعيد",
  description: "منصة تنسيق لتنظيم وإدارة حجوزاتك بكل سهولة ",
  keywords: ["مواعيد", "حجز", "تنسيق", "منصة"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning >
      <body className={cn("overflow-x-hidden", arabicFont.className)}>
      
  
        
        {children}
      </body>
    </html>
  );
}
