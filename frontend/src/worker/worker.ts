// Worker who handles everything and communicates with worker-client
import { fetchAuthApi, fetchVaultApi } from "./utils/api-helper";
import { deriveKeys, encrypt, decrypt } from "./utils/crypto-helper";
import { SecureStorage } from "./utils/secure-storage";
import { tokenManager } from "./utils/token-manager";
import type { DecryptedVaultItemDetail, DecryptedVaultItemMeta, LoginVaultItemDetail, NewVaultItemPayload, DecryptedFolder, PatchItem } from "./utils/types.vault";
import { analyseVault } from "./utils/vault-analyser";



// Allowed messages/requests by the worker
export type WorkerRequest = 
| { id: string; type: "PING" }
| { id: string; type: "AUTH_USER" }
| { id: string; type: "AUTH_STATUS_CHECK" }
| { id: string; type: "AUTH_REGISTER"; payload: {email: string, password: string} }
| { id: string; type: "AUTH_LOGIN"; payload: {email: string, password: string} }
| { id: string; type: "AUTH_LOGOUT" }
| { id: string; type: "AUTH_DELETE_ACCOUNT"; payload: {password: string} } 
| { id: string; type: "USER_ACTIVITY" }
| { id: string; type: "CONFIG_SESSION_TIMEOUT"; payload: {timeoutLimit?: number} }
| { id: string; type: "AUTH_GET_SESSIONS_LIST" }
| { id: string; type: "AUTH_REVOKE_SESSION"; payload: { id: string } }

//vault
| { id: string; type: "VAULT_GET_ITEMS" }
| { id: string; type: "VAULT_GET_ITEM"; payload: { id: string } }
| { id: string; type: "VAULT_CREATE_ITEM"; payload: NewVaultItemPayload }
| { id: string; type: "VAULT_UPDATE_ITEM"; payload: { id: string } & NewVaultItemPayload }
| { id: string; type: "VAULT_PATCH_ITEM"; payload: { id: string } & PatchItem }
| { id: string; type: "VAULT_SOFT_DELETE_ITEM"; payload: { id: string } }
| { id: string; type: "VAULT_RESTORE_ITEM"; payload: { id: string } }
| { id: string; type: "VAULT_TOGGLE_FAVOURITE"; payload: { id: string } }
| { id: string; type: "VAULT_GET_ITEM_HISTORY"; payload: { id: string } }
| { id: string; type: "VAULT_GET_TRASH" }
| { id: string; type: "VAULT_HARD_DELETE_ITEM"; payload: { id: string } }
| { id: string; type: "VAULT_RESTORE_ALL"; }
| { id: string; type: "VAULT_HARD_DELETE_ALL"; }
| { id: string; type: "VAULT_ANALYSIS"; }

| { id: string; type: "VAULT_GET_FOLDERS"; }
| { id: string; type: "VAULT_CREATE_FOLDER"; payload: { name: string } }
| { id: string; type: "VAULT_UPDATE_FOLDER"; payload: { name: string, id: string}}
| { id: string; type: "VAULT_GET_FOLDER_ITEMS"; payload: { id: string }}
| { id: string; type: "VAULT_MOVE_ITEMS_TO_FOLDER"; payload: { folder_id: string, item_ids: [string] } }
| { id: string; type: "VAULT_REMOVE_FROM_FOLDER"; payload: { folder_id: string, item_ids: [string] } }


// Worker responds with either success or error with an optional data or error attribute
export type WorkerResponse = 
| { id: string; type: "SUCCESS"; data?: any}
| { id: string; type: "ERROR"; error: any}

export type WorkerPushEvent = 
| { type: "FORCE_LOGOUT" }


self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const message = event.data;

    try{
        switch (message.type) {
            case "PING":
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: "pong",
                } satisfies WorkerResponse);
                break;

            
            case "AUTH_USER": {
                const user = SecureStorage.getUser();
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: user ,
                } satisfies WorkerResponse);
                break;
            }


            case "AUTH_STATUS_CHECK": {
                const token = SecureStorage.getAccessToken();
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: { isAuthenticated: token !== null },
                } satisfies WorkerResponse);
                break;
            }


            case "AUTH_REGISTER": {
            
                const { email, password } = message.payload;
                const preFlight = await fetchAuthApi("preflight/", { email });
                const iterations = preFlight.kdf_iterations;
                const { authToken } = await deriveKeys(email, password, iterations);
                await fetchAuthApi("register/", {
                    email,
                    auth_token: authToken,
                    kdf_iterations: iterations,
                });
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse);
                
                break
            }
                

            case "AUTH_LOGIN": {
                const { email, password } = message.payload;
                const preFlight = await fetchAuthApi("preflight/", { email });
                const iterations = preFlight.kdf_iterations;
                const { authToken, encryptionKey } = await deriveKeys(email, password, iterations);
                const data = await fetchAuthApi("login/", {
                    email,
                    auth_token: authToken,
                });
                tokenManager.setAccessToken(data.access);
                SecureStorage.setUser(data.user);
                SecureStorage.setEncryptionKey(encryptionKey);

                // SecureStorage.setSessionTimeoutLimit(data.user.inactivity_timeout);
                tokenManager.updateSessionTimeoutLimit(data.user.inactivity_timeout);

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: {email: data.user.email}
                } satisfies WorkerResponse);
                break
            }


            case "AUTH_LOGOUT": {
                try {
                    const token = await tokenManager.getAccessToken();

                    if (token) {
                        await fetchAuthApi("logout/", undefined,{
                            "Authorization": `Bearer ${token}` 
                        });
                    }
                } catch (error) {
                    console.log("something went wrong at AUTH_LOGOUT")
                }
                tokenManager.clearAccessToken();
                SecureStorage.clearAll();
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS"
                } satisfies WorkerResponse)
                break;
            }


            case "AUTH_DELETE_ACCOUNT": {
                const { password } = message.payload;
                const email = SecureStorage.getUser()?.email;
                
                const preflight = await fetchAuthApi("preflight/", { email });
                const iterations = preflight.kdf_iterations;
                const { authToken } = await deriveKeys(email ?? "", password, iterations);
                
                const token = await tokenManager.getAccessToken();
                await fetchAuthApi("delete-account/", 
                    { auth_token: authToken },
                    { "Authorization": `Bearer ${token}` }
                );

                tokenManager.clearAccessToken();
                SecureStorage.clearAll();

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS"
                } satisfies WorkerResponse)
                break;
            }


            case "USER_ACTIVITY": {
                tokenManager.recordActivity();
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse)
                break;
            }


            case "CONFIG_SESSION_TIMEOUT": {
                const { timeoutLimit } = message.payload;
                try {
                    const token = SecureStorage.getAccessToken();
                    if (token) {
                        await fetchAuthApi(
                            "preferences/", 
                            {inactivity_timeout: timeoutLimit},
                            { "Authorization": `Bearer ${token}` },
                            "PATCH"
                        )
                        if (timeoutLimit) tokenManager.updateSessionTimeoutLimit(timeoutLimit);
                    }
                } catch (error) {
                    console.log(error)
                }

                self.postMessage({
                    id:message.id,
                    type: "SUCCESS",
                    data: SecureStorage.getSessionTimeoutLimit(),
                } satisfies WorkerResponse)
                break;
            }


            case "AUTH_GET_SESSIONS_LIST": {
                try {
                    const token = await tokenManager.getAccessToken();

                    if (token) {
                        const data = await fetchAuthApi("sessions/", undefined,{
                            "Authorization": `Bearer ${token}` 
                        }, "GET");
                        SecureStorage.setSessionListCache(data)
                    }
                } catch (error) {
                    console.log("something went wrong at AUTH_GET_SESSION_LIST")
                }
                
                self.postMessage({
                    id:message.id,
                    type: "SUCCESS",
                    data: SecureStorage.getSessionListCache(),
                } satisfies WorkerResponse)
                break;
            }


            case "AUTH_REVOKE_SESSION": {
                const { id } = message.payload;
                
                try {
                    const token = SecureStorage.getAccessToken()
                    if (token) {
                        await fetchAuthApi(
                            `sessions/${id}/`, 
                            undefined,
                            {"Authorization": `Bearer ${token}`},
                            "DELETE"
                        )
                    }
                } catch (error) {
                    console.log(error)
                }

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: SecureStorage.getSessionListCache(),
                } satisfies WorkerResponse)
                break;
            }


            case "VAULT_GET_ITEMS": {
                // CACHE LOGIC: look for vaultItemsListCache
                // if it exists return that cache
                const cached = SecureStorage.getItemListCache();
                if (cached) {
                    self.postMessage({
                        id: message.id,
                        type: "SUCCESS",
                        data: cached,
                    } satisfies WorkerResponse);
                    break;
                }


                const raw = await fetchVaultApi("items/", "GET");
                
                const decrypted: DecryptedVaultItemMeta[] = await Promise.all(
                    raw.map(async (item: any): Promise<DecryptedVaultItemMeta> => ({
                        id: item.id,
                        item_type: item.item_type,
                        item_meta_preview: JSON.parse(await decrypt(item.encrypted_meta, item.iv_meta)),
                        folder: item.folder,
                        is_favourite: item.is_favourite,
                        is_deleted: item.is_deleted,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                    }))
                );

                SecureStorage.setItemListCache(decrypted);

                // Add decrypted to vaultItemsListCache in SecureStorage

                self.postMessage({ 
                    id: message.id, 
                    type: "SUCCESS",
                    data: decrypted
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_GET_ITEM": {
                // CACHE LOGIC: look for vaultItemsDetailCache
                // if it exists return that cache
                const { id } = message.payload;

                const cached = SecureStorage.getItemDetailCache(id);
                if (cached) {
                    self.postMessage({
                        id: message.id,
                        type: "SUCCESS",
                        data: cached,
                    } satisfies WorkerResponse);
                    break;
                }

                const raw = await fetchVaultApi(`items/${id}/`, "GET");

                const decrypted: DecryptedVaultItemDetail = {
                    id: raw.id,
                    item_type: raw.item_type,
                    item_meta_preview: JSON.parse(await decrypt(raw.encrypted_meta, raw.iv_meta)),
                    item_data: JSON.parse(await decrypt(raw.encrypted_data, raw.iv_data)),
                    folder: raw.folder,
                    is_favourite: raw.is_favourite,
                    is_deleted: raw.is_deleted,
                    created_at: raw.created_at,
                    updated_at: raw.updated_at,
                };

                // Store the decrypted item in vaultItemDetailCache in SecureStorage
                SecureStorage.setItemDetailCache(id, decrypted);

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: decrypted,
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_CREATE_ITEM": {
                const { item_type, item_meta_preview, item_data } = message.payload;
                const { folder, isFavourite, ...item_meta} = item_meta_preview;

                const encrypted_item_meta_preview = await encrypt(JSON.stringify(item_meta));
                const encrypted_item_data = await encrypt(JSON.stringify(item_data));

                await fetchVaultApi("items/add_new_item/", "POST", {
                    item_type: item_type,
                    encrypted_meta: encrypted_item_meta_preview.ciphertext,
                    iv_meta: encrypted_item_meta_preview.iv,
                    encrypted_data: encrypted_item_data.ciphertext,
                    iv_data: encrypted_item_data.iv,
                    folder: folder === "_nofolder" ? null : folder,
                    is_favourite: isFavourite,
                })

                SecureStorage.invalidateListCache();

                // Invalidate Cache vaultItemListCache in securestorage

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_UPDATE_ITEM": {
                const { id, item_type, item_meta_preview, item_data } = message.payload;
                
                const { folder, isFavourite, ...item_meta} = item_meta_preview;


                const encrypted_item_meta_preview = await encrypt(JSON.stringify(item_meta));
                const encrypted_item_data = await encrypt(JSON.stringify(item_data));

                await fetchVaultApi(`items/${id}/`, "PUT", {
                    item_type,
                    encrypted_meta: encrypted_item_meta_preview.ciphertext,
                    iv_meta: encrypted_item_meta_preview.iv,
                    encrypted_data: encrypted_item_data.ciphertext,
                    iv_data: encrypted_item_data.iv,
                    folder: folder,
                    is_favourite: isFavourite,
                });

                SecureStorage.invalidateDetailCache(id);
                SecureStorage.invalidateListCache();
                SecureStorage.clearFolderCache();

                // Invalidate both cache (in VaultItemDetailCache we can update by the "id" as well)

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_PATCH_ITEM": {
                const { id, folder, isFavourite } = message.payload;

                let payload: PatchItem | null = {}
                if (isFavourite) payload.is_favourite = isFavourite
                if (folder) payload.folder = folder

                await fetchVaultApi(`items/${id}/`, "PATCH", payload)
                
                SecureStorage.invalidateDetailCache(id);
                SecureStorage.invalidateListCache();
                SecureStorage.clearFolderCache();

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_SOFT_DELETE_ITEM": {
                const { id } = message.payload;

                await fetchVaultApi(`items/${id}/`, "DELETE")

                SecureStorage.invalidateDetailCache(id);
                SecureStorage.removeFromItemListCache(id);
                SecureStorage.clearFolderCache();


                // Invalidate both cache (in VaultItemDetailCache we can update by the "id" as well)
                
                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_TOGGLE_FAVOURITE": {
                const { id } = message.payload;

                const res = await fetchVaultApi(`items/${id}/favourite/`, "PATCH")

                SecureStorage.invalidateDetailCache(id);

                const cached = SecureStorage.getItemListCache();
                if (cached) {
                    const updated = cached.map(item => 
                        item.id === id ? { ...item, ...res} : item
                    );
                    SecureStorage.setItemListCache(updated);
                }
                // Invalidate both cache (in VaultItemDetailCache we can update by the "id" as well)

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_GET_ITEM_HISTORY": {
                const { id } = message.payload;

                const raw = await fetchVaultApi(`items/${id}/history/`, "GET")

                const decrypted: DecryptedVaultItemDetail[] = await Promise.all(
                    raw.map(async (item: any) => ({
                        id: item.id,
                        item_meta_preview: JSON.parse(await decrypt(item.encrypted_meta, item.iv_meta)),
                        item_data: JSON.parse(await decrypt(item.encrypted_data, item.iv_data)),
                        created_at: item.created_at,
                    }))
                )

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: decrypted,
                } satisfies WorkerResponse);
                break;
            }

            case "VAULT_GET_TRASH": {
                const raw = await fetchVaultApi("items/?deleted=true", "GET");

                const decrypted: DecryptedVaultItemMeta[] = await Promise.all(
                    raw.map(async (item: any): Promise<DecryptedVaultItemMeta> => ({
                        id: item.id,
                        item_type: item.item_type,
                        item_meta_preview: JSON.parse(await decrypt(item.encrypted_meta, item.iv_meta)),
                        folder: item.folder,
                        is_favourite: item.is_favourite,
                        is_deleted: item.is_deleted,
                        deleted_at: item.deleted_at,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                    }))
                );

                self.postMessage({ 
                    id: message.id, 
                    type: "SUCCESS",
                    data: decrypted
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_RESTORE_ITEM": {
                const { id } = message.payload;

                await fetchVaultApi(`items/${id}/restore/`, "POST");

                // Cache logic
                SecureStorage.invalidateDetailCache(id);
                SecureStorage.invalidateListCache();

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS"
                } satisfies WorkerResponse)
                break;
            }


            case "VAULT_RESTORE_ALL": {
                await fetchVaultApi("items/restore_all/", "POST");

                // Cache logic
                SecureStorage.invalidateListCache();

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS"
                } satisfies WorkerResponse)
                break;
            }


            case "VAULT_HARD_DELETE_ITEM": {
                const { id } = message.payload;

                await fetchVaultApi(`items/${id}/delete/`, "DELETE");

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS"
                } satisfies WorkerResponse)
                break;
            }


            case "VAULT_HARD_DELETE_ALL": {
                await fetchVaultApi("items/delete_all/", "DELETE");

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS"
                } satisfies WorkerResponse)
                break;
            }


            case "VAULT_ANALYSIS": {
                if (SecureStorage.getItemListCache() && SecureStorage.getVaultAnalysis()) {
                    return self.postMessage({
                        id: message.id,
                        type: "SUCCESS",
                        data: SecureStorage.getVaultAnalysis(),
                    } satisfies WorkerResponse)
                }
                
                const raw = await fetchVaultApi("items/analyse/", "GET");

                const decrypted: LoginVaultItemDetail[] = await Promise.all(
                    raw.map(async (item: any): Promise<LoginVaultItemDetail> => ({
                        id: item.id,
                        item_type: item.item_type,
                        item_meta_preview: JSON.parse(await decrypt(item.encrypted_meta, item.iv_meta)),
                        item_data: JSON.parse(await decrypt(item.encrypted_data, item.iv_data)),
                        folder: item.folder,
                        is_favourite: item.is_favourite,
                        is_deleted: item.is_deleted,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                    }))
                )

                const vaultAnalysis = analyseVault(decrypted);

                SecureStorage.setVaultAnalysis(vaultAnalysis);

                self.postMessage({
                    id: message.id,
                    type: "SUCCESS",
                    data: vaultAnalysis,
                } satisfies WorkerResponse);
                break;
            }


            case "VAULT_GET_FOLDERS": {
                const cached = SecureStorage.getFolderCache();
                if (cached) {
                    self.postMessage({ id: message.id, type: "SUCCESS", data: cached } satisfies WorkerResponse);
                    break;
                }

                const raw = await fetchVaultApi("folders/", "GET");
                const decrypted: DecryptedFolder[] = await Promise.all(
                    raw.map(async (f: any) => ({
                        id:         f.id,
                        name:       await decrypt(f.encrypted_name, f.iv_name),
                        created_at: f.created_at,
                        updated_at: f.updated_at,
                        no_of_items: f.no_of_items,
                    }))
                );

                SecureStorage.setFolderCache(decrypted);
                self.postMessage({ id: message.id, type: "SUCCESS", data: decrypted } satisfies WorkerResponse);
                break;
            }

            case "VAULT_CREATE_FOLDER": {
                const { name } = message.payload;
                const encryptedName = await encrypt(name);

                const raw = await fetchVaultApi("folders/add_new_folder/", "POST", {
                    encrypted_name: encryptedName.ciphertext,
                    iv_name:        encryptedName.iv,
                });

                const newFolder: DecryptedFolder = {
                    id:         raw.id,
                    name,
                    created_at: raw.created_at,
                    updated_at: raw.updated_at,
                    no_of_items: raw.no_of_items,
                };

                // add to folder cache directly — no full refetch
                // SecureStorage.appendToFolderCache(newFolder);
                SecureStorage.clearFolderCache();

                self.postMessage({ 
                    id: message.id, 
                    type: "SUCCESS", 
                    data: newFolder 
                } satisfies WorkerResponse);
                break;
            }

            case "VAULT_UPDATE_FOLDER": {
                const {name, id} = message.payload;
                const encryptedName = await encrypt(name);

                const raw = await fetchVaultApi(`folders/${id}/`, "PATCH", {
                    encrypted_name: encryptedName.ciphertext,
                    iv_name:        encryptedName.iv,
                })
                const updatedFolder: DecryptedFolder = {
                    id:         raw.id,
                    name,
                    created_at: raw.created_at,
                    updated_at: raw.updated_at,
                    no_of_items: raw.no_of_items,
                };
                SecureStorage.clearFolderCache();

                self.postMessage({ 
                    id: message.id, 
                    type: "SUCCESS", 
                    data: updatedFolder 
                } satisfies WorkerResponse);
                break;
            }

            case "VAULT_GET_FOLDER_ITEMS": {
                const { id } = message.payload;

                if (!(SecureStorage.getItemListCache())) {

                    const raw = await fetchVaultApi("items/", "GET");
                    
                    const decrypted: DecryptedVaultItemMeta[] = await Promise.all(
                        raw.map(async (item: any): Promise<DecryptedVaultItemMeta> => ({
                            id: item.id,
                            item_type: item.item_type,
                            item_meta_preview: JSON.parse(await decrypt(item.encrypted_meta, item.iv_meta)),
                            folder: item.folder,
                            is_favourite: item.is_favourite,
                            is_deleted: item.is_deleted,
                            created_at: item.created_at,
                            updated_at: item.updated_at,
                        }))
                    );
    
                    SecureStorage.setItemListCache(decrypted);
                } 

                const cached = SecureStorage.getItemListCache()?.filter((item) => {
                    if (id !== "no_folder") return item.folder === id && item.is_deleted === false
                    return item.folder === null && item.is_deleted === false
                })

                if (cached) {
                    self.postMessage({ 
                        id: message.id, 
                        type: "SUCCESS", 
                        data: cached,
                    } satisfies WorkerResponse);
                }

                // const raw = await fetchVaultApi(`folders/${id}/`, "GET")
                // const decrypted: DecryptedVaultItemMeta[] = await Promise.all(
                //     raw.map(async (item: any): Promise<DecryptedVaultItemMeta> => ({
                //         id: item.id,
                //         item_type: item.item_type,
                //         item_meta_preview: JSON.parse(await decrypt(item.encrypted_meta, item.iv_meta)),
                //         folder: item.folder,
                //         is_favourite: item.is_favourite,
                //         is_deleted: item.is_deleted,
                //         created_at: item.created_at,
                //         updated_at: item.updated_at,
                //     }))
                // );

                // self.postMessage({ 
                //     id: message.id, 
                //     type: "SUCCESS",
                //     data: decrypted
                // } satisfies WorkerResponse);
                break;
            }

            case "VAULT_MOVE_ITEMS_TO_FOLDER": {
                const { folder_id, item_ids } = message.payload;

                await fetchVaultApi(`folders/${folder_id}/items/`, "PATCH", { item_ids });

                // update list cache in place — set folder_id on affected items
                SecureStorage.patchListCacheItems(item_ids, folder_id);
                // SecureStorage.invalidateListCache()
                SecureStorage.clearFolderCache();

                self.postMessage({ id: message.id, type: "SUCCESS" } satisfies WorkerResponse);
                break;
            }

            case "VAULT_REMOVE_FROM_FOLDER": {
                const { item_ids } = message.payload;

                await fetchVaultApi("folders/remove/", "PATCH", { item_ids });

                SecureStorage.patchListCacheItems(item_ids);
                SecureStorage.clearFolderCache();

                self.postMessage({ id: message.id, type: "SUCCESS" } satisfies WorkerResponse);
                break;
            }


            default: {
                throw new Error("Unknown message type at worker")
            }
        }
    } catch (err: any) {
        self.postMessage({
            id: message.id,
            type: "ERROR",
            error: err.message,
        } satisfies WorkerResponse);
    }
};