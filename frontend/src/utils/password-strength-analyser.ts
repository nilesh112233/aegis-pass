

type CheckResult = { label: string; pass: boolean };

type StrengthResult = {
    score: number;       // 0–5
    label: string;
    color: string;       // tailwind bg class
    glow: string;        // tailwind shadow class
    textColor: string;
    checks: CheckResult[];
};

export function scorePassword(password: string): number {
    if (password.length === 0) return 0;

    const len = password.length;
    const hasUpper    = /[A-Z]/.test(password);
    const hasLower    = /[a-z]/.test(password);
    const hasNumber   = /[0-9]/.test(password);
    const hasSymbol   = /[^A-Za-z0-9]/.test(password);
    const repeating   = /(.)\1{2,}/.test(password);
    const sequential  = hasSequential(password);

    const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    // length is the primary gate — short passwords can never score high
    let lengthScore = 0;
    if      (len >= 16) lengthScore = 3;
    else if (len >= 12) lengthScore = 2;
    else if (len >= 8)  lengthScore = 1;
    // < 8 stays 0

    // variety adds at most 2 points on top of length
    let varietyScore = 0;
    if      (varietyCount === 4) varietyScore = 2;
    else if (varietyCount === 3) varietyScore = 1;
    else if (varietyCount === 2) varietyScore = 0.5;

    let raw = lengthScore + varietyScore;

    // pattern penalties
    if (repeating)  raw -= 1;
    if (sequential) raw -= 0.5;

    return Math.max(0, Math.min(5, Math.round(raw)));
}

function hasSequential(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
        const a = password.charCodeAt(i);
        const b = password.charCodeAt(i + 1);
        const c = password.charCodeAt(i + 2);
        if (b === a + 1 && c === a + 2) return true;
    }
    return false;
}

function hasRepeating(password: string): boolean {
    return /(.)\1{2,}/.test(password);
}

export function analysePassword(password: string): StrengthResult {
    const checks: CheckResult[] = [
        { label: "At least 8 characters",          pass: password.length >= 8 },
        { label: "At least 12 characters",          pass: password.length >= 12 },
        { label: "Uppercase letters (A–Z)",         pass: /[A-Z]/.test(password) },
        { label: "Lowercase letters (a–z)",         pass: /[a-z]/.test(password) },
        { label: "Numbers (0–9)",                   pass: /[0-9]/.test(password) },
        { label: "Symbols (!@#$%^&*…)",            pass: /[^A-Za-z0-9]/.test(password) },
        { label: "No repeating characters (aaa)",  pass: !hasRepeating(password) },
        { label: "No sequential patterns (abc)",   pass: !hasSequential(password) },
    ];

    const score = scorePassword(password);

    const levels = [
        { label: "Very Weak",  color: "bg-red-500",    glow: "shadow-red-500/40",   textColor: "text-red-400"   },
        { label: "Weak",       color: "bg-orange-500", glow: "shadow-orange-500/40",textColor: "text-orange-400"},
        { label: "Fair",       color: "bg-yellow-500", glow: "shadow-yellow-500/40",textColor: "text-yellow-400"},
        { label: "Good",       color: "bg-lime-500",   glow: "shadow-lime-500/40",  textColor: "text-lime-400"  },
        { label: "Strong",     color: "bg-green-500",  glow: "shadow-green-500/40", textColor: "text-green-400" },
        { label: "Very Strong",color: "bg-emerald-400",glow: "shadow-emerald-400/50",textColor: "text-emerald-400"},
    ];

    return { score, checks, ...levels[score] };
}
