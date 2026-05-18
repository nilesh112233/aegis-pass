import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "../ui/field"
import { Folder } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectLabel, SelectItem, SelectGroup } from "../ui/select"
import { useWorkerService } from "@/context/worker-provider"
import { useEffect, useState } from "react"
import type { DecryptedFolder } from "@/worker/utils/types.vault"



type Props = {
    name: string,
    control: Control<any>,
    label: string,
    placeholder: string,
    mode: string
}

export const SelectField = ({
    name,
    label,
    control,
    placeholder,
    mode
}: Props) => {
    const { client } = useWorkerService();
    const [folderList, setFolderList] = useState<DecryptedFolder[] | null>(null);
    

    useEffect(() => {
        async function getFoldersList() {
            try {
                const data = await client.CryptoService.getFolders();
                setFolderList(data)
            } catch (error) {
                console.log(error)
            }
        }

        getFoldersList();
    }, [client])

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const selectedFolder = folderList?.find(
                    (folder) => folder.id === field.value
                )
                return (
                    <Field data-invalid={fieldState.invalid} className="gap-1 mt-1">
                        <FieldLabel>{label}</FieldLabel>
                        {mode === "view" ? 
                            <div className="flex items-center justify-between min-h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-sm">
                                <div className="flex gap-2">
                                    <Folder size={19} /> 
                                    <div>
                                        {selectedFolder?.name || (
                                            <span className="text-muted-foreground">
                                                No folder
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        :
                            <div className="relative">
                                <Select value={field.value ?? "_nofolder"} onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full" {...field} aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder={placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Folders</SelectLabel>
                                            <SelectItem value="_nofolder">No folder</SelectItem>
                                            {folderList?.map((folder) => {
                                                return (
                                                    <SelectItem 
                                                        key={folder.id}
                                                        value={folder.id}
                                                    >
                                                        {folder.name}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                
                            </div>
                        }
                        
                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                    </Field>
                )}
            }
        />
    )
}