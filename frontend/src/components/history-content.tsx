import { useEffect, useState } from "react";
import { useWorkerService } from "@/context/worker-provider";
import { buildHistoryDiff, type HistoryEntry } from "@/utils/vault-history-diff";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
// import { ArrowRight } from "lucide-react";
import { ColoredPassword } from "./form-fields/password-field";

export function HistoryContent({ id }: { id: string }) {
    const { client } = useWorkerService();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        client.CryptoService.getItemHistory(id)
            .then((entries) => setHistory(buildHistoryDiff(entries)))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return (
        <div className="flex justify-center py-8">
            <Spinner />
        </div>
    );

    if (history.length === 0) return (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No version history yet.
        </div>
    );

    return (
        <div className="no-scrollbar max-h-[80vh] overflow-y-auto px-1 py-2 flex flex-col gap-3">
            {history.map((entry, i) => (
                <div key={entry.id} className="rounded-lg border p-3 flex flex-col gap-2">

                    {/* timestamp + version number */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Version {history.length - i}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>

                    {/* changes */}
                    {entry.changes.length === 0 ? (
                        // oldest entry — no previous to diff against
                        <p className="text-xs text-muted-foreground italic">
                            Initial version
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {entry.changes.map((change) => (
                                <div key={change.field} className="flex flex-col gap-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {change.label}
                                    </span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-xs text-foreground max-w-[180px] truncate"
                                        >
                                            {change.label === "Password" ? 
                                                <ColoredPassword value={change.current ?? ""} />
                                                :
                                                change.current
                                            }
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))} 
        </div>
    );
}
