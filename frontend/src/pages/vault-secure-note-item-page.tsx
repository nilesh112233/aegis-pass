
import { useState, useEffect } from "react";
import { useWorkerService } from "@/context/worker-provider";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import ItemTableBase from "./item-table-base";
import { useLocation } from "react-router-dom";
import { useOutletSearch } from "@/hooks/use-outlet-search";
import { useMemo } from "react";
import { EmptyState } from "@/components/empty-state";
import { StickyNote } from "lucide-react";
import { Link } from "react-router-dom";


export default function VaultSecureNotesItemPage() {

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
                    (name.toLowerCase().includes(query) ||
                    url?.toLowerCase().includes(query) ||
                    username?.toLowerCase().includes(query)) && item.item_type === "secure_note"
                );
            });
    
        }, [items, searchQuery])

    useEffect(() => {
        if (location.state?.backgroundLocation) return;

        async function fetchVault() {
            setIsLoading(true)
            try {
                const data = await client.CryptoService.getItems();
                console.log(data);
                setItems(data?.filter((item) => (item.item_type === "secure_note")) ?? null)
            } catch (error: any) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchVault();
        console.log(displayItems)
        console.log("0000000")
    }, [client, location.key])
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading trash…
            </div>
        );
    }

    return (
        <div>
            {!displayItems || displayItems.length === 0 ? (
                <div>
                    <EmptyState
                        icon={<StickyNote size={32} className="text-muted-foreground/40" />}
                        title="No saved Secure note yet."
                        description=""
                    />
                    <div className="flex items-center justify-center gap-1 text-center">
                        <p className="text-xs text-muted-foreground max-w-xs">Secure notes appear here. </p>
                        <Link 
                            to="/vault/item/new/secure_note" 
                            state={{ backgroundLocation: location }}
                            className="text-xs text-accent-brand m-0 "
                            >
                            Add new Secure note.
                        </Link>
                    </div>
                </div>
            ) : (
                <ItemTableBase data={displayItems} />            
            )}
        </div>
    )
}