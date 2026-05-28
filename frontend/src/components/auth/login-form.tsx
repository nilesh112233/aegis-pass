import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import { Eye, EyeOff, X } from "lucide-react"
import VaultIllustration from "../vault-illustration"
import { useState } from "react"
import { useWorkerService } from "@/context/worker-provider";
import { Spinner } from "../ui/spinner"
import { toastQueue } from "@/utils/toast-queue"
import AegisPassShield from "../ui/aegis-pass-shield"
import { motion } from "framer-motion";



const LoginFormSchema = z
    .object({
        email: z.email("Enter a valid email address."),
        masterPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long.")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+;:,.<>/?~|]).{8,}$/,
                "Password must include uppercase(A-Z), lowercase(a-z), number(0-9), and symbol(!@#$%^&*()-_=+[]{};:,.<>?~|)"
            ),
    })

type LoginFormData = z.infer<typeof LoginFormSchema>


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

    const [showMasterPassword, setShowMasterPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { client } = useWorkerService();
    
        const form = useForm<LoginFormData>({
            resolver: zodResolver(LoginFormSchema),
            defaultValues: {
                email: "",
                masterPassword: "",
            },
        });

        
    async function onSubmit(data: LoginFormData) {
        setIsLoading(true)
        try {
            const res = await client.AuthService.login(data.email, data.masterPassword);
            // toast.success("Welcome back.");
            toastQueue.push("Logged in successfully.", "success");
            navigate("/vault");
        } catch (error: any) {
            const message = error.message ?? "Login failed. Please try again.";
            toast.error(error.message ?? "Login failed. Please try again.");
            form.setError("email",{} , {shouldFocus: true})
            form.setError("masterPassword", {message}, {shouldFocus: true})
        } finally {
            setIsLoading(false);
        }
    };
    
  return (
    <div>
        <div className="flex items-center gap-3 absolute top-5 left-5">
            <AegisPassShield />

            <span className="text-2xl font-semibold tracking-tight">
                Aegis-Pass
            </span>
        </div>
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >

        <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
            <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                    Login to your Aegis-Pass account
                    </p>
                </div>
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="login-form-email">Email</FieldLabel>
                            <div className="relative">
                                <Input 
                                    {...field}
                                    id="login-form-email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="m@example.com"
                                    autoFocus={true}
                                    autoComplete="off"
                                />
                                {field.value && (
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => form.setValue("email", "")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller 
                    name="masterPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="login-form-masterPassword">Master Password</FieldLabel>
                            <div className="relative">
                                <Input
                                    {...field}
                                    id="login-form-masterPassword"
                                    className="pr-10"
                                    type={showMasterPassword ? "text" : "password"}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="••••••••"
                                    autoComplete="off"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground mt-0.5">
                                    {field.value && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => form.setValue("masterPassword", "")}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                    <button 
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setShowMasterPassword(!showMasterPassword)}
                                        className="text-muted-foreground hover:text-foreground mx-1"
                                    >
                                        {showMasterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Field>
                    <FieldDescription> </FieldDescription>
                    <Button type="submit" form="login-form" className="mt-24">
                        {isLoading && <Spinner data-icon="inline-start" />}
                        Login
                    </Button>
                </Field>
                <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
                </FieldDescription>
                </FieldGroup>
            </form>
            <div className="relative hidden md:block">
                <VaultIllustration />
            </div>
            </CardContent>
        </Card>
        {/* <Toaster position="bottom-right" /> */}
        </div>
        </motion.div>
    </div>
  )
}
