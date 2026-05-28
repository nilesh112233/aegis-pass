import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
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


const SignupFormSchema = z
    .object({
        email: z.email("Enter a valid email address."),
        masterPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long.")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_=+;:,.<>/?~|]).{8,}$/,
                "Password must include uppercase(A-Z), lowercase(a-z), number(0-9), and symbol(!@#$%^&*()-_=+[]{};:,.<>?~|)"
            ),
        confirmMasterPassword: z.string(),
    })
    .refine((data) => data.masterPassword === data.confirmMasterPassword, {
        message: "Passwords do not match",
        path: ["confirmMasterPassword"],
    })


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const [showConfirmMasterPassword, setShowConfirmMasterPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const naviagte = useNavigate();
    const { client } = useWorkerService();

    const form = useForm<z.infer<typeof SignupFormSchema>>({
        resolver: zodResolver(SignupFormSchema),
        defaultValues: {
            email: "",
            masterPassword: "",
            confirmMasterPassword: "",
        },
    });

    async function onSubmit(data: z.infer<typeof SignupFormSchema>) {
        setIsLoading(true)
        try {
            await client.AuthService.register(data.email, data.masterPassword);
            // toast.success("Account created successfully.");
            toastQueue.push("Account created successfully.", "success")
            localStorage.clear();
            naviagte("/login");
        } catch (error: any) {
            const message = error.message ?? "Registration failed. Please try again."
            toast.error(error.message ?? "Registration failed. Please try again.");
            form.setError("email", {message}, {shouldFocus: true})
            form.setError("masterPassword", {message}, {shouldFocus: true})

        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
        <div className="flex items-center gap-3 absolute top-5 left-5">
            <AegisPassShield />

            <span className="text-2xl font-semibold tracking-tight">
                Aegis-Pass
            </span>
        </div>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}  className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome to Aegis-Pass</h1>
                <p className="text-sm text-balance text-muted-foreground">
                    Create your account
                </p>
              </div>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-form-email">Email</FieldLabel>
                        <div className="relative">
                            <Input 
                                {...field}
                                id="signup-form-email"
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
                        <FieldLabel htmlFor="signup-form-masterPassword">Master Password</FieldLabel>
                        <div className="relative">
                            <Input
                                {...field}
                                id="signup-form-masterPassword"
                                type="password"
                                aria-invalid={fieldState.invalid}
                                placeholder="••••••••"
                                autoComplete="off"
                            />
                            {field.value && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => form.setValue("masterPassword", "")}
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
                name="confirmMasterPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-form-confirmMasterPassword">Confirm Master Password</FieldLabel>
                        <div className="relative">
                            <Input
                                {...field}
                                id="signup-form-confirmMasterPassword"
                                className="pr-10"
                                type={showConfirmMasterPassword ? "text" : "password"}
                                aria-invalid={fieldState.invalid}
                                placeholder="••••••••"
                                autoComplete="off"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground mt-0.5">
                                {field.value && (
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => form.setValue("confirmMasterPassword", "")}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                                <button 
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setShowConfirmMasterPassword(!showConfirmMasterPassword)}
                                    className="text-muted-foreground hover:text-foreground mx-1"
                                >
                                    {showConfirmMasterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                        </div>
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                        <FieldDescription>
                            Make sure you remember your Master Password.
                            It is not recoverable if forgotten.
                        </FieldDescription>
                    </Field>
                )}
              />
              <Field>
                <Button type="submit" form="signup-form">
                    {isLoading && <Spinner data-icon="inline-start" />}
                    Create Account
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link to="/login">Sign In</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <VaultIllustration />
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
