import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontalIcon, RotateCcw, Trash2, StickyNote } from "lucide-react";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";

type Props = {
    items: DecryptedVaultItemMeta[];
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
};

export default function TrashItemTable({ items, onRestore, onPermanentDelete }: Props) {
    console.log(items)
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Deleted at</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id} className=" hover:opacity-100 transition-opacity">

                        {/* name + url */}
                        <TableCell>
                            <div className="flex items-center gap-3">
                                {/* <div className="h-8 w-8 rounded-md bg-destructive/10 text-destructive/60 flex items-center justify-center text-xs font-medium shrink-0">
                                    {item.item_meta_preview.name[0].toUpperCase()}
                                </div> */}
                                {item.item_type === "login" ? 
                                    <div className="h-8 w-8 rounded-md bg-destructive/10 text-destructive/60 flex items-center justify-center text-xs font-medium shrink-0">
                                        {item.item_meta_preview.name[0].toUpperCase()}
                                    </div> :
                                    <div className="ml-1 mr-1">
                                        <StickyNote className="opacity-60 text-destructive/60" />
                                    </div>
                                
                                }
                                <div>
                                    <p className="text-sm line-through text-muted-foreground">
                                        {item.item_meta_preview.name}
                                    </p>
                                    {item.item_meta_preview.url && (
                                        <p className="text-xs text-muted-foreground/60">
                                            {item.item_meta_preview.url}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </TableCell>

                        {/* type */}
                        <TableCell className="hidden md:table-cell">
                            {item.item_type === "login" ?
                                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 pb-1 flex items-center justify-center cursor-pointer">
                                    {item.item_type}
                                </Badge>
                                :
                                <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 pb-1 flex items-center justify-center cursor-pointer">
                                    {item.item_type}
                                </Badge>
                            }
                        </TableCell>

                        {/* deleted at */}
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {item.deleted_at
                                ? new Date(item.deleted_at).toLocaleString('en-GB')
                                : "—"}
                        </TableCell>

                        {/* actions */}
                        <TableCell className="text-right">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontalIcon size={15} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => onRestore(item.id)}
                                            className="gap-2"
                                        >
                                            <RotateCcw size={13} />
                                            Restore
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem variant="destructive" className="gap-2" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 size={13} />
                                                Delete permanently
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <span className="font-medium text-foreground">
                                                {item.item_meta_preview.name}
                                            </span>{" "}
                                            will be permanently removed. This cannot be undone and the data cannot be recovered.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={() => onPermanentDelete(item.id)}
                                        >
                                            Delete permanently
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}