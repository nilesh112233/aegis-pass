// import { useOutletContext } from "react-router-dom";
// import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";

// type OutletContext = {
//     searchResults: DecryptedVaultItemMeta[] | null;
// };

// export function useOutletSearch() {
//     return useOutletContext<OutletContext>();
// }

// src/hooks/use-outlet-search.ts
import { useOutletContext } from "react-router-dom";
// import type { DecryptedVaultItemMeta } from "@/worker/utils/types.vault";

type OutletContext = {
    // searchResults: DecryptedVaultItemMeta[] | null;
    searchQuery: string;
};

export function useOutletSearch() {
    return useOutletContext<OutletContext>();
}