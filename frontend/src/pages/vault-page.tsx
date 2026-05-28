
import { useState, useEffect, useMemo } from "react";
import { useWorkerService } from "@/context/worker-provider";
import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";
import ItemTableBase from "./item-table-base";
import { useLocation, useNavigate } from "react-router-dom";
import { useOutletSearch } from "@/hooks/use-outlet-search";
import { Card } from "@/components/ui/card";
import { Clock, KeyRound, RotateCcwKey, RotateCw, ShieldPlus, ShieldQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/empty-state";
import timeAgo from "@/utils/time-ago-format";

export default function VaultPage() {

    const navigate = useNavigate()
    const location = useLocation();
    const { client } = useWorkerService();

    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState< DecryptedVaultItemMeta[] | null>(null)
    
    const [analysingVault, setAnalysingVault] = useState(false)
    const [totalPasswords, setTotalPasswords] = useState<number>(0)
    const [reusedPasswords, setReusedPasswords] = useState<number>(0)
    const [weakPasswords, setWeakPasswords] = useState<number>(0)
    const [recentlyAdded, setRecentlyAdded] = useState<number>(0)
    const [noOfPasswordsReused, setNoOfPasswordsReused] = useState<number>(0)
    const [noOfFolders, setNoOfFolders] = useState<number>(0)
    const [lastScannedVaultAt, setLastScannedVaultAt] = useState("")

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
                setItems(data ?? null);
                const folders = await client.CryptoService.getFolders();
                setNoOfFolders(folders.length)
            } catch (error: any) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchVault();
    }, [client, location.key])

    async function analyseVault() {
        const report = await client.CryptoService.analyseVault();
        const reportMeta = {
            total_passwords: report.total_passwords,
            weak_passwords: report.weak_passwords.length,
            no_of_passwords_reused: report.reused_passwords.length,
            reused_passwords: report.reused_passwords.flat().length,
            recently_added: report.recently_added.length,
        }

        localStorage.setItem("lastVaultAnalysedAt", JSON.stringify(Date.now()))
        localStorage.setItem("lastVaultAnalysis", JSON.stringify(reportMeta))
        
        setTotalPasswords(reportMeta.total_passwords ?? 0);
        setReusedPasswords(reportMeta.reused_passwords ?? 0);
        setWeakPasswords(reportMeta.weak_passwords ?? 0);
        setRecentlyAdded(reportMeta.recently_added ?? 0);
        setNoOfPasswordsReused(reportMeta.no_of_passwords_reused ?? 0);
        setLastScannedVaultAt(timeAgo(Date.now()))
        
    }

    useEffect(() => {
        
        setLastScannedVaultAt(timeAgo(localStorage.getItem("lastVaultAnalysedAt")) ?? "")
        const lastVaultAnalysedAt = JSON.parse(localStorage.getItem("lastVaultAnalysedAt") ?? "null")

        if (!lastVaultAnalysedAt) {
            analyseVault();
            
        }

        const report = JSON.parse(localStorage.getItem("lastVaultAnalysis") ?? "null");

        if (report) {
            setTotalPasswords(report.total_passwords ?? 0);
            setReusedPasswords(report.reused_passwords ?? 0);
            setWeakPasswords(report.weak_passwords ?? 0);
            setRecentlyAdded(report.recently_added ?? 0);
            setNoOfPasswordsReused(report.no_of_passwords_reused ?? 0)
        }

    }, [])

    async function handleAnalysingVault () {
        setAnalysingVault(true);
        try {
            analyseVault()
        } catch (error) {
            console.log("Error scanning vault for analysis.")
        } finally {
            setAnalysingVault(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading vault…
            </div>
        );
    }

    return (
        <div>
            {!searchQuery && 
                <div>
                    <div className="-mt-2 mb-5 flex gap-2 w-full items-center"> 
                        <span className="text-xs text-fg-muted mr-2">Vault Dashboard</span>
                        <hr className=" flex-1"/>
                        
                    </div>
                    
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-5 flex-1 cursor-pointer" onClick={() => navigate("logins")}>
                            <div className="flex justify-between items-center flex-1">
                                <div className="flex flex-col justify-between gap-1">
                                    <span className="text-sm text-fg-muted font-semibold">Total passwords</span>
                                    <span className="text-xl font-semibold">{totalPasswords}</span>
                                </div>
                                <div className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 cursor-pointer border-0 rounded-lg p-2">
                                    <KeyRound />
                                </div>
                            </div>
                            <span className="text-xs text-fg-muted">{noOfFolders && `across ${noOfFolders} folders`}</span>
                        </Card>
                        <Card className="p-5 flex-1">
                            <div className="flex justify-between items-center flex-1">
                                <div className="flex flex-col justify-between gap-1">
                                    <span className="text-sm text-fg-muted font-semibold">Reused passwords</span>
                                    <span className="text-xl font-semibold">{reusedPasswords}</span>
                                </div>
                                <div className="bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300 cursor-pointer border-0 rounded-lg p-2">
                                    <RotateCcwKey />
                                </div>
                            </div>
                            <span className="text-xs text-fg-muted">{noOfPasswordsReused} {noOfPasswordsReused === 1 ? "password is" : "passwords are"} used multiple times</span>
                        </Card>
                        <Card className="p-5 flex-1">
                            <div className="flex justify-between items-center flex-1">
                                <div className="flex flex-col justify-between gap-1">
                                    <span className="text-sm text-fg-muted font-semibold">Weak passwords</span>
                                    <span className="text-xl font-semibold">{weakPasswords}</span>
                                </div>
                                <div className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 cursor-pointer border-0 rounded-lg p-2">
                                    <ShieldQuestionMark />
                                </div>
                            </div>
                            <span className="text-xs text-fg-muted">{weakPasswords} {weakPasswords > 1 ? "passwords need attention" : "password needs attention" }</span>
                        </Card>
                        <Card className="p-5 flex-1">
                            <div className="flex justify-between items-center flex-1">
                                <div className="flex flex-col justify-between gap-1">
                                    <span className="text-sm text-fg-muted font-semibold">Recently added</span>
                                    <span className="text-xl font-semibold">{recentlyAdded}</span>
                                </div>
                                <div className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer border-0 rounded-lg p-2">
                                    <Clock />
                                </div>
                            </div>
                            <span className="text-xs text-fg-muted">Added in last 30 days</span>
                        </Card>
                    </div>
                    <div className="flex justify-between mt-2 mb-5">
                        <Button 
                            className="mb-2 p-0 flex gap-2 justify-end" 
                            variant="ghost" 
                            disabled={analysingVault}
                            onClick={handleAnalysingVault}
                        >
                            {analysingVault ? <Spinner className="text-fg-muted"/> : <RotateCw size={16} className="text-fg-muted"/>}
                            <span className="text-xs text-fg-muted mr-2">{ analysingVault ? "scanning": "Scan now" }</span>
                        </Button>
                        <span className="text-xs text-fg-muted">Last synced {lastScannedVaultAt}</span>
                    </div>

                </div>

            }  
            <div className="flex gap-2 w-full items-center"> 
                <span className="text-xs text-fg-muted mr-2">{searchQuery ? "Search result" : "Vault Itmes"}</span>
                <hr className=" flex-1"/>
            </div>

            <div className="mt-8">
                {!displayItems || displayItems.length === 0 ? (
                    <div>
                        <EmptyState
                            icon={<ShieldPlus size={32} className="text-muted-foreground/40" />}
                            title="No vault items yet."
                            description=""
                        />
                        <div className="flex items-center justify-center gap-1 text-center">
                            <p className="text-xs text-muted-foreground max-w-xs">Vault items appear here. </p>
                            {/* <Link 
                                to="/vault/item/new/login" 
                                state={{ backgroundLocation: location }}
                                className="text-xs text-accent-brand m-0 "
                                >
                                Add new Login.
                            </Link> */}
                        </div>
                    </div>
                ) : (
                    <ItemTableBase data={displayItems} />            
                )}
            </div>
        </div>
    )
}