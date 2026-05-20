// Worker-client is the communication layer between worker and main thread
// it organizes the messaging jargon between worker and main thread by 
// handling the masssages and providing clean api( functions ) like format to main thread

import type { DecryptedFolder, DecryptedVaultItemDetail, DecryptedVaultItemMeta, NewVaultItemPayload, PatchItem } from "./utils/types.vault";
import type { WorkerRequest, WorkerResponse, WorkerPushEvent } from "./worker";
import type { VaultAnalysis } from "./utils/vault-analyser";
import type { SessionDetail } from "./utils/secure-storage";
import { toastQueue } from "@/utils/toast-queue";

export class WorkerClient {
    private worker: Worker;     // Main Worker for the app
    private callbacks = new Map<string, { resolve: Function, reject: Function}> ();
    
    // export auth service methods
    public AuthService: {
        ping: () => Promise<any>;
        user: () => Promise<any>;
        checkAuthStatus: () => Promise<any>;
        register: (email: string, password: string) => Promise<any>;
        login: (email: string, password: string) => Promise<{ email: string }>;
        logout: () => Promise<any>;
        deleteAccount: (password: string) => Promise<any>;
        configSessionTimeout: (timeoutLimit?: number) => Promise<number>,
        recordActivity: () => Promise<any>;
        getSessionsList: () => Promise<SessionDetail[]>;
        revokeSession: (id: string) => Promise<void>;
    };

    public CryptoService: {
        getItems: () => Promise<DecryptedVaultItemMeta[]>;
        getItem: (id: string) => Promise<DecryptedVaultItemDetail>,
        createItem: (payload: NewVaultItemPayload) => Promise<void>,
        updateItem: (id: string, payload: NewVaultItemPayload) => Promise<void>,
        patchItem: (id: string, payload: PatchItem) => Promise<void>,
        deleteItem: (id: string) => Promise<void>,
        restoreItem: (id: string) => Promise<void>,
        toggleFavourite: (id: string) => Promise<{ is_favourite: boolean}>,
        getItemHistory: (id: string) => Promise<any>,
        getTrash: () => Promise<DecryptedVaultItemMeta[]>,
        permanentDeleteItem: (id: string) => Promise<void>,
        restoreAllItems: () => Promise<void>,
        deleteAllItems: () => Promise<void>,
        analyseVault: () => Promise<VaultAnalysis>,

        getFolders: () => Promise<DecryptedFolder[]>;
        createFolder: (payload: { name: string }) => Promise<void>;
        updateFolder: (id: string, payload: { name: string }) => Promise<void>;
        getFolderDetail: (id: string) => Promise<void>;
        addItemsToFolder: (payload: { folder_id: string, item_ids: string[] }) => Promise<void>;
        removeItemsFromFolder: (payload: { folder_id: string, item_ids: string[] }) => Promise<void>; 
    };

    public onForceLogout?: () => void;
    
    constructor() {
        this.worker = new Worker(new URL("./worker.ts", import.meta.url), {type: "module"});

        this.worker.onmessage = (event: MessageEvent<WorkerResponse | WorkerPushEvent>) => {
            const res = event.data;

            if (!("id" in res)) {
                if (res.type === "FORCE_LOGOUT") {
                    this.onForceLogout?.();
                }
                return;
            } 

            const callback = this.callbacks.get(res.id);
            if (!callback) return;
            
            if (res.type === "SUCCESS") {
                callback.resolve(res.data);
            } else {
                console.log(res.error)
                callback.reject(new Error(res.error));
            }

            this.callbacks.delete(res.id);
        }

        this.onForceLogout = () => {toastQueue.push("You are logged out due to inactivity.", "success")}

        this.AuthService = {
            ping: () => this.sendMessage("PING"),
            user: () => this.sendMessage("AUTH_USER"),
            checkAuthStatus: () => this.sendMessage("AUTH_STATUS_CHECK"),
            register: (email, password) => this.sendMessage("AUTH_REGISTER", {email, password}),
            login: (email, password) => this.sendMessage("AUTH_LOGIN", {email, password}),
            logout: () => this.sendMessage("AUTH_LOGOUT"),
            deleteAccount: (password) => this.sendMessage("AUTH_DELETE_ACCOUNT", {password}),
            configSessionTimeout: (timeoutLimit) => this.sendMessage("CONFIG_SESSION_TIMEOUT", {timeoutLimit}),
            recordActivity: () => this.sendMessage("USER_ACTIVITY"),
            getSessionsList: () => this.sendMessage("AUTH_GET_SESSIONS_LIST"),
            revokeSession: (id) => this.sendMessage("AUTH_REVOKE_SESSION", { id }),
        }

        this.CryptoService = {
            getItems: () => this.sendMessage("VAULT_GET_ITEMS"),
            getItem: (id) => this.sendMessage("VAULT_GET_ITEM", { id }),
            createItem: (payload) => this.sendMessage("VAULT_CREATE_ITEM", { ...payload }),
            updateItem: (id, payload) => this.sendMessage("VAULT_UPDATE_ITEM", { id, ...payload }),
            patchItem: (id, payload) => this.sendMessage("VAULT_PATCH_ITEM", { id, ...payload }),
            deleteItem: (id) => this.sendMessage("VAULT_SOFT_DELETE_ITEM", { id }),
            restoreItem: (id) => this.sendMessage("VAULT_RESTORE_ITEM", { id }),
            toggleFavourite: (id) => this.sendMessage("VAULT_TOGGLE_FAVOURITE", { id }),
            getItemHistory: (id) => this.sendMessage("VAULT_GET_ITEM_HISTORY", { id }),
            getTrash: () => this.sendMessage("VAULT_GET_TRASH"),
            permanentDeleteItem: (id) => this.sendMessage("VAULT_HARD_DELETE_ITEM", { id }),
            restoreAllItems: () => this.sendMessage("VAULT_RESTORE_ALL"),
            deleteAllItems: () => this.sendMessage("VAULT_HARD_DELETE_ALL"),
            analyseVault: () => this.sendMessage("VAULT_ANALYSIS"),

            getFolders: () => this.sendMessage("VAULT_GET_FOLDERS"),
            createFolder: (payload) => this.sendMessage("VAULT_CREATE_FOLDER", {...payload}),
            updateFolder: (id, payload) => this.sendMessage("VAULT_UPDATE_FOLDER", { id, ...payload}),
            getFolderDetail: (id) => this.sendMessage("VAULT_GET_FOLDER_ITEMS", { id }),
            addItemsToFolder: (payload) => this.sendMessage("VAULT_MOVE_ITEMS_TO_FOLDER", {...payload}),
            removeItemsFromFolder: (payload) => this.sendMessage("VAULT_REMOVE_FROM_FOLDER", {...payload}), 
        }

    };

    private generateId () {
        return crypto.randomUUID();
    }

    sendMessage<T = any> (type: WorkerRequest["type"], payload?: any): Promise<T> {
        const id = this.generateId();

        return new Promise((resolve, reject) => {
            this.callbacks.set(id, {resolve, reject});

            this.worker.postMessage({
                id,
                type,
                payload,
            } as WorkerRequest);
        });
    }

}