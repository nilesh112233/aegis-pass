import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "../ui/field"
import { Star } from "lucide-react"
import { Toggle } from "../ui/toggle"


type Props = {
    name: string,
    control: Control<any>,
    label: string,
    placeholder: string,
    mode: string
}

export const ToggleFavouriteField = ({
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
                <Field data-invalid={fieldState.invalid} className="gap-1 mt-1 absolute top-12 right-10 w-auto">
                    {mode === "view" ? 
                        <Toggle
                            pressed={field.value}
                            onPressedChange={field.onChange}
                            // variant="ghost"
                            size="sm"
                            disabled
                            >
                            <Star
                                size={16}
                                className={
                                field.value
                                    ? "text-accent-brand"
                                    : "text-fg-muted"
                                }
                            />
                        </Toggle>
                    :
                        <div className="relative">
                            <Toggle
                                pressed={field.value}
                                onPressedChange={field.onChange}
                                size="sm"
                                >
                                <Star
                                    size={16}
                                    className={
                                    field.value
                                        ? "text-accent-brand-muted"
                                        : "text-fg-muted"
                                    }
                                />
                            </Toggle>
                            
                        </div>
                    }
                    
                    {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                </Field>
            )}
        />
    )
}