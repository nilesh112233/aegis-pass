import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
    Lock, ShieldCheck, Clock, LogOut,
    Eye, EyeOff, RefreshCcw, Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWorkerService } from "@/context/worker-provider";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import type { SessionDetail } from "@/worker/utils/secure-storage";
import { Monitor } from "lucide-react";
import { toastQueue } from "@/utils/toast-queue";

// ── inactivity timeout options ────────────────────────────────────────────

const TIMEOUT_OPTIONS = [
    { label: "5 minutes",  value: 5  },
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour",     value: 60 },
] as const;

// ── change master password schema ─────────────────────────────────────────

const ChangeMasterPasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required."),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                "Must include uppercase, lowercase, number, and symbol."
            ),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

type ChangeMasterPasswordData = z.infer<typeof ChangeMasterPasswordSchema>;

// ─────────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
    const { client } = useWorkerService();
    const navigate = useNavigate();

    const [selectedTimeout, setSelectedTimeout] = useState<number>(0)
    const [sessions, setSessions] = useState<SessionDetail[] | null>(null)
    const [showChangePw, setShowChangePw] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    useEffect(() => {
        async function fetchTimeoutLimit() {
            const timelimit = await client.AuthService.configSessionTimeout(); 
            setSelectedTimeout(timelimit);

            const data = await client.AuthService.getSessionsList();
            setSessions(data);
        };
        fetchTimeoutLimit();
    }, [selectedTimeout])

    function handleTimeoutChange(value: number) {
        setSelectedTimeout(value);

        client.AuthService.configSessionTimeout(value);
    }

    async function handleLogoutAllSessions() {
        setIsLoggingOut(true);
        try {
            await client.AuthService.logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoggingOut(false);
        }
    }

    async function handleRevokeSession(id: string): Promise<void> {
        try {
            await client.AuthService.revokeSession(id)
            toastQueue.push("Session revoked succesfully", "success")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* ── encryption info ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Encryption</CardTitle>
                    <CardDescription>
                        How your vault data is protected. These cannot be changed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow label="Vault encryption">
                        <Badge variant="secondary" className="font-mono text-xs">AES-256-GCM</Badge>
                    </InfoRow>
                    <Separator />
                    <InfoRow label="Key derivation">
                        <Badge variant="secondary" className="font-mono text-xs">PBKDF2 · SHA-256</Badge>
                    </InfoRow>
                    <Separator />
                    <InfoRow label="Iterations">
                        <Badge variant="secondary" className="font-mono text-xs">600,000</Badge>
                    </InfoRow>
                    <Separator />
                    <InfoRow label="Architecture">
                        <Badge variant="secondary" className="font-mono text-xs">Zero-knowledge</Badge>
                    </InfoRow>

                    <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2.5 mt-2">
                        <Info size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your master password never leaves your device. All encryption and
                            decryption happens locally on your Device. Aegis-pass only stores
                            ciphertext — it cannot read your vault.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* ── master password ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Master Password</CardTitle>
                    <CardDescription>
                        Changing it re-encrypts every vault item with a new key.
                        This cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Lock size={15} />
                            <span className="text-sm">Password set</span>
                            <ShieldCheck size={13} className="text-emerald-400" />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowChangePw(true)}
                        >
                            <RefreshCcw size={13} className="mr-1.5" />
                            Change
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── session timeout ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Session Timeout</CardTitle>
                    <CardDescription>
                        Lock your vault automatically after this period of inactivity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        {TIMEOUT_OPTIONS.map(({ label, value }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleTimeoutChange(value)}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-sm transition-colors",
                                    selectedTimeout === value
                                        ? "border-accent-brand bg-accent-brand/5 text-accent-brand"
                                        : "border-border text-muted-foreground hover:border-accent-brand/40 hover:text-foreground"
                                )}
                            >
                                <Clock size={13} />
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        After timeout, your master password must be re-entered to unlock the vault.
                    </p>
                </CardContent>
            </Card>

            {/* ── sessions ── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Sessions</CardTitle>
                    <CardDescription>
                        Logging out invalidates your refresh token on the server.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sessions?.map((session) => (
                        <div key={session.id} className="flex items-center justify-between my-2">
                            <div className="flex items-center gap-3">
                                <Monitor size={15} className="text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{session.device_hint}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {session.ip_address} · Last active {new Date(session.last_used_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive text-xs"
                                onClick={() => handleRevokeSession(session.id)}
                            >
                                Revoke
                            </Button>
                        </div>
                    ))}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Log out all sessions</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Ends your current session and invalidates all tokens.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="ml-4 shrink-0">
                                    <LogOut size={13} className="mr-1.5" />
                                    Log out
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Log out of all sessions?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will end your current session and blacklist your
                                        refresh token. You will need to log in again.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleLogoutAllSessions}
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? "Logging out…" : "Log out"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            {/* ── change master password modal ── */}
            <ChangeMasterPasswordModal
                open={showChangePw}
                onClose={() => setShowChangePw(false)}
            />
        </div>
    );
}

// ── change master password modal ──────────────────────────────────────────

function ChangeMasterPasswordModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { client } = useWorkerService();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm<ChangeMasterPasswordData>({
        resolver: zodResolver(ChangeMasterPasswordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    async function onSubmit(data: ChangeMasterPasswordData) {
        setIsLoading(true);
        try {
            // await client.AuthService.changeMasterPassword(
            //     data.currentPassword,
            //     data.newPassword,
            // );
            console.log("change master password flow - not working yet.", data)
            form.reset();
            onClose();
            // force re-login — new key derived, old session invalid
            await client.AuthService.logout();
            navigate("/login", { replace: true });
        } catch (error: any) {
            form.setError("currentPassword", {
                message: error.message ?? "Current password is incorrect.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Change Master Password</DialogTitle>
                    <DialogDescription>
                        All vault items will be re-encrypted with the new key.
                        You will be logged out after the change.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2">
                    <FieldGroup className="gap-4">

                        <Controller
                            name="currentPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel>Current password</FieldLabel>
                                    <PasswordInput
                                        field={field}
                                        show={showCurrent}
                                        onToggle={() => setShowCurrent(v => !v)}
                                        placeholder="Enter current master password"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="newPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel>New password</FieldLabel>
                                    <PasswordInput
                                        field={field}
                                        show={showNew}
                                        onToggle={() => setShowNew(v => !v)}
                                        placeholder="Enter new master password"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1">
                                    <FieldLabel>Confirm new password</FieldLabel>
                                    <PasswordInput
                                        field={field}
                                        show={showConfirm}
                                        onToggle={() => setShowConfirm(v => !v)}
                                        placeholder="Re-enter new master password"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <div className="flex items-center justify-between pt-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-accent-brand">
                                {isLoading && <Spinner data-icon="inline-start" />}
                                {isLoading ? "Re-encrypting…" : "Change Password"}
                            </Button>
                        </div>

                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── reusable sub-components ───────────────────────────────────────────────

function InfoRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center">{children}</div>
        </div>
    );
}

function PasswordInput({
    field,
    show,
    onToggle,
    placeholder,
}: {
    field: any;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
}) {
    return (
        <div className="flex items-center min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm relative">
            <input
                {...field}
                type={show ? "text" : "password"}
                placeholder={placeholder}
                autoComplete="off"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            />
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );
}