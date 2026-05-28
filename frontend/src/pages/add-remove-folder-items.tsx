
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
 } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { useWorkerService } from "@/context/worker-provider";
import ItemTableBase from "./item-table-base";
import { EmptyState } from "@/components/empty-state";
import { LayoutList, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { DecryptedFolder, DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import { Button } from "@/components/ui/button";
import { toastQueue } from "@/utils/toast-queue";
import { Spinner } from "@/components/ui/spinner";



export default function AddRemoveFolderItemPage() {

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { client } = useWorkerService();
    const [items, setItems] = useState< DecryptedVaultItemMeta[] | null>(null)
    const [checkboxSelectedItems, setCheckboxSelectedItems] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("");
    const [folder, setFolder] = useState<DecryptedFolder | null>(null)


    
    const { id } = useParams();

    // const {searchQuery} = useOutletSearch();
    const action = location.pathname.includes("/add") ? "add" : "remove"
    
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
        async function fetchData() {
            setIsLoading(true)
            try {
                let data;
                if (action === "add") {
                    data = await client.CryptoService.getFolderDetail("no_folder");
                } else {
                    data = await client.CryptoService.getFolderDetail(id ?? "nullItems");
                }
                const folders = await client.CryptoService.getFolders()
                const folder = folders.filter(f => f.id === id)[0]
                setFolder(folder)
                setItems(data ?? null)
            } catch (error: any) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData();
    }, [client, location.key])

    async function handleAddRemove() {
        setIsLoading(true)
        try {
            if (action === "add") {
                await client.CryptoService.addItemsToFolder({folder_id: id ?? "", item_ids: checkboxSelectedItems});
                toastQueue.push("Moved successfully.", "success")
            } else {
                await client.CryptoService.removeItemsFromFolder({folder_id: id ?? "", item_ids: checkboxSelectedItems});
                toastQueue.push("Removed successfully.", "success")
            }
            closeModal()
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }


    function closeModal() {
        const background = location.state?.backgroundLocation?.pathname ?? "/vault";
        // navigate to background page with clean state — no backgroundLocation
        // this creates a new history entry → new location.key → triggers refetch
        navigate(background, { replace: true });
    }

    return (
        <Dialog
            open
            // onOpenChange={() => {navigate(-1)}}
            onOpenChange={closeModal}  
        >
            <DialogContent 
                className="w-full top-1/2 right-0 bg-background sm:max-w-[500px]
                data-[state=open]:animate-in
                data-[state=closed]:animate-out
                data-[state=open]:fade-in-0
                data-[state=closed]:fade-out-0
                data-[state=open]:slide-in-from-top-6
                data-[state=closed]:slide-out-to-top-6
                duration-30 ease-out"
            >

                <DialogHeader className="mx-3 gap-0 flex">
                    <DialogTitle className="text-2xl font-bold mb-2">
                        {folder?.name}
                    </DialogTitle>
                    <div className="flex relative items-center mt-2">
                        <Search className="absolute mx-2" size={20}/>
                        <Input  
                            className="pl-10" 
                            autoFocus={false}
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </DialogHeader>
                <Card className="overflow-hidden m-1 p-1 bg-background border-0 shadow-none">
                    <CardContent className="p-0">
                        {!items || items.length === 0 ? (
                            <EmptyState
                                icon={<LayoutList size={32} className="text-muted-foreground/40" />}
                                title="No Items."
                                description=""
                            />
                        ) : (
                            <ItemTableBase data={displayItems} compactTable={true} checkBoxColumn={true} checkboxSelectedItems={checkboxSelectedItems} setCheckboxSelectedItems={setCheckboxSelectedItems} />
                            
                        )}
                    </CardContent>
                    <CardFooter>
                        {action === "add" ?
                            <Button 
                                variant="default"
                                className="ml-auto flex items-center justify-between gap-1"
                                onClick={handleAddRemove}
                            >
                                {isLoading && <Spinner />}
                                <span>Add</span>
                            </Button>
                            :
                            <Button 
                                variant="outline"
                                className="ml-auto flex items-center justify-between gap-1"
                                onClick={handleAddRemove}
                            >
                                {isLoading && <Spinner />}
                                <span>Remove</span>
                            </Button>
                        }
                    </CardFooter>
                </Card>


            </DialogContent>
        </Dialog>
        
    )
}