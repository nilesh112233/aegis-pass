
export type VaultItemType =
  | "login"
  | "secure_note"
  | "card"
  | "identity";

export type ItemMetaPreview = {
  name: string;
  username?: string;
  folder?: string;
  isFavourite: boolean; 
  url?: string;
};

export type PatchItem = {
    folder?: string;
    isFavourite?: boolean;
    is_favourite?: boolean;
}

export type LoginTypeItemData = {
  username: string;
  password: string;
  url: string;
  notes?: string;
};

export type SecureNoteTypeItemData = {
  notes: string;
};

export type ItemData = 
    | LoginTypeItemData
    | SecureNoteTypeItemData

export type LoginVaultItemPayload = {
  item_type: "login";
  item_meta_preview: ItemMetaPreview;
  item_data: LoginTypeItemData;
};

export type SecureNoteVaultItemPayload = {
  item_type: "secure_note";
  item_meta_preview: ItemMetaPreview;
  item_data: SecureNoteTypeItemData;
};

export type NewVaultItemPayload =
  | LoginVaultItemPayload
  | SecureNoteVaultItemPayload;

  
export type DecryptedVaultItemMeta = {
    id: string;
    item_type: "login" | "secure_note" | "card" | "identity";
    item_meta_preview: ItemMetaPreview;
    folder: string;
    is_favourite: boolean;
    is_deleted: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

export type LoginVaultItemDetail = DecryptedVaultItemMeta & {
    item_type: "login",
    item_data: LoginTypeItemData
}

export type SecureNoteVaultItemDetail = DecryptedVaultItemMeta & {
    item_type: "secure_note",
    item_data: SecureNoteTypeItemData
}

export type DecryptedVaultItemDetail = 
    | LoginVaultItemDetail
    | SecureNoteVaultItemDetail

export type DecryptedFolder = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    no_of_items: number;
}