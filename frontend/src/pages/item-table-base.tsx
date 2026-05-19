import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Globe, Minus, MoreHorizontalIcon, Star, StickyNote, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
import { useWorkerService } from "@/context/worker-provider";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import stringToColor from "@/utils/string-initials-logo";
import { toastQueue } from "@/utils/toast-queue";
import { useState, useEffect } from "react";
import useLocalStorage from "@/hooks/use-localstorage";
import timeAgo from "@/utils/time-ago-format";
import { Checkbox } from "@/components/ui/checkbox";

type ItemTableBaseProps = {
    data: DecryptedVaultItemMeta[] | null;
    compactTable?: boolean;
    checkBoxColumn?: boolean;
    checkboxSelectedItems?: string[];
    // setCheckboxSelectedItems?: (items: string[]) => void;
    setCheckboxSelectedItems?: React.Dispatch<
        React.SetStateAction<string[]>
    >;
}
export default function ItemTableBase({ data, checkBoxColumn=false, compactTable=false, checkboxSelectedItems, setCheckboxSelectedItems }: ItemTableBaseProps) {

    const location = useLocation();
    const navigate = useNavigate();
    const { client } = useWorkerService();

    const [items, setItems] = useState<DecryptedVaultItemMeta[] | null>(data);


    // const show_type_badge = localStorage.getItem("show_type_badge");
    // const show_updated_at = localStorage.getItem("show_updated_at");
    // const show_username = localStorage.getItem("show_username");
    
    // const [show_type_badge, setShowTypeBadge] = useState(localStorage.getItem("show_type_badge"));
    // const [show_updated_at, setShowUpdatedAt] = useState(localStorage.getItem("show_updated_at"));
    // const [show_username, setShowUsername] = useState(localStorage.getItem("show_username"));
    
    // useEffect(() => {
    //     setShowTypeBadge(localStorage.getItem("show_type_badge"));
    //     setShowUpdatedAt(localStorage.getItem("show_updated_at"));
    //     setShowUsername(localStorage.getItem("show_username"));
    // }, [localStorage])

    const [show_type_badge] = useLocalStorage("show_type_badge", true);
    const [show_updated_at] = useLocalStorage("show_updated_at", true);
    const [show_username] = useLocalStorage("show_username", true);

    // sync when parent passes new data (e.g. after page refetch)
    useEffect(() => {
        console.log(location)
        setItems(data);
    }, [data]);

    async function toggleIsFavourite(id: string) {
        await client.CryptoService.toggleFavourite(id);
        // patch local state — no refetch needed
        setItems(prev =>
            prev?.map(item =>
                item.id === id
                    ? { ...item, is_favourite: !item.is_favourite }
                    : item
            ) ?? null
        );
        toastQueue.push(items?.filter(item => item.id === id)[0].is_favourite ? "Removed from favourites" : "Added to favourites")
    }

    async function deleteItem(id: string) {
        await client.CryptoService.deleteItem(id);
        // remove from local state — no refetch needed
        setItems(prev => prev?.filter(item => item.id !== id) ?? null);
        toastQueue.push("Moved to trash")
    }

    async function copyPassword(id: any) {
        const item = await client.CryptoService.getItem(id);
        if (item.item_type === "login") {
            await navigator.clipboard.writeText(item.item_data.password ?? "")
            toastQueue.push("Copied to clipboard.", "success")
        }
        return;
    }

    // const toggleItem = (id: string) => {
    //     setCheckboxSelectedItems((prev) =>
    //         prev.includes(id)
    //             ? prev.filter((x) => x !== id)
    //             : [...prev, id]
    //     )
    // }

    const toggleItem = (id: string) => {
        if (!checkboxSelectedItems) return;

        if (checkboxSelectedItems.includes(id)) {
            setCheckboxSelectedItems?.(
                checkboxSelectedItems.filter(itemId => itemId !== id)
            );
        } else {
            setCheckboxSelectedItems?.([
                ...checkboxSelectedItems,
                id
            ]);
        }
    };

    const allSelected = items !== null &&
        items.length > 0 &&
        checkboxSelectedItems?.length === items.length

    const toggleSelectAll = () => {

        if (allSelected) {
            setCheckboxSelectedItems?.([])
        } else {
            setCheckboxSelectedItems?.((items ?? []).map((x) => x.id))
        }
    }

  return (
    <div>
        <hr />
        <Table>
            <TableHeader>
                <TableRow>
                    {checkBoxColumn && 
                        <TableHead>
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={() => toggleSelectAll()}
                                className="mr-2"
                            /> All
                        </TableHead>
                    }
                    
                    {!compactTable && <TableHead className="hidden sm:table-cell">Favorite</TableHead>}
                    <TableHead>Name</TableHead>
                    {(!compactTable && show_username) && <TableHead className="hidden md:table-cell">Username</TableHead>}
                    {(!compactTable && show_type_badge) && <TableHead className="hidden lg:table-cell">Type</TableHead>}
                    {(!compactTable && show_updated_at) &&<TableHead className="hidden lg:table-cell">Last Updated</TableHead>}
                    {!compactTable && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {items?.map((item: DecryptedVaultItemMeta | null) => {
                    if (item === null || items.length == 0) {
                        return (
                            <div>Add Password.</div>
                        )
                    }
                    return (
                        <TableRow key={item.id} className="hover:bg-accent-brand-soft">
                            {checkBoxColumn && 
                                <TableCell>
                                    <Checkbox
                                        checked={checkboxSelectedItems?.includes(item.id)}
                                        onCheckedChange={() => toggleItem(item.id)}
                                    />
                                </TableCell>
                            }
                            
                            {!compactTable &&
                                <TableCell className="hidden sm:table-cell">
                                    <Button variant="ghost" className="hover:bg-transparent p-0 m-0 cursor-pointer" onClick={() => toggleIsFavourite(item.id)}>
                                        {item.is_favourite ? 
                                            <Star className="text-accent-brand-muted"/> : <Star className="text-fg-muted hover:text-accent-brand-muted"/>
                                        }
                                    </Button>
                                </TableCell>
                            }
                            <TableCell 
                                className="cursor-pointer transition-transform duration-50 hover:scale-x-105 overflow-hidden no-scrollbar"
                                onClick={() => navigate(`/vault/item/${item.id}`, { state: { type: item.item_type, backgroundLocation: location }})}
                            >
                                <div  className="flex items-center">
                                    {item.item_type === "login" ? 
                                        <div className={`border- font-semibold rounded-md bg-fg-subtle h-8 w-8 flex items-center justify-center mr-3 cursor-pointer ${stringToColor(item.item_meta_preview.name)}`}>
                                            {item.item_meta_preview.name[0].toUpperCase()}
                                        </div> :
                                        <div className="ml-1 mr-2 pr-2">
                                            <StickyNote />
                                        </div>
                                    
                                    }
                                    <div className="">
                                        <div className="cursor-pointer">{item.item_meta_preview.name}</div>
                                        {item.item_meta_preview.url && 
                                            <div className="flex items-center justify-start text-xs text-muted-foreground">
                                                <Globe size={11} className="text-xs text-muted-foreground mt-0.5"/>
                                                <div className="text-xs text-muted-foreground cursor-pointer pl-1 truncate max-w-[200px]">{item.item_meta_preview.url}</div>
                                            </div>
                                        }
                                    </div>                                
                                </div>
                            </TableCell>
                            {(!compactTable && show_username) &&
                                <TableCell className="hidden md:table-cell">
                                    {item.item_meta_preview.username ? <Badge variant="secondary" className="cursor-pointer">{item.item_meta_preview.username}</Badge> : <Minus size={20} />}
                                </TableCell>
                            }
                            {(!compactTable && show_type_badge) && 
                                <TableCell className="hidden lg:table-cell">
                                    {item.item_type === "login" ?
                                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 pb-1 flex items-center justify-center cursor-pointer">
                                            {item.item_type}
                                        </Badge>
                                        :
                                        <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 pb-1 flex items-center justify-center cursor-pointer">
                                            {item.item_type.replaceAll("_", "-")}
                                        </Badge>
                                    }
                                    
                                </TableCell>
                            }
                            {(!compactTable && show_updated_at) && <TableCell className="cursor-pointer hidden lg:table-cell">{timeAgo(new Date(item.updated_at))}</TableCell>}
                            {!compactTable &&
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                                            <MoreHorizontalIcon />
                                            <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {item.item_type == "login" &&
                                                <>
                                                    <DropdownMenuItem 
                                                        onClick={async () => {
                                                            await navigator.clipboard.writeText(item.item_meta_preview.username ?? "");
                                                            toastQueue.push("Copied to clipboard.", "success")
                                                        }}
                                                    >
                                                        Copy username
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => copyPassword(item.id)}>Copy password</DropdownMenuItem>
                                                </>
                                            }
                                            <DropdownMenuItem onClick={() => navigate(`/vault/item/${item.id}`, { state: { type: item.item_type, backgroundLocation: location }})}>View</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/vault/item/${item.id}/edit`, { state: { type: item.item_type, backgroundLocation: location }})}>Edit</DropdownMenuItem>
                                            <DropdownMenuSeparator className="mx-1"/>

                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem variant="destructive" >
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                        </DropdownMenu>

                                        <AlertDialogContent size="sm">
                                            <AlertDialogHeader className="text-destructive dark:text-destructive">
                                                <AlertDialogMedia className="bg-transparent p-0 m-0">
                                                    <Trash2Icon />
                                                </AlertDialogMedia>
                                                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure want to move this item to trash?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel variant="outline">Cancle</AlertDialogCancel>
                                                <AlertDialogAction
                                                    variant="destructive"
                                                    onClick={() => deleteItem(item.id)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            }
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
        <hr />
    </div>
  )
}
