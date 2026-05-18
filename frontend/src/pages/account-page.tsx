import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
import { Mail, CalendarDays, KeyRound, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useWorkerService } from "@/context/worker-provider";
// import { useNavigate } from "react-router-dom";
import { DeleteAccountModal } from "@/components/auth/delete-account-modal";

type AccountInfo = {
    email: string;
    created_at: string;
    kdf_iterations: number;
};

export default function AccountPage() {
    const { client } = useWorkerService();
    // const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [account, setAccount] = useState<AccountInfo | null>(null);
    // const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        client.AuthService.user()
            .then(setAccount)
            .catch(console.error);
        
    }, [client]);

    // async function handleDeleteAccount() {
    //     setIsDeleting(true);
    //     try {
    //         // await client.AuthService.deleteAccount();
    //         console.log("deleteaccount flow")
    //         navigate("/login", { replace: true });
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         setIsDeleting(false);
    //     }
    // }

    const joinedDate = account?.created_at
        ? new Date(account.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="  space-y-6">

                {/* ── profile ── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Profile</CardTitle>
                        <CardDescription>Your account identity on Aegis-Pass.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <Row icon={<Mail size={15} />} label="Email">
                            <span className="font-mono text-sm">{account?.email ?? "—"}</span>
                            {/* <Badge variant="secondary" className="ml-2 text-xs">Read-only</Badge> */}
                        </Row>

                        <Separator />

                        <Row icon={<CalendarDays size={15} />} label="Member since">
                            <span className="text-sm">{joinedDate}</span>
                        </Row>

                        <Separator />

                        <Row icon={<KeyRound size={15} />} label="Key derivation">
                            <span className="text-sm font-mono">
                                PBKDF2 · {account?.kdf_iterations?.toLocaleString() ?? "—"} iterations
                            </span>
                            <Badge variant="secondary" className="ml-2 text-xs">SHA-256</Badge>
                        </Row>

                    </CardContent>
                </Card>

                {/* ── danger zone ── */}
                <Card className="border-destructive/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Permanent actions that cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Delete account</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Permanently deletes your account and all vault data.
                                </p>
                            </div>

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 size={14} className="mr-1.5" />
                                Delete
                            </Button>

                            <DeleteAccountModal
                                open={showDeleteModal}
                                onClose={() => setShowDeleteModal(false)}
                            />
                            {/* <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="ml-4 shrink-0"
                                    >
                                        <Trash2 size={14} className="mr-1.5" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete your account and every vault
                                            item stored in it. Your encrypted data cannot be recovered.
                                            This action is irreversible.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting…" : "Yes, delete everything"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog> */}


                            
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

// ── small layout helper ───────────────────────────────────────────────────
function Row({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground min-w-[140px]">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="flex items-center ml-auto">{children}</div>
        </div>
    );
}