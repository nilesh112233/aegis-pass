import { Outlet, Link, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";


const PAGE_TITLES: Record<string, string> = {
    "/vault":                   "Vault",
    "/vault/logins":            "Logins",
    "/vault/secure-notes":      "Secure Notes",
    "/vault/favourits":         "Favourites",
    "/vault/trash":             "Trash",
    "/vault/folders":           "Folders",

    "/tools/generator":         "Generator",
    "/tools/strength-checker":  "Strength Checker",
    
    "/settings/account":        "Account",
    "/settings/security":       "Security",
    "/settings/appearance":     "Appearance",
    "/generate":                "Password Generator",
};

export default function Layout() {
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] ?? "Vault";
    const HIDE_ADD_BUTTON = [ "/settings", "/vault/trash" ];
    const HIDE_SEARCH_BUTTON = [ "/settings", "/vault/trash", "/tools" ];
    const hideAddButton = HIDE_ADD_BUTTON.some((path) => location.pathname.startsWith(path));
    const hideSearchBar = HIDE_SEARCH_BUTTON.some((path) => location.pathname.startsWith(path));

    const [searchQuery, setSearchQuery] = useState("");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className=" sticky top-0 z-50 bg-background flex h-16 shrink-0 items-center justify-between gap-2 mx-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <h1 className="font-semibold text-lg">{title}</h1>

                    </div>
                    {!hideAddButton && 
                        <div className="flex gap-5 justify-between">
                            {!hideSearchBar &&
                                <div className="flex relative items-center my-auto">
                                    <Search className="absolute mx-2" size={20}/>
                                    <Input  
                                        className="pl-10" 
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            }
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-accent-brand-muted hover:bg-accent-brand cursor-pointer">
                                        <Plus className="text-white"/>
                                        <span className="text-white">Add</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <Link 
                                        to="/vault/item/new/login"
                                        state={{ backgroundLocation: location }}
                                    >
                                        <DropdownMenuItem className="cursor-pointer">Login</DropdownMenuItem>
                                    </Link>
                                    <Link 
                                        to="/vault/item/new/secure_note"
                                        state={{ backgroundLocation: location }}
                                        >
                                        <DropdownMenuItem className="cursor-pointer">Secure Note</DropdownMenuItem>
                                    </Link>
                                    <Link 
                                        to="/vault/new/folder"
                                        state={{ backgroundLocation: location }}
                                        >
                                        <DropdownMenuItem className="cursor-pointer">Folder</DropdownMenuItem>
                                    </Link>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    }
                </header>
                <div className="p-4">
                    <Outlet context={{ searchQuery }} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}














{/* <svg
  width="35"
  height="35"
  viewBox="0 0 40 44"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M20 2.5L4 9V21C4 30.5 11 37.5 20 41C29 37.5 36 30.5 36 21V9L20 2.5Z"
    fill="none"
    stroke="#6366f1"
    stroke-width="4"
    stroke-linejoin="round"
  />
  <circle cx="20" cy="17" r="5" fill="#6366f1" />
  <rect
    x="18.2"
    y="21.5"
    width="4"
    height="8.5"
    fill="#6366f1"
  />
</svg> */}
