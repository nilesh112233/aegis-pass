import type { DecryptedVaultItemDetail, DecryptedVaultItemMeta, DecryptedFolder } from "./types.vault";
import type { VaultAnalysis } from "./vault-analyser";

type User = {
    email: string;
    kdf_iterations: number;
    created_at: number;
}

type ItemListCache = {
    items: DecryptedVaultItemMeta[];
    cachedAt: number;
}

type ItemDetailCache = {
    item: DecryptedVaultItemDetail;
    cachedAt: number;
}

export type SessionDetail = {
    id: string;
    device_hint: string;
    ip_address: string;
    created_at: number;
    last_used_at: number;
}

const ITEM_LIST_CACHE_TTL = 5*60*1000;
const ITEM_DETAIL_CACHE_TTL = 10*60*1000;
const DEFAULT_INACTIVITY_TIMEOUT = 15;


let _accessToken: string | null = null;
let _encryptionKey: CryptoKey | null = null;
let _user: User | null = null;
let _INACTIVITY_SESSION_TIMEOUT_LIMIT_MIN : number = 15;
let _sessionListCache: SessionDetail[] | null = null;

let _itemListCache: ItemListCache | null = null;
let _itemDetailCache: Map<string, ItemDetailCache> = new Map(); 
let _vaultAnalysis: VaultAnalysis | null = null;
let _folderCache: DecryptedFolder[] | null = null;


function isStaleCache(cachedAt: number, ttl: number): boolean {
    return Date.now() - cachedAt > ttl;
}

export const SecureStorage = {
    getAccessToken: (): string | null => _accessToken,
    setAccessToken: (token: string): void => { _accessToken = token },
    clearAccessToken: (): void => { _accessToken = null },

    getEncryptionKey: (): CryptoKey | null => _encryptionKey,
    setEncryptionKey: (key: CryptoKey): void => { _encryptionKey = key },
    clearEncryptionKey: (): void => { _encryptionKey = null },

    getUser: (): User | null => _user,
    setUser: (user: User): void => { _user = user },
    clearUser: (): void => { _user = null },

    getSessionTimeoutLimit: (): number => _INACTIVITY_SESSION_TIMEOUT_LIMIT_MIN,
    setSessionTimeoutLimit: (mins: number): void => {_INACTIVITY_SESSION_TIMEOUT_LIMIT_MIN = mins},
    clearSessionTimeoutLimit: (): void => {_INACTIVITY_SESSION_TIMEOUT_LIMIT_MIN = 0},

    getSessionListCache: (): SessionDetail[] | null => _sessionListCache,
    setSessionListCache: (sessions: SessionDetail[]): void => { _sessionListCache = sessions },
    clearSessionListCache: (): void => { _sessionListCache = null },

    //Cache management
    getItemListCache: (): DecryptedVaultItemMeta[] | null => {
        if (!_itemListCache) return null;
        if (isStaleCache(_itemListCache.cachedAt, ITEM_LIST_CACHE_TTL)) {
            _itemListCache = null;
            return null;
        } 
        return _itemListCache.items;
    },

    setItemListCache: (items: DecryptedVaultItemMeta[]): void => {
        _itemListCache = { items, cachedAt: Date.now() };
    },

    patchItemListCache: (id: string, patch: Partial<DecryptedVaultItemMeta>): void => {
        if (!_itemListCache) return;
        if (isStaleCache(_itemListCache.cachedAt, ITEM_LIST_CACHE_TTL)) {
            _itemListCache = null;
            return;
        } 
        _itemListCache.items = _itemListCache.items.map((item) => (
            item.id === id ? { ...item, ...patch } : item
        ));
    },

    removeFromItemListCache: (id: string): void => {
        if (!_itemListCache) return;
        if (isStaleCache(_itemListCache.cachedAt, ITEM_LIST_CACHE_TTL)) {
            _itemListCache = null;
            return;
        }
        _itemListCache.items = _itemListCache.items.filter((item) => item.id != id);
    },

    invalidateListCache: (): void => { 
        _itemListCache = null; 
        _vaultAnalysis = null;
    },

    getItemDetailCache: (id: string): DecryptedVaultItemDetail | null => {
        const entry = _itemDetailCache.get(id);
        if (!entry) return null;
        if (isStaleCache(entry.cachedAt, ITEM_DETAIL_CACHE_TTL)) {
            _itemDetailCache.delete(id);
            return null;
        }
        return entry.item;
    },

    setItemDetailCache: (id: string, item: DecryptedVaultItemDetail): void => {
        _itemDetailCache.set(id, { item, cachedAt: Date.now() });
    },

    invalidateDetailCache: (id: string ): void => { _itemDetailCache.delete(id); },

    getVaultAnalysis: (): VaultAnalysis | null => _vaultAnalysis,
    setVaultAnalysis: (a: VaultAnalysis): void => { _vaultAnalysis = a; },

    getFolderCache: (): DecryptedFolder[] | null => _folderCache,
    setFolderCache: (folders: DecryptedFolder[]): void => { _folderCache = folders; },

    appendToFolderCache: (folder: DecryptedFolder): void => {
        if (!_folderCache) { _folderCache = [folder]; return; }
        _folderCache = [..._folderCache, folder];
    },

    // patch multiple items in the list cache at once
    patchListCacheItems: (ids: string[], folder_id?: string): void => {
        if (!_itemListCache) return;
        const idSet = new Set(ids);
        _itemListCache.items = _itemListCache.items.map(item => {
            if (folder_id) {
                return idSet.has(item.id) ? { ...item, folder: folder_id } : item
            } 
            return idSet.has(item.id) ? { ...item, folder: "" }: item
        }
        );
    },

    clearFolderCache: (): void => {_folderCache = null},


    clearAll: (): void => {
        _accessToken = null;
        _encryptionKey = null;
        _user = null;
        _INACTIVITY_SESSION_TIMEOUT_LIMIT_MIN = DEFAULT_INACTIVITY_TIMEOUT;
        _sessionListCache = null;
        _itemListCache = null;
        _itemDetailCache.clear();
        _folderCache = null;
    }
}
