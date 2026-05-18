const NUMBERS = new Set("0123456789");
const SYMBOLS = new Set("!@#$%^&*");
const UPPERCASE = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ");


export function getCharColor(char: string): string {
    if (NUMBERS.has(char)) return "text-red-500 dark:text-red-400";
    if (SYMBOLS.has(char))  return "text-blue-500 dark:text-blue-400";
    if (UPPERCASE.has(char))return "text-amber-500 dark:text-amber-400";
    return "";
}