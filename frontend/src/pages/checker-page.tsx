import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toastQueue } from "@/utils/toast-queue";
import { Eye, EyeOff, ShieldCheck, ShieldAlert, ShieldX, Shield, CheckCheck, Copy } from "lucide-react";
import { useState } from "react";
import { analysePassword } from "@/utils/password-strength-analyser";


function StrengthIcon({ score }: { score: number }) {
    if (score <= 1) return <ShieldX size={20} />;
    if (score <= 3) return <ShieldAlert size={20} />;
    if (score === 4) return <Shield size={20} />;
    return <ShieldCheck size={20} />;
}


const CheckerPage = () => {
    console.log(Date.now())
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);

    const result = analysePassword(password);
    const isEmpty = password.length === 0;
    const fillPercent = isEmpty ? 0 : Math.round((result.score / 5) * 100);

    return (
        <div className="flex justify-center items-start mx-auto">
            <Card className="container max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-xl">Password Strength Checker</CardTitle>
                    <CardDescription>Analyse your password's security before using it.</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">

                    {/* ── input ── */}
                    <div className="relative">
                        <div className="py-5 flex items-center min-h-11 w-full rounded-md border border-input bg-transparent px-4 pr-12 text-sm font-mono font-semibold tracking-wider transition-colors focus-within:ring-2 focus-within:ring-ring">
                            <input
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a password to analyse..."
                                autoComplete="off"
                                autoFocus={true}
                                spellCheck={false}
                                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground placeholder:font-sans placeholder:tracking-normal text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShow(v => !v)}
                            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {show ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <Copy 
                            size={20} 
                            onClick={() => {
                                navigator.clipboard.writeText(password)
                                toastQueue.push("Copied to clipboard.", "success")
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        />
                    </div>

                    {/* ── strength bar ── */}
                    <div className="overflow-hidden border rounded-lg my-1 p-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground select-none">Strength</span>
                                {!isEmpty && (
                                    <span className={`flex items-center gap-1.5 font-medium transition-colors duration-500 ${result.textColor}`}>
                                        <StrengthIcon score={result.score} />
                                        {result.label}
                                    </span>
                                )}
                            </div>

                            {/* bar track */}
                            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${isEmpty ? "" : result.color} shadow-md ${isEmpty ? "" : result.glow}`}
                                    style={{ width: `${fillPercent}%` }}
                                />
                            </div>

                            {/* segment markers */}
                            <div className="flex justify-between px-0.5 select-none">
                                {["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"].map((label, i) => (
                                    <span
                                        key={label}
                                        className={`text-[10px] transition-colors duration-300 ${
                                            !isEmpty && result.score >= i
                                                ? result.textColor
                                                : "text-muted-foreground/40"
                                        }`}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── checklist ── */}
                    <div className="border rounded-lg p-5 flex flex-col gap-2.5">
                        <span className="text-sm text-muted-foreground select-none mb-1">Requirements</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {result.checks.map((check) => (
                                <div
                                    key={check.label}
                                    className={`flex items-center gap-2.5 text-sm transition-colors duration-300 ${
                                        isEmpty
                                            ? "text-muted-foreground/50"
                                            : check.pass
                                            ? "text-emerald-400"
                                            : "text-muted-foreground"
                                    }`}
                                >   
                                    <CheckCheck size={16} className={` flex-shrink-0 transition-colors duration-300 ${
                                        isEmpty
                                            ? "text-muted-foreground/30"
                                            : check.pass
                                            ? "text-emerald-400"
                                            : "text-muted-foreground/30"
                                    }`}/>
                                    {check.label}
                                </div>
                            ))}
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default CheckerPage;