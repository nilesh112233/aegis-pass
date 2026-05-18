import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "../ui/field"
import { Input } from "../ui/input"
import { Copy, X } from "lucide-react"
import { toastQueue } from "@/utils/toast-queue"


type Props = {
    name: string,
    control: Control<any>,
    label: string,
    placeholder: string,
    mode: string
}

export const InputField = ({
    name,
    label,
    control,
    placeholder,
    mode
}: Props) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1 mt-1">
                    <FieldLabel>{label}</FieldLabel>
                    {mode === "view" ? 
                        <div className="flex items-center justify-between min-h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm">
                            {field.value || <span className="text-muted-foreground">{placeholder}</span>}
                            {field.name === "username" && 
                                <div className=" flex items-center -mr-1 p-0 text-muted-foreground">
                                    <button
                                        type="button"
                                        autoFocus={false}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            navigator.clipboard.writeText(field.value ?? "")
                                            toastQueue.push("Copied to clipboard.", "success")
                                        }}
                                        className="hover:text-foreground mx-1"
                                    >
                                        <Copy size={15} />
                                    </button>
                                </div>
                            }
                        </div>
                    :
                        <div className="relative">
                            <Input 
                                {...field}
                                aria-invalid={fieldState.invalid}
                                placeholder={placeholder}
                                autoComplete="off"
                                className="pr-6 focus-visible:ring-accent-brand/50 focus-visible:border-0"
                            />
                            {field.value && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => field.onChange("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ml-1"
                                >
                                    <X size={16} />
                                </button>
                            )}

                            {/* <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">

                                {mode === "view" && (
                                    
                                )}
                            </div> */}
                        </div>
                    }
                    
                    {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                </Field>
            )}
        />
    )
}