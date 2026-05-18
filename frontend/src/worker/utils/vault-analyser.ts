import { scorePassword } from "@/utils/password-strength-analyser";
import type { DecryptedVaultItemDetail, LoginVaultItemDetail } from "./types.vault";

export type VaultAnalysis = {
    total_passwords: number;
    weak_passwords: string[];
    reused_passwords: string[][];
    recently_added: string[];
}
const WEAK_THRESHOLD = 3;

export function analyseVault(items: DecryptedVaultItemDetail[]): VaultAnalysis {
    const loginItems = items.filter((item): item is LoginVaultItemDetail => item.item_type === "login" && !item.is_deleted);

    const weak_passwords = loginItems.filter(item => scorePassword(item.item_data.password ?? "") < WEAK_THRESHOLD).map(item => item.id);

    const passwordGroups = new Map<string, string[]>();
    for (const item of loginItems) {
        const pw = item.item_data.password ?? "";
        if (!pw) continue;
        if (!passwordGroups.has(pw)) passwordGroups.set(pw, []);
        passwordGroups.get(pw)!.push(item.id);
    }

    const reused_passwords = [...passwordGroups.values()].filter(item => item.length > 1);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recently_added = loginItems.filter(item => new Date(item.created_at).getTime() > thirtyDaysAgo).map(item => item.id);

    return {
        total_passwords: loginItems.length,
        weak_passwords,
        reused_passwords,
        recently_added,
    };
}