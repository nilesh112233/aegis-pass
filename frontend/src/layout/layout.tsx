import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import VaultHeader from "@/components/vault-header";


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
    "/notification":            "Notifications",
};

export default function Layout() {
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] ?? "Vault";
    const HIDE_SEARCH_BUTTON = [ "/settings", "/vault/trash", "/tools" ];
    const hideSearchBar = HIDE_SEARCH_BUTTON.some((path) => location.pathname.startsWith(path));

    const [searchQuery, setSearchQuery] = useState("");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <VaultHeader title={title}  hideSearchBar={hideSearchBar} searchQuery={searchQuery} setSearchQuery={setSearchQuery} sidebarTrigger={<SidebarTrigger className="-ml-1" />} />
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
