"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconLogout } from "@tabler/icons-react"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  className?: string
}

export function NavMain({ items, className }: NavMainProps) {
  const router = useRouter();
  const pathname = usePathname()

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = (() => {
              if (pathname === item.url) return true;
              
              if (item.url === '/dashboard' && pathname !== '/dashboard') return false;
              
              return pathname.startsWith(`${item.url}/`);
            })();            
            
            return (
              <SidebarMenuItem key={item.title}>
    <SidebarMenuButton
      asChild
      className={cn(
        isActive && "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-900 dark:text-purple-100 font-medium",
        "transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
      )}
    >
      <Link href={item.url}>
        <Icon className={cn(
          "size-5", 
          isActive 
            ? "text-purple-600 dark:text-purple-300" 
            : "text-gray-500 dark:text-gray-400"
        )} />
        <span className={cn(
          isActive 
            ? "text-purple-900 dark:text-purple-100" 
            : "text-gray-700 dark:text-gray-300"
        )}>
          {item.title}
        </span>

      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
            )
          })}
                   <SidebarMenuItem>
    <SidebarMenuButton
      asChild
      className={cn(
        "transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
      )}
    >
      <a className="cursor-pointer" onClick={async ()=>{
        await authClient.signOut();
        router.push('/login')
      }}>
        <IconLogout className={cn(
          "size-5", "text-gray-500 dark:text-gray-400"
        )} />
        <span className={cn(
 "text-gray-700 dark:text-gray-300"
        )}>
          تسجيل الخروج
        </span>

      </a>
    </SidebarMenuButton>
  </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}