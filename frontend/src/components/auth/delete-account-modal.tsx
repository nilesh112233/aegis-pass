import { useNavigate } from "react-router-dom"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
 } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useWorkerService } from "@/context/worker-provider";
import { toastQueue } from "@/utils/toast-queue";




export function DeleteAccountModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { client } = useWorkerService();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function handleClose() {
        setPassword("");
        setError(null);
        onClose();
    }

    async function handleConfirm() {
        if (!password) {
            setError("Please enter your master password.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await client.AuthService.deleteAccount(password);
            toastQueue.push("Account permanently deleted.", "success");
            navigate("/login", { replace: true });
        } catch (err: any) {
            setError(err.message ?? "Incorrect password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-destructive">
                        Delete Account
                    </DialogTitle>
                    <DialogDescription className="flex flex-col gap-5">
                        <span>This will permanently delete your account and every vault
                        item stored in it. Your encrypted data cannot be recovered.
                        This action is irreversible.</span>
                        
                        <span>Enter your master password to confirm.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Master Password</label>
                        <div className="flex items-center min-h-9 w-full rounded-md border border-destructive/40 bg-transparent px-3 py-2 pr-10 text-sm relative focus-within:ring-2 focus-within:ring-destructive/40">
                            <input
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Enter your master password"
                                autoComplete="off"
                                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                            />
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShow(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {show ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-destructive">{error}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isLoading || !password}
                        >
                            {isLoading && <Spinner data-icon="inline-start" />}
                            {isLoading ? "Deleting…" : "Delete my account"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}