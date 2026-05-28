import { useParams, useNavigate, useLocation } from "react-router-dom"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
 } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RenderField } from "@/components/form-fields/render-field";
import { ITEM_TYPE_FORM_SCHEMA } from "@/components/form-fields/item-type-form-schema";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useWorkerService } from "@/context/worker-provider";
import { toastQueue } from "@/utils/toast-queue";
import { HistoryContent } from "@/components/history-content";
import type { PatchItem } from "@/worker/utils/types.vault";


export const ItemFormBasePage = () => {

    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { client } = useWorkerService();
    const { id, type } = useParams();
    const [item, setItem] = useState<any>(null);
    // const [isFavourite, setIsFavourite] = useState<boolean>(false);
    

    const mode = location.pathname.includes("/edit")
    ? "edit"
    : location.pathname.includes("/new")
    ? "create"
    : location.pathname.includes("/history")
    ? "history"
    : "view"
    let title, description;
    
    const itemType = mode === "create" ? type : location.state?.type

    const config = ITEM_TYPE_FORM_SCHEMA[itemType as keyof typeof ITEM_TYPE_FORM_SCHEMA];

    if (mode === "create") {
        title = `Add New ${config.label}`;
        description = "Fill in the details to store credentials securely.";
    } else if (mode === "edit") {
        title = `Edit your ${config.label}`;
        description = "Edit fields that you want to update.";
    } else if (mode === "history") {
        title = "Version History";
        description = "Changes made to this item over time.";
    } else {
        title = config.label;
        description = "Click edit to make changes.";
    }

    type ItemFormValidatedData = z.infer<(typeof config)["validator_schema"]>

    const form = useForm<ItemFormValidatedData>({
        resolver: zodResolver(config.validator_schema),
        defaultValues: config.default_values as ItemFormValidatedData
    })
    const { isDirty } = form.formState;


    useEffect(() => {
        // if (mode === "create" || !id) return;
        if (mode === "create" || mode === "history" || !id) return;
        
        setIsLoading(true)
        async function fetchItemDetail(id: any) {
            try {
                setIsLoading(true);
                const item = await client.CryptoService.getItem(id);
                setItem(item)
                // setIsFavourite(item.is_favourite)

                const data = config.load_decrypted_data(item)
                form.reset({ ...data } as ItemFormValidatedData)

            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchItemDetail(id)
    }, [id, mode])

    async function onSubmit(data: ItemFormValidatedData) {
        setIsLoading(true);

        try {
            const serializedData = config.build_payload(data);
            
            if (mode === "create") {
                await client.CryptoService.createItem(serializedData);
                toastQueue.push(`${config.label} created successfully.`, "success")
                closeModal();
            } else if (mode === "edit" && id) {
                const normalizeItem = {
                    ...item.item_meta_preview,
                    ...item.item_data,
                    folder: item.folder,
                    isFavourite: item.is_favourite,
                }

                const updatedFields = Object.keys(data).reduce(
                    (acc, key) => {
                        const typedKey = key as keyof typeof data;

                        if (data[typedKey] !== normalizeItem[typedKey]) {
                        (acc as any)[typedKey] = data[typedKey];
                        }

                        return acc;
                    },
                    {} as Partial<typeof data>
                );

                const updatedKeys = Object.keys(updatedFields)
                const patchRouteKeys = ["isFavourite", "folder"]

                const diff = updatedKeys.filter(item => !patchRouteKeys.includes(item))
                
                if (diff.length !== 0) {
                    await client.CryptoService.updateItem(id, serializedData);
                } else {
                    await client.CryptoService.patchItem(id, updatedFields as PatchItem);
                }
                toastQueue.push(`${config.label} updated successfully.`, "success")
                navigate(`/vault/item/${id}`, {
                    state: {
                        type: itemType,
                        backgroundLocation: location.state?.backgroundLocation,
                    }
                });

            }
            // // navigate(-1);
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
                    if (mode === "history" || mode === "edit") {
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
                    <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                    <div className="flex justify-between">
                        <DialogDescription>{description}</DialogDescription>
                        {/* {isFavourite ? 
                            <Star size={16} className="text-accent-brand-muted mx-3"/> : <Star size={16} className="mx-3 text-fg-muted hover:text-accent-brand-muted"/>
                        } */}
                    </div>
                </DialogHeader>
                <Card className="overflow-hidden m-1 p-1 bg-background border-0 shadow-none">
                    <CardContent className="p-0">

                        {mode === "history" ? (
                            // ── history mode — show diff list ──
                            <HistoryContent id={id!} />
                        ) : (
                            <form 
                                onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("validation error: ", errors))} 
                                className="no-scrollbar max-h-[80vh] overflow-y-auto"
                            >
                                <FieldGroup className="gap-3 p-1">
                                    {config.fields.map((field) => (
                                        <RenderField
                                            key={field.name}
                                            fieldType={field.fieldType}
                                            name={field.name}
                                            label={field.label}
                                            placeholder={field.placeholder}
                                            control={form.control}
                                            mode={mode}
                                            
                                        />
                                    ))}
                                    {(mode === "view" || mode === "edit") && item && (
                                        <>
                                            <div className="text-xs text-muted-foreground my-0">
                                                Created at {new Date(item.created_at).toLocaleString('en-GB')}
                                            </div>
                                            <div className="text-xs text-muted-foreground my-0">
                                                Updated at {new Date(item.updated_at).toLocaleString('en-GB')}
                                            </div>
                                        </>
                                    )}
                                    <Field className="mt-2">
                                        {(mode === "view") ?
                                            <div className="flex items-center justify-between gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => navigate(`/vault/item/${id}/history`, {
                                                        state: { type: itemType, ...location.state }
                                                    })}
                                                >
                                                    History
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    className="text-white bg-accent-brand-muted hover:bg-accent-brand"
                                                    onClick={() => navigate(`/vault/item/${id}/edit`, { state: { type, ...location.state }})}
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
                        )}
                    </CardContent>
                </Card>


            </DialogContent>
        </Dialog>
        
    )
}