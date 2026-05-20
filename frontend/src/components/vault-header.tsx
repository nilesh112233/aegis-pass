import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Plus,
    Search,
    X,
} from "lucide-react";

type VaultHeaderProps = {
    title: string;
    hideSearchBar?: boolean;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    sidebarTrigger?: React.ReactNode;
};

export default function VaultHeader({
    title,
    hideSearchBar = false,
    searchQuery,
    setSearchQuery,
    sidebarTrigger,
}: VaultHeaderProps) {
    
    const location = useLocation();
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    
    useEffect(() => {
        setMobileSearchOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setMobileSearchOpen(false);
            }
        }

        if (mobileSearchOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [mobileSearchOpen]);



    return (
        <header 
            ref={searchContainerRef}
            className="border-b px-4 py-3 flex items-center justify-between gap-3"
        >

            {/* LEFT SECTION */}
            {!mobileSearchOpen && (
                <div className="flex items-center gap-3 min-w-0">

                    {/* Sidebar Trigger */}
                    {sidebarTrigger}

                    {/* Title */}
                    <h1 className="text-lg font-semibold truncate">
                        {title}
                    </h1>
                </div>
            )}

            {/* RIGHT SECTION */}
            <div
                className={`flex items-center gap-3 ${
                    mobileSearchOpen ? "w-full" : ""
                }`}
            >

                {/* MOBILE SEARCH MODE */}
                {mobileSearchOpen ? (
                    <div className="flex items-center gap-2 w-full md:hidden relative ">
                        <Search
                            className="absolute left-3 text-muted-foreground"
                            size={18}
                        />

                        <Input
                            autoFocus
                            ref={searchInputRef}
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                            className="flex-1 pl-10"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileSearchOpen(false)}
                        >
                            <X size={20} />
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* DESKTOP SEARCH */}
                        {!hideSearchBar && (
                            <div className="hidden md:flex relative items-center">

                                <Search
                                    className="absolute left-3 text-muted-foreground"
                                    size={18}
                                />

                                <Input
                                    className="pl-10 w-[250px]"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                {searchQuery &&
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ml-1"
                                    >
                                        <X size={16} />
                                    </button>
                                }
                            </div>
                        )}

                        {/* MOBILE SEARCH ICON */}
                        {!hideSearchBar && (
                            <div
                                // variant="ghost"
                                className="md:hidden mx-1"
                                onClick={() =>
                                    setMobileSearchOpen(true)
                                }
                            >
                                <Search size={22} />
                            </div>
                        )}

                        {/* ADD BUTTON */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>

                                <Button className="bg-accent-brand-muted hover:bg-accent-brand cursor-pointer">

                                    <Plus className="text-white" />

                                    <span className="text-white">
                                        Add
                                    </span>
                                </Button>

                            </DropdownMenuTrigger>

                            <DropdownMenuContent>

                                <Link
                                    to="/vault/item/new/login"
                                    state={{
                                        backgroundLocation: location,
                                    }}
                                >
                                    <DropdownMenuItem className="cursor-pointer">
                                        Login
                                    </DropdownMenuItem>
                                </Link>

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>
        </header>
    );
}