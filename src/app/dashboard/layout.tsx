import type { Metadata } from "next";
import { ThemeProvider } from "@/components/Provider/ThemeProvider";
import { AppSidebar } from "@/components/app-sidebar"
import './globals.css'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";


import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { arabicFont } from "../fonts";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "ميعاد | لوحة التحكم",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
 
    if(!session) {
        redirect("/login")
    }

    return (
      
      
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <AppSidebar side="right" user={session.user} />
              
              <div id="main-content" className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 w-full">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#" className="active">
                          لوحة التحكم
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  
                  <div className="flex items-center gap-2 mr-auto">
                      <ThemeToggle />
                      <SidebarTrigger />
                    </div>
                  </header>
                <main className="flex-1 overflow-auto w-full">
                <Toaster toastOptions={{ className: arabicFont.className, }}/>

                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
          </ThemeProvider>
      
    );
  }