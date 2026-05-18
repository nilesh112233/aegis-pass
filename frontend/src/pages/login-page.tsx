import { LoginForm } from "@/components/auth/login-form";

const LoginPage = () => {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] -z-10">
                <defs>
                <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                    {/* <circle cx="1" cy="1" r="1" fill="currentColor" /> */}
                    <circle cx="1" cy="1" r="1" fill="var(--color-accent-brand)" />
                </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    )
};

export default LoginPage;