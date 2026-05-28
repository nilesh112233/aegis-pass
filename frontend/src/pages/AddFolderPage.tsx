import * as z from "zod"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
 } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RenderField } from "@/components/form-fields/render-field";
import { toastQueue } from "@/utils/toast-queue";
import { useState, useEffect } from "react";
import { useWorkerService } from "@/context/worker-provider";


export default function AddFolderPage() {

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { client } = useWorkerService();
    const { id } = useParams();
    // const [folder, setFolder] = useState<any>(null);

    

    const folderFormSchema = z.object({
        name: z
            .string()
            .min(1, "Name is required.")
            .max(128, "Folder name length can not be more than 128 characters."),
    })

    type folderFormValidatedData = z.infer<typeof folderFormSchema>
    const form = useForm<folderFormValidatedData>({
        resolver: zodResolver(folderFormSchema),
        defaultValues: { name: "" }
    })

    const { isDirty } = form.formState;

    const mode = location.pathname.includes("/edit")
        ? "edit"
        : location.pathname.includes("/new")
        ? "create"
        : "view"

    useEffect(() => {
        // if (mode === "create" || !id) return;
        if (mode === "create" || !id) return;
        
        setIsLoading(true)
        async function fetchItemDetail(id: any) {
            setIsLoading(true);
            try {
                const folders = await client.CryptoService.getFolders();
                const folder = folders.filter(f => f.id === id)[0]
                // setFolder(folder)
                form.reset({...folder} as folderFormValidatedData)

            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchItemDetail(id)
    }, [id, mode])


    async function onSubmit(data: folderFormValidatedData) {
        setIsLoading(true);

        try {
            // const serializedData = data.name;

            if (mode === "create") {
                await client.CryptoService.createFolder(data);
                toastQueue.push(`Folder created successfully.`, "success")
                closeModal();
            } else if (mode === "edit" && id) {
                await client.CryptoService.updateFolder(id, data);
                toastQueue.push("Folder name updated successfully.", "success")
                closeModal();
            }
            // navigate(-1);
        } catch (error: any) {
            
        } finally {
            setIsLoading(false);
        }
    }


    function closeModal() {
        const background = location.state?.backgroundLocation?.pathname ?? "/vault";
        // navigate to background page with clean state — no backgroundLocation
        // this creates a new history entry → new location.key → triggers refetch
        navigate(background, { replace: true });
    }

    return (
        <Dialog
            open
            // onOpenChange={() => {navigate(-1)}}
            // onOpenChange={closeModal}  
            onOpenChange={(open) => {
                if (!open) {
                    if (mode === "edit") {
                    navigate(-1);
                    } else {
                    closeModal();
                    }
                }
            }}
        >
            <DialogContent 
                className="w-full top-1/2 right-0 bg-background sm:max-w-[500px]
                data-[state=open]:animate-in
                data-[state=closed]:animate-out
                data-[state=open]:fade-in-0
                data-[state=closed]:fade-out-0
                data-[state=open]:slide-in-from-top-6
                data-[state=closed]:slide-out-to-top-6
                duration-30 ease-out"
            >

                <DialogHeader className="mx-3 gap-0">
                    <DialogTitle className="text-2xl font-bold">{mode === "create" ? "Add new Folder" : "Edit folder"}</DialogTitle>
                </DialogHeader>
                <Card className="overflow-hidden m-1 p-1 bg-background border-0 shadow-none">
                    <CardContent className="p-0">

                        <form 
                            onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("validation error: ", errors))} 
                            className="no-scrollbar max-h-[80vh] overflow-y-auto"
                        >
                            <FieldGroup className="gap-3 p-1">
                                <RenderField
                                    key="name"
                                    fieldType="input"
                                    name="name"
                                    label="Name"
                                    placeholder="Enter name for folder"
                                    control={form.control}
                                    mode={mode}
                                    
                                />
                                <Field className="mt-2">
                                    {(mode === "view") ?
                                        <div className="flex items-center justify-between gap-2">
                                            <Button 
                                                type="button"
                                                className="text-white bg-accent-brand-muted hover:bg-accent-brand"
                                                onClick={() => navigate(`/vault/item/${id}/edit`, { state: { ...location.state }})}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                        : 
                                        <div className="flex items-center justify-between">
                                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                                {(mode === "edit") ? "Clear Changes" : "Clear"}
                                            </Button>

                                            <Button 
                                                type="submit" 
                                                disabled={mode === "edit" && !isDirty}
                                                className="text-white bg-accent-brand-muted hover:bg-accent-brand"
                                            >
                                                {isLoading && <Spinner data-icon="inline-start" />}
                                                {(mode === "edit") ? "Save Changes" : "Save Entry"}
                                            </Button>
                                        </div>
                                    }
                                </Field>

                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>


            </DialogContent>
        </Dialog>
        
    )
}