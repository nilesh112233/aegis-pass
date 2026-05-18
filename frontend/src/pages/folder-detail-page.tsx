import { useWorkerService } from "@/context/worker-provider";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom"
import { useOutletSearch } from "@/hooks/use-outlet-search";
import ItemTableBase from "./item-table-base";
import { type DecryptedFolder, type DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import { EmptyState } from "@/components/empty-state";
import { Folder, LayoutList } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


export default function FolderDetailPage() {


    const location = useLocation();
    const [items, setItems] = useState< DecryptedVaultItemMeta[] | null>(null)
    const {id} = useParams();
    const { client } = useWorkerService();
    const [isLoading, setIsLoading] = useState(false);
    const [folder, setFolder] = useState<DecryptedFolder | null >(null)

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
        setIsLoading(true)
        async function fetchFolder(id: any) {
            try {
                const data = await client.CryptoService.getFolderDetail(id);
                setItems(data ?? null)

                const folders = await client.CryptoService.getFolders();
                const folder = folders.filter(f => f.id === id)[0]
                setFolder(folder)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false);
            }
        }

        fetchFolder(id)
    }, [id, location.key])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading vault…
            </div>
        );
    }

    return (
        <div>
            <div className="font-semibold text-accent-brand-muted text-xl mb-5 flex gap-2 items-center"><Folder className="font-bold" /> <span>{folder?.name}</span></div>
            {!items || items.length === 0 ? (
                <div>
                    <EmptyState
                        icon={<LayoutList size={32} className="text-muted-foreground/40" />}
                        title="No Items"
                        description=""
                    />
                    <div className="flex items-center justify-center gap-1 text-center">
                        <p className="text-xs text-muted-foreground max-w-xs">Folder items appear here. </p>
                        <Link 
                            to={`/vault/folder/${folder?.id}/add`} 
                            state={{ backgroundLocation: location }}
                            className="text-xs text-accent-brand m-0 "
                            >
                            Add item
                        </Link>
                    </div>
                </div>
            ) : (
                <div>
                    <ItemTableBase data={displayItems} />
                    {id !== "no_folder" && <div className="mt-5 flex items-center gap-5 justify-end">
                        <Button 
                            variant="outline"
                            className="flex items-center justify-between gap-1"
                        >
                            <Link 
                                to={`/vault/folder/${folder?.id}/remove`}
                                state={{ backgroundLocation: location }}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer"
                            >
                                Remove item
                            </Link>
                            
                        </Button>
                        <Button 
                            variant="default"
                            className="flex items-center justify-between gap-1"
                        >
                            <Link 
                                to={`/vault/folder/${folder?.id}/add`}
                                state={{ backgroundLocation: location }}
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer"
                            >
                                Add item
                            </Link>
                        </Button>
                    </div>}
                </div>

            )}
        </div>
    )
}

