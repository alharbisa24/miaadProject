"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  IconDashboard,
  IconForms,

} from "@tabler/icons-react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: UserData;
}

const defaultData = {
  user: {
    name: "user",
    email: "user@user.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "لوحة التحكم",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "النماذج",
      url: "/dashboard/forms",
      icon: IconForms,
    },
  ]

  
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const data = {
    ...defaultData,
    user: user ? {
      name: user.name || defaultData.user.name,
      email: user.email || defaultData.user.email,
      avatar: user.avatar || defaultData.user.avatar
    } : defaultData.user
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
     <a href="/dashboard">
                {mounted ? (
                  <Image 
                    src={resolvedTheme === "dark" ? "/white-logo.png" : "/logo.png"} 
                    alt="logo" 
                    width={80} 
                    height={80}
                    priority
                  />
                ) : (
                  <Image 
                    src="/logo.png" 
                    alt="logo" 
                    width={80} 
                    height={80}
                    priority
                  />
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}