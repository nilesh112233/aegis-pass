import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "../ui/field"
import { Textarea } from "../ui/textarea"
import { X } from "lucide-react"


type Props = {
    name: string,
    control: Control<any>,
    label: string,
    placeholder: string,
    mode: string
}

export const TextareaField = ({
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
                <Field data-invalid={fieldState.invalid} className="gap-1 mt-1 no-scrollbar ">
                    <FieldLabel htmlFor="password-form-notes">{label}</FieldLabel>
                    {mode === "view" ? (
                        <textarea 
                            name={name}
                            readOnly
                            placeholder={placeholder}
                            rows={4}
                            value={field.value}
                            className="flex items-center min-h-16 no-scrollbar w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm outline-none"
                        >
                            {/* {field.value} */}
                        </textarea>
                    ) : (
                        <div className="relative">
                            <Textarea
                                {...field}
                                aria-invalid={fieldState.invalid}
                                placeholder={placeholder}
                                rows={7}
                                autoComplete="off"
                                className="min-h-[90px] pr-5  focus-visible:ring-accent-brand/50 focus-visible:border-0"
                            />
                            {field.value && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => field.onChange("")}
                                    className="absolute right-2 top-5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {!(mode==="view") && <X size={16} />}
                                </button>
                            )}
                        </div>
                    )}
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    )
}