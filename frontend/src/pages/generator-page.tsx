import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCcwDot } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { getCharColor } from "@/utils/password-colors";
import { toastQueue } from "@/utils/toast-queue";


const GeneratorPage = () => {
    console.log(Date.now())
    const [generatedPassword, setGeneratedPassword] = useState<string>("");
    const [checkOptions, setCheckOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [passLength, setPassLength] = useState<number>(14);
    const [minNumbers, setMinNumbers] = useState<number>(2);
    const [minSymbols, setMinSymbols] = useState<number>(1);

    const safePassLength = Math.min(Math.max(minNumbers + minSymbols + Number(checkOptions.uppercase) + Number(checkOptions.lowercase), 5), 128);


    useEffect(() => {
        const effectiveLength = Math.max(safePassLength, passLength)
        setGeneratedPassword(generate_password(effectiveLength, checkOptions, minNumbers, minSymbols))
    }, [passLength, minNumbers, minSymbols, checkOptions])

    const handleCheckboxChange = (name: string, checked: boolean) => {

        if (!checked) {
            let trueCount = Object.values(checkOptions).filter(Boolean).length;
            if (trueCount == 1) {
                toastQueue.push("Select atleast one character set.", "error");
                return;
            }
        }

        setCheckOptions((prev) => ({
            ...prev,
            [name]: checked,
        }));
    }

    const refreshGeneratedPassword = () => {
        setGeneratedPassword(generate_password(passLength, checkOptions, minNumbers, minSymbols))
    }

    return (
        <div className="flex justify-center items-center mx-auto ">
            <Card className="container max-w-4xl">
                <CardHeader className="">
                    <CardTitle className="text-xl">Password Generator</CardTitle>
                    <CardDescription className="p-0 m-0">Create strong, secure password with custom requirements.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="overflow-hidden no-scrollbar border rounded-lg flex items-center py-4 px-5 ">
                        <div className="overflow-auto max-w-3xl break-all font-mono tracking-wide no-scrollbar mr-4">
                            {generatedPassword.split("").map((char, i) => (
                                <span key={i} className={getCharColor(char)}>
                                    {char}
                                </span>
                            ))}
                        </div>
                        <div 
                            className="text-fg-muted hover:text-accent-brand ml-auto mx-5" 
                            onClick={() => {
                                navigator.clipboard.writeText(generatedPassword);
                                toastQueue.push("Copied to clipboard.", "success")
                            }}
                        >
                            <Copy />
                        </div>
                        <div className="text-fg-muted hover:text-accent-brand"  onClick={refreshGeneratedPassword} > <RefreshCcwDot /> </div>
                    </div>
                    <div>
                        <span className="text-sm select-none">Options</span>
                        <div className="overflow-hidden border rounded-lg my-1 p-5 py-4">
                            <Label className="text-muted-foreground mb-2">Length</Label>
                            <Input 
                                type="number"
                                max={128}
                                min={5}
                                step={1} 
                                value={passLength} 
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassLength(Number(e.target.value))} 
                            />
                            <div className="text-xs my-1 text-muted-foreground select-none">Value must be between {safePassLength} and 128. Use 14 characters or more to generate a strong password.</div>
                        </div>
                    </div>
                    <div className="overflow-hidden border rounded-lg my-1 p-5 py-4">
                        <span>Include</span>
                        <div className="my-3 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="uppercaseCheckbox"
                                    name="uppercase"
                                    checked={checkOptions.uppercase}
                                    onCheckedChange={(checked) => handleCheckboxChange("uppercase", !!checked)}
                                    className="data-[state=checked]:bg-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:text-black dark:data-[state=checked]:bg-accent-brand"          
                                />
                                <Label htmlFor="uppercaseCheckbox" className="font-normal" >Include uppercase letters (A-Z)</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="lowercaseCheckbox"
                                    name="lowercase"
                                    checked={checkOptions.lowercase}
                                    onCheckedChange={(checked) => handleCheckboxChange("lowercase", !!checked)}
                                    className="data-[state=checked]:bg-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:text-black dark:data-[state=checked]:bg-accent-brand"          

                                />
                                <Label htmlFor="lowercaseCheckbox" className="font-normal" >Include lowercase letters (a-z)</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="numbersCheckbox"
                                    name="numbers"
                                    checked={checkOptions.numbers}
                                    onCheckedChange={(checked) => handleCheckboxChange("numbers", !!checked)}
                                    className="data-[state=checked]:bg-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:text-black dark:data-[state=checked]:bg-accent-brand"          
                                />
                                <Label htmlFor="numbersCheckbox" className="font-normal" >Include numbers (0-9)</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="symbolsCheckbox"
                                    name="symbols"
                                    checked={checkOptions.symbols}
                                    onCheckedChange={(checked) => handleCheckboxChange("symbols", !!checked)}
                                    className="data-[state=checked]:bg-accent-brand data-[state=checked]:border-accent-brand data-[state=checked]:text-black dark:data-[state=checked]:bg-accent-brand"          
                                />
                                <Label htmlFor="symbolsCheckbox" className="font-normal" >Include symbols (!@#$%^&*)</Label>
                            </div>
                            <div className="flex col-2 gap-5 w-full">
                                <div className="col-1 w-1/2">
                                    <Label className="text-muted-foreground mb-2">Minimum numbers</Label>
                                    <Input 
                                        type="number"
                                        min={0}
                                        max={9} 
                                        value={minNumbers} 
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            setMinNumbers(Number(e.target.value));
                                            if (passLength < safePassLength) setPassLength(safePassLength);
                                        }}
                                    />
                                </div>
                                <div className="col-2 w-1/2">
                                    <Label className="text-muted-foreground mb-2">Minimum special</Label>
                                    <Input 
                                        type="number"
                                        min={0}
                                        max={9} 
                                        value={minSymbols} 
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            setMinSymbols(Number(e.target.value));
                                            if (passLength < safePassLength) setPassLength(safePassLength);
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}



function secureRandom(max: number): number {
    const array = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;

    let rand;
    do {
        crypto.getRandomValues(array);
        rand = array[0];
    } while (rand >= limit);

    return rand % max;
}

function generate_password(
    passLength: number, 
    characters: {
        uppercase: boolean,
        lowercase: boolean,
        numbers: boolean,
        symbols: boolean,
    }, 
    minNumbers: number, 
    minSymbols: number
) {

    const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    const NUMBERS = "0123456789";
    const SYMBOLS = "!@#$%^&*";

    const length     = Math.min(Math.max(passLength, 5), 128);
    const safeNumbers = characters.numbers ? Math.max(minNumbers, 0) : 0;
    const safeSymbols = characters.symbols ? Math.max(minSymbols, 0) : 0;

    if (safeNumbers + safeSymbols >= length) return "";

    let selected_set = "";

    if (characters.uppercase) selected_set += UPPERCASE;
    if (characters.lowercase) selected_set += LOWERCASE;
    if (characters.numbers) selected_set += NUMBERS;
    if (characters.symbols) selected_set += SYMBOLS;

    let guaranteed: string[] = [];

    if (characters.uppercase) guaranteed.push(UPPERCASE[secureRandom(UPPERCASE.length)]);
    if (characters.lowercase) guaranteed.push(LOWERCASE[secureRandom(LOWERCASE.length)]);
    for (let i = 0; i < safeNumbers; i++) guaranteed.push(NUMBERS[secureRandom(NUMBERS.length)]);
    for (let i = 0; i < safeSymbols; i++) guaranteed.push(SYMBOLS[secureRandom(SYMBOLS.length)]);

    const remaining = length - guaranteed.length;
    const filler: string[] = [];
    for (let i = 0; i < remaining; i++) {
        filler.push(selected_set[secureRandom(selected_set.length)]);
    }

    const combined = [...guaranteed, ...filler];
    
    for (let i = combined.length - 1; i > 0; i--) {
        const j = secureRandom(i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join("");

}

export default GeneratorPage;