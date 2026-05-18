import type { Control } from "react-hook-form"
import type { FieldType } from "./types.items";
import { InputField } from "./input-field";
import { PasswordField } from "./password-field";
import { TextareaField } from "./textarea-field";
import { SelectField } from "./select-field";
import { ToggleFavouriteField } from "./toggle-favourite-field";


type RenderFieldProps = {
    name: string,
    control: Control<any>,
    label: string,
    placeholder: string,
    fieldType: FieldType,
    mode: string
}

export const RenderField = ({
    name,
    control,
    label,
    placeholder,
    fieldType,
    mode
}: RenderFieldProps) => {
    switch (fieldType) {
        case "input": {
            return (
                <InputField
                    name={name}
                    control={control}
                    label={label}
                    placeholder={placeholder}
                    mode={mode}
                />
            );
        }

        case "password": {
            return (
                <PasswordField
                    name={name}
                    control={control}
                    label={label}
                    placeholder={placeholder}
                    mode={mode}
                />
            );
        }

        case "select": {
            return (
                <SelectField
                    name={name}
                    control={control}
                    label={label}
                    placeholder={placeholder}
                    mode={mode}
                />
            );
        }

        case "textarea": {
            return (
                <TextareaField
                    name={name}
                    control={control}
                    label={label}
                    placeholder={placeholder}
                    mode={mode}
                />
            );
        }

        case "toggleFavourite": {
            return (
                <ToggleFavouriteField
                    name={name}
                    control={control}
                    label={label}
                    placeholder={placeholder}
                    mode={mode}
                />
            )
        }
    }
}