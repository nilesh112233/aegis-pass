import * as z from "zod"
import type { FieldType } from "./types.items"
import type { DecryptedVaultItemDetail, NewVaultItemPayload } from "@/worker/utils/types.vault"



const loginFormSchema = z
    .object({
        name: z
            .string()
            .min(1, "Name is required.")
            .max(128, "Item name length can not be more than 128 characters."),
        folder: z
            .string()
            .nullable()
            .optional(),
        username: z
            .string()
            .max(128, "Username length can not be more than 128 characters.")
            .or(z.literal(""))
            .optional(),
        password: z
            .string()
            .max(128, "Password length can not be more than 128 characters.")
            .or(z.literal(""))
            .optional(),
        url: z
            .string()
            .max(2048, "Url length can not be more than 2048 characters.")
            .or(z.literal(""))
            .optional(), 
        notes: z
            .string()
            .max(2048, "Notes length can not be more than 2048 characters.")
            .or(z.literal(""))
            .optional(),
        isFavourite: z
            .boolean()
            .optional(),
    })



const secureNoteFormSchema = z
    .object({
        name: z
            .string()
            .min(1, "Name is required.")
            .max(128, "Item name length can not be more than 128 characters."),
        folder: z
            .string()
            .nullable()
            .optional(),
        notes: z
            .string()
            .max(2048, "Notes length can not be more than 2048 characters.")
            .or(z.literal(""))
            .optional(),
        isFavourite: z
            .boolean()
            .optional(),
    })


export const ITEM_TYPE_FORM_SCHEMA = {
    login: {
        label: "Login",
        fields: [
            { name: "name", label: "Name", fieldType: "input" as FieldType, placeholder: "Enter name for login (required)" },
            { name: "folder", label: "Folder", fieldType: "select" as FieldType, placeholder: "Select folder"},
            { name: "username", label: "Username", fieldType: "input" as FieldType, placeholder: "Email or Username" },
            { name: "password", label: "Password", fieldType: "password" as FieldType, placeholder: "Password" },
            { name: "url", label: "URl", fieldType: "input" as FieldType, placeholder: "https://example.com" },
            { name: "notes", label: "Additional Notes", fieldType: "textarea" as FieldType, placeholder: "Add any additional information (security questions, recovery codes, etc.)" },
            { name: "isFavourite", label: "isFavourite", fieldType: "toggleFavourite" as FieldType, placeholder: "isFavourite" },
            // { name: "", label: "", fieldType: "" as FieldType, placeholder: "" },
            
        ],
        validator_schema: loginFormSchema,
        default_values: {
            name: "",
            folder: "_nofolder",
            username: "",
            isFavourite: false,
            password: "",
            url: "",
            notes: "",
        },
        build_payload: (data: z.infer<typeof loginFormSchema>): NewVaultItemPayload => ({
            item_type: "login",
            item_meta_preview: {
                name: data.name,
                username: data.username ?? "",
                folder: data.folder ?? "",
                isFavourite: data.isFavourite ?? false,
                url: data.url ?? "",
            },
            item_data: {
                username: data.username ?? "",
                password: data.password ?? "",
                url: data.url ?? "",
                notes: data.notes ?? "",
            }
        }),
        load_decrypted_data: (data: DecryptedVaultItemDetail): z.infer<typeof loginFormSchema> => {
            if (data.item_type !== "login") throw new Error("Wrong item type.");
            return {
                name:     data.item_meta_preview.name,
                username: data.item_data.username,
                password: data.item_data.password,
                url:      data.item_data.url,
                notes:    data.item_data.notes ?? "",
                isFavourite: data.is_favourite,
                folder:   data.folder,
            };
            // name: data.item_meta_preview.name,
            // username: data.item_data.username,
            // url: data.item_data.url,
            // password: data.item_data.password,
            // notes: data.item_data.notes
        }
    },

    secure_note: {
        label: "Secure Note",
        fields: [
            { name: "name", label: "Name", fieldType: "input" as FieldType, placeholder: "Enter name for secure note (required)" },
            { name: "folder", label: "Folder", fieldType: "select" as FieldType, placeholder: "Select a folder"},
            { name: "notes", label: "Notes", fieldType: "textarea" as FieldType, placeholder: "Add your secret notes here" },
            { name: "isFavourite", label: "isFavourite", fieldType: "toggleFavourite" as FieldType, placeholder: "isFavourite" },
        ],
        validator_schema: secureNoteFormSchema,
        default_values: {
            name: "",
            folder: "_nofolder",
            notes: "",
            isFavourite: false,
        },
        build_payload: (data: z.infer<typeof secureNoteFormSchema>): NewVaultItemPayload => ({
            item_type: "secure_note",
            item_meta_preview: {
                name: data.name,
                folder: data.folder ?? "",
                isFavourite: data.isFavourite ?? false,
            },
            item_data: {
                notes: data.notes ?? "",
            }
        }),
        load_decrypted_data: (data: DecryptedVaultItemDetail): z.infer<typeof secureNoteFormSchema> => {
            if (data.item_type !== "secure_note") throw new Error("Wrong item type.");
            return {
                name:  data.item_meta_preview.name,
                notes: data.item_data.notes ?? "",
                isFavourite: data.is_favourite,
                folder: data.folder,
            }
        },
    }
}


