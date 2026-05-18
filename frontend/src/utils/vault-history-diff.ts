// src/utils/vault-history-diff.ts

export type FieldChange = {
    field: string;
    label: string;
    // previous: string;
    current: string;
}

export type HistoryEntry = {
    id: string;
    created_at: string;
    changes: FieldChange[];
}

// human readable labels for each field key
const FIELD_LABELS: Record<string, string> = {
    name:     "Name",
    username: "Username",
    password: "Password",
    url:      "URL",
    notes:    "Notes",
};

// fields to always mask in the diff display
// const MASKED_FIELDS = new Set(["password"]);

// function maskValue(field: string, value: string): string {
//     if (!value) return "—";
//     if (MASKED_FIELDS.has(field)) return "••••••••";
//     return value;
// }

function flattenEntry(entry: any): Record<string, string> {
    return {
        name:     entry.item_meta_preview?.name     ?? "",
        username: entry.item_data?.username          ?? "",
        password: entry.item_data?.password          ?? "",
        url:      entry.item_data?.url               ?? "",
        notes:    entry.item_data?.notes             ?? "",
    };
}

export function buildHistoryDiff(entries: any[]): HistoryEntry[] {
    // entries come newest first from the API
    // index 0 = most recent history snapshot
    // we compare each entry against the one after it (the older version)

    return entries.map((entry, i) => {
        const current  = flattenEntry(entry);
        const previous = i < entries.length - 1
            ? flattenEntry(entries[i + 1])
            : null; // oldest entry — no previous to compare against

        const changes: FieldChange[] = [];
        console.log(current)
        console.log(previous)

        for (const [field, currentValue] of Object.entries(current)) {
            const previousValue = previous?.[field] ?? "";

            if (currentValue !== previousValue) {
                changes.push({
                    field,
                    label:    FIELD_LABELS[field] ?? field,
                    // previous: maskValue(field, previousValue),
                    current: currentValue !== "" ? currentValue : "—",
                });
            }
        }

        return {
            id:         entry.id,
            created_at: entry.created_at,
            changes,
        };
    });
}