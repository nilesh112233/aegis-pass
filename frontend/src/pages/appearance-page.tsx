import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";
import useLocalStorage from "@/hooks/use-localstorage";

const THEMES = [
    { value: "light",  label: "Light",  icon: Sun },
    { value: "dark",   label: "Dark",   icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export default function AppearancePage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* ── theme ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Theme</CardTitle>
                    <CardDescription>Choose how Aegis-Pass looks to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {THEMES.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTheme(value)}
                                className={cn(
                                    "flex flex-col items-center gap-3 rounded-lg border-2 p-4 text-sm transition-colors",
                                    theme === value
                                        ? "border-accent-brand bg-accent-brand/5 text-accent-brand"
                                        : "border-border text-muted-foreground hover:border-accent-brand/40 hover:text-foreground"
                                )}
                            >
                                <Icon size={20} />
                                {label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── vault display ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Vault display</CardTitle>
                    <CardDescription>Customise how your vault items appear.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Show item type badge</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Displays login, secure note, card label on each row.
                            </p>
                        </div>
                        <Toggle storageKey="show_type_badge" defaultValue={true} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Show last updated date</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Shows when each item was last modified.
                            </p>
                        </div>
                        <Toggle storageKey="show_updated_at" defaultValue={true} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Show username</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Shows username of logins.
                            </p>
                        </div>
                        <Toggle storageKey="show_username" defaultValue={true} />
                    </div>

                </CardContent>
            </Card>

        </div>
    );
}

// ── minimal toggle ────────────────────────────────────────────────────────
function Toggle({
    storageKey,
    defaultValue,
}: {
    storageKey: string;
    defaultValue: boolean;
}) {
    // const stored = localStorage.getItem(storageKey);
    // const [on, setOn] = useState<boolean>(
    //     stored !== null ? stored === "true" : defaultValue
    // );

    // function toggle() {
    //     const next = !on;
    //     setOn(next);
    //     localStorage.setItem(storageKey, String(next));
    // }

    const [on, setOn] = useLocalStorage(storageKey, defaultValue);

    function toggle() {
        setOn(prev => !prev);
    }
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            onClick={toggle}
            className={cn(
                "relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0",
                on ? "bg-accent-brand" : "bg-muted"
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                    on ? "translate-x-4" : "translate-x-0.5"
                )}
            />
        </button>
    );
}