import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "../ui/field"
import { Input } from "../ui/input"
import { X, Eye, EyeOff, Copy } from "lucide-react"
import { useState } from "react"
import { getCharColor } from "@/utils/password-colors"
import { toastQueue } from "@/utils/toast-queue"


export function ColoredPassword({ value }: { value: string }) {
    return (
        <div className="font-mono tracking-wider">
            {value.split("").map((char, i) => (
                <span key={i} className={getCharColor(char)}>
                    {char}
                </span>
            ))}
        </div>
    );
}


type Props = {
    name: string;
    control: Control<any>;
    label: string;
    placeholder?: string;
    mode: string;
}

export const PasswordField = ({ name, control, label, mode }: Props) => {
    const [show, setShow] = useState(mode === "create");

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel>{label}</FieldLabel>
                    <div className="relative">

                        {mode === "view" ? (
                            <>
                                <div className="flex items-center min-h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 pr-20 text-sm outline-none">
                                    {show ? (
                                        <ColoredPassword value={field.value ?? ""} />
                                    ) : field.value ? (
                                        <span>{"•".repeat(field.value.length)}</span>
                                    ) : (
                                        <span className="text-muted-foreground">Password</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Input
                                {...field}
                                className="pr-20 focus-visible:ring-accent-brand/50 focus-visible:border-0"
                                type={show ? "text" : "password"}
                                aria-invalid={fieldState.invalid}
                                placeholder="Enter password"
                                autoComplete="off"
                            />
                        )}

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShow((v) => !v)}
                                className="hover:text-foreground mx-1"
                            >
                                {show ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>

                            {mode === "view" && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        navigator.clipboard.writeText(field.value ?? "")
                                        toastQueue.push("Copied to clipboard.", "success")
                                    }}
                                    className="hover:text-foreground mx-1"
                                >
                                    <Copy size={15} />
                                </button>
                            )}

                            {mode !== "view" && field.value && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => field.onChange("")}
                                    className="hover:text-foreground ml-1"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
};



























// type Props = {
//     name: string,
//     control: Control<any>,
//     label: string,
//     placeholder: string,
//     mode: string
// }


// export const PasswordField = ({
//     name,
//     control,
//     label,
//     mode
// }: Props) => {

//     const [show, setShow] = useState(false);
//     useEffect(() => {
//         if (mode === "create") setShow(true);
//     }, [show])

//     return (
//         <Controller 
//             name={name}
//             control={control}
//             render={({ field, fieldState }) => (
//                 <Field data-invalid={fieldState.invalid} className="gap-1">
//                     <FieldLabel>{label}</FieldLabel>
//                     <div className="relative">
//                         <Input
//                             {...field}
//                             className="pr-14"
//                             type={show ? "text" : "password"}
//                             aria-invalid={fieldState.invalid}
//                             placeholder="••••••••"
//                             autoComplete="off"
//                         />
//                         <div className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground mt-0.5 flex items-center">
//                             <button 
//                                 type="button"
//                                 onMouseDown={(e) => e.preventDefault()}
//                                 onClick={() => setShow(!show)}
//                                 className="text-muted-foreground hover:text-foreground mx-1"
//                             >
//                                 {show ? <EyeOff size={16} /> : <Eye size={16} />}
//                             </button>
//                             {(mode === "view") && <Copy className="ml-2" size={16} onClick={async () => await navigator.clipboard.writeText(field.value)}/>}
//                             {field.value && (
//                                 <button
//                                     type="button"
//                                     onMouseDown={(e) => e.preventDefault()}
//                                     onClick={() => field.onChange("")}
//                                     className="text-muted-foreground hover:text-foreground ml-1"
//                                 >
//                                     {!(mode==="view") && <X size={16} />}
//                                 </button>
//                             )}

                            


//                         </div>
//                     </div>
//                     {fieldState.invalid && ( <FieldError errors={[fieldState.error]} /> )}
//                 </Field>
//             )}
//         />
//     )
// }