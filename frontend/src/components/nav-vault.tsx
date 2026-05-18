import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { Link, NavLink } from "react-router-dom"
import React, { memo } from "react"

export const NavVault = memo(function NavVault({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    end?: boolean
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {

  return (
    <SidebarGroup>
      <div className="flex items-center overflow-hidden">
        <SidebarGroupLabel >Vault</SidebarGroupLabel>
        <SidebarSeparator />
      </div>
      <SidebarMenu>
        {items.map((item) => {
            const hasSubItems = !!item.items?.length;
            return (
                <React.Fragment key={item.title}>
                    { item.title === "Tools" ? 
                        <div className="flex items-center overflow-hidden">
                            <SidebarGroupLabel >Other</SidebarGroupLabel>
                            <SidebarSeparator />
                        </div> : null }
                    <Collapsible
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            {hasSubItems ?   
                                
                                <CollapsibleTrigger asChild>
                                    <NavLink to={item.url} end={item.end ?? false}>
                                        {({ isActive }) => (
                                            <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                                                {item.icon && <item.icon />}
                                                {item.title}
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        )}
                                    </NavLink>
                                </CollapsibleTrigger>
                                : 
                                <NavLink to={item.url} end={item.end ?? true}>
                                    {({ isActive }) => (
                                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    )}
                                </NavLink>
                            }
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                                <Link to={subItem.url} className="flex items-center">
                                                    {subItem.icon && <subItem.icon />}
                                                    <span className="pb-0.5">{subItem.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </React.Fragment>
            )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})