import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar";
import {
    Star, 
    Trash2, 
    Settings, 
    Globe,
    KeyRound, 
    LayoutList,
    StickyNote,
    Folders,
    Wrench,
    RectangleEllipsis,
    ShieldCheck,
    UserCog,
    SunMoon,
} from "lucide-react";
import AegisPassShield from "./ui/aegis-pass-shield";
import { NavUser } from "./nav-user";
import { NavVault } from "./nav-vault";
import { useState, useEffect } from "react";
import { useWorkerService } from "@/context/worker-provider";


const data = {
    navVault: [
        {
            title: "All Items",
            url: "/vault",
            icon: LayoutList,
            end: true,
            isActive: true,
            items: [
                {
                    title: "Logins",
                    url: "/vault/logins",
                    icon: Globe
                },
                {
                    title: "Secure Notes",
                    url: "/vault/secure-notes",
                    icon: StickyNote
                }
            ]
        },
        {
            title: "Folders",
            url: "/vault/folders",
            icon: Folders,
            end: true,
        },
        {
            title: "Favourits",
            url: "/vault/favourits",
            icon: Star,
            end: true,
        },
        {
            title: "Trash",
            url: "/vault/trash",
            icon: Trash2,
            end: true,
        },
        {
            title: "Tools",
            url: "/tools/generator",
            icon: Wrench,
            end: false,
            items: [
                {
                    title: "Generator",
                    url: "/tools/generator",
                    icon: RectangleEllipsis
                },
                {
                    title: "Checker",
                    url: "/tools/strength-checker",
                    icon: ShieldCheck
                }
            ]
        },
        {
            title: "Settings",
            url: "/settings/account",
            icon: Settings,
            end: false,
            items: [
                {
                    title: "My account",
                    url: "/settings/account",
                    icon: UserCog
                },
                {
                    title: "Appearance",
                    url: "/settings/appearance",
                    icon: SunMoon
                },
                {
                    title: "Security",
                    url: "/settings/security",
                    icon: KeyRound
                },
            ]
        }
    ],

    user: {
        email: "my@example.com",
        avatar: "avatar"
    }
}

export function AppSidebar() {
    const { client } = useWorkerService();
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function loadUser() {
            const user = await client.AuthService.user();
            setUser(user);
        }
        loadUser();
    }, [client, user])
   
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 p-0 h-10">
                    <AegisPassShield className="shrink-0" />
                    <span className="text-2xl font-bold tracking-wide mb-0.5 whitespace-nowrap transition-all duration-200 opacity-100 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden">
                        <span className="text-accent-brand/90">Aegis-Pass</span>
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavVault items={data.navVault} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem className="p-0">
                        <NavUser user={user ?? data.user} />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}