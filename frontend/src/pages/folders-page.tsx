import { useWorkerService } from "@/context/worker-provider"
import type { DecryptedFolder } from "@/worker/utils/types.vault";
import { ChevronRight, Dot, EllipsisVertical, Folder } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import timeAgo from "@/utils/time-ago-format";
import { useOutletSearch } from "@/hooks/use-outlet-search";


export default function VaultFoldersPage() {

    const { client } = useWorkerService();
    const [folderList, setFolderList] = useState<DecryptedFolder[] | null>(null);
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const {searchQuery} = useOutletSearch();
    
        const displayFolders = useMemo(() => {
            if (!folderList) return null;

            if (!searchQuery || !searchQuery.trim()) return folderList;
            
            const query = searchQuery.toLowerCase();
            return folderList.filter(folder => (folder.name.toLowerCase().includes(query))
            )

        }, [folderList, searchQuery])

    useEffect(() => {
        async function getFoldersList() {
            setIsLoading(true)
            try {
                const data = await client.CryptoService.getFolders();
                setFolderList(data)
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }

        getFoldersList();
    }, [client, location.key])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading folders…
            </div>
        );
    }

    return (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div key={"no_folder"} className="border-1 rounded-xl p-5 shadow-2xs hover:bg-accent-brand-soft" onClick={() => navigate(`/vault/folder/${"no_folder"}`)}>
                <div className="flex justify-between items-center">
                    <div className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer border-0 rounded-lg p-2">
                        <Folder />
                    </div>
                    {/* <div>
                        <EllipsisVertical />
                    </div> */}
                </div>
                <div className="from-accent-foreground font-semibold text-lg my-2">
                    No folder
                </div>
                <div className="flex text-fg-muted text-xs">
                    <span></span>
                </div>
                <div className="flex justify-end text-xs text-fg-muted mt-6">
                    <span>view</span>
                    <ChevronRight size={16} />
                </div>
            </div>

            
            {displayFolders?.map((folder) => {
                return(
                    <div key={folder.id} className="border-1 rounded-xl p-5 shadow-2xs hover:bg-accent-brand-soft cursor-pointer" onClick={() => navigate(`/vault/folder/${folder.id}`)}>
                    {/* <div key={folder.id} className="border-1 rounded-xl p-5 shadow-2xs hover:bg-accent-brand-soft" > */}
                        <div className="flex justify-between items-center">
                            <div className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer border-0 rounded-lg p-2">
                                <Folder />
                            </div>
                            <div className="pl-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button                            
                                            onClick={(e) => e.stopPropagation()}
                                            className="cursor-pointer"
                                        >
                                            <EllipsisVertical />    
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                to={`/vault/folder/${folder.id}/add`}
                                                state={{ backgroundLocation: location }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="cursor-pointer"
                                            >
                                                Add item
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                to={`/vault/folder/${folder.id}/remove`}
                                                state={{ backgroundLocation: location }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="cursor-pointer"
                                            >
                                                Remove item
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link 
                                                to={`/vault/folder/${folder.id}/edit`}
                                                state={{ backgroundLocation: location }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="cursor-pointer"
                                            >
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild variant="destructive">
                                            <Link 
                                                to="/vault/new/folder/delete"
                                                state={{ backgroundLocation: location }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="cursor-pointer"
                                            >
                                                Delete
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="from-accent-foreground font-semibold text-lg my-2">
                            {folder.name}
                        </div>
                        <div className="flex text-fg-muted text-xs">
                            <span>{folder.no_of_items} Items</span>
                            <Dot className="pb-1"/>
                            <span>updated {timeAgo(new Date(folder.updated_at))}</span>
                        </div>
                        <div className="flex justify-end text-xs text-fg-muted">
                            <span>view</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                )
                })
            }
            
        </div>

    )
}