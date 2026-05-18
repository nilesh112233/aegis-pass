
import { useState, useEffect, useMemo } from "react";
import { useWorkerService } from "@/context/worker-provider";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import ItemTableBase from "./item-table-base";
import { EmptyState } from "@/components/empty-state";
import { Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useOutletSearch } from "@/hooks/use-outlet-search";



export default function VaultFavouritesItemPage() {

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
            setIsLoading(true)
            try {
                const data = await client.CryptoService.getItems();
                // console.log(data);
                // setItems(data ?? null)
                setItems(data.filter((item) => (item.is_favourite === true)) ?? null)
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
                Loading favourites…
            </div>
        );
    }

    return (
        <>
            {!items || items.length === 0 ? (
                <EmptyState
                    icon={<Star size={32} className="text-muted-foreground/40" />}
                    title="No favourits."
                    description="Favourit items appear here. Add your frequently used items to favourits."
                />
            ) : (
                // <TrashItemTable
                //     items={items}
                //     onRestore={handleRestore}
                //     onPermanentDelete={handlePermanentDelete}
                // />
                <ItemTableBase data={displayItems} />
            )}
        </>
    )
}