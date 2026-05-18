import { useWorkerService } from "@/context/worker-provider";
import { useEffect, useState } from "react";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import TrashItemTable from "@/components/trash-item-table";
import { toastQueue } from "@/utils/toast-queue";


export default function TrashPage() {
    const { client } = useWorkerService();
    const [items, setItems] = useState<DecryptedVaultItemMeta[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function load() {
        setIsLoading(true);
        try {
            const data = await client.CryptoService.getTrash();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { load(); }, [client]);

    async function handleRestore(id: string) {
        await client.CryptoService.restoreItem(id);
        setItems(prev => prev?.filter(i => i.id !== id) ?? null);
        toastQueue.push("Item restored")
    }

    async function handlePermanentDelete(id: string) {
        await client.CryptoService.permanentDeleteItem(id);
        setItems(prev => prev?.filter(i => i.id !== id) ?? null);
        toastQueue.push("Item deleted")
    }

    async function handleEmptyTrash() {
        await client.CryptoService.deleteAllItems();
        setItems([]);
        toastQueue.push(`${items?.length ?? 0} items permanently deleted`)
    }

    async function handleRestoreTrash() {
        await client.CryptoService.restoreAllItems();
        setItems([]);
        toastQueue.push(`${items?.length ?? 0} items restored`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading trash…
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">

            {/* ── header row ── */}
            {items && items.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                        {items.length} deleted {items.length === 1 ? "item" : "items"}
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-auto mr-5 font-bold text-accent-brand hover:text-accent-brand-muted text-xs h-7">
                                <RotateCcw size={12} className="mr-1 stroke-2" />
                                Restore trash
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Restore trash?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Restore all {items.length} items.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRestoreTrash}
                                >
                                    Restore trash
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive text-xs h-7">
                                <Trash2 size={12} className="mr-1" />
                                Empty trash
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all {items.length} items in the
                                    trash. This cannot be undone and the data cannot be recovered.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleEmptyTrash}
                                >
                                    Empty trash
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            {/* ── table or empty state ── */}
            {!items || items.length === 0 ? (
                <EmptyState
                    icon={<Trash2 size={32} className="text-muted-foreground/40" />}
                    title="Trash is empty"
                    description="Deleted items appear here. They are not permanently removed until you empty the trash."
                />
            ) : (
                <TrashItemTable
                    items={items}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                />
            )}

        </div>
    );
}