
import { useState, useEffect } from "react";
import { useWorkerService } from "@/context/worker-provider";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import ItemTableBase from "./item-table-base";
import { useLocation } from "react-router-dom";
import { useOutletSearch } from "@/hooks/use-outlet-search";
import { useMemo } from "react";
import { EmptyState } from "@/components/empty-state";
import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function VaultLoginsItemPage() {

    const { client } = useWorkerService();
    const location = useLocation();
    const [items, setItems] = useState< DecryptedVaultItemMeta[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const {searchQuery} = useOutletSearch();
    
        const displayItems = useMemo(() => {
            if (!items) return null;
    
            if (!searchQuery || !searchQuery.trim()) return items;
            
            const query = searchQuery.toLowerCase();
            return items.filter(item => {
                const { name, url, username } = item.item_meta_preview;
                return (
                    name.toLowerCase().includes(query) ||
                    url?.toLowerCase().includes(query) ||
                    username?.toLowerCase().includes(query)
                );
            });
    
        }, [items, searchQuery])

    useEffect(() => {
        if (location.state?.backgroundLocation) return;

        async function fetchVault() {
            setIsLoading(true);
            try {
                const data = await client.CryptoService.getItems();
                setItems(data?.filter((item) => (item.item_type === "login")) ?? null)
            } catch (error: any) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchVault();
    }, [client, location.key])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading trash…
            </div>
        );
    }
    return (
        // <div>
        //     {!displayItems || displayItems.length === 0 ? (
        //         <div>
        //             <EmptyState
        //                 icon={<Globe size={32} className="text-muted-foreground/40" />}
        //                 title="No saved Logins yet."
        //                 description="Logins appear here."
        //             />
        //             <Link 
        //                 to="/vault/new/item/login" 
        //                 state={{ backgroundLocation: location }} 
        //                 className="text-xs text-muted-foreground max-w-xs"
        //             >
        //                 Add new Login.
        //             </Link>
        //         </div>
        //     ) : (
        //         <ItemTableBase data={displayItems} />
        //     )}
        // </div>
        <div>
            {!displayItems || displayItems.length === 0 ? (
                <div>
                    <EmptyState
                        icon={<Globe size={32} className="text-muted-foreground/40" />}
                        title="No saved Logins yet."
                        description=""
                    />
                    <div className="flex items-center justify-center gap-1 text-center">
                        <p className="text-xs text-muted-foreground max-w-xs">Logins appear here. </p>
                        <Link 
                            to="/vault/item/new/login" 
                            state={{ backgroundLocation: location }}
                            className="text-xs text-accent-brand m-0 "
                            >
                            Add new Login.
                        </Link>
                    </div>
                </div>
            ) : (
                <ItemTableBase data={displayItems} />            
            )}
        </div>
    )
}