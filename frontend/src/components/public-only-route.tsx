import type React from "react";
import { useWorkerService } from "@/context/worker-provider";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";   
import { Spinner } from "./ui/spinner";

type AuthState = "loading" | "authenticated" | "unauthenticated";


const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { client } = useWorkerService();
    const [authState, setAuthState] = useState<AuthState>("loading");

    useEffect(() => {
        client.AuthService.checkAuthStatus()
        .then((res) => {
            setAuthState(res.isAuthenticated ? "authenticated": "unauthenticated");
        })
        .catch(() => setAuthState("unauthenticated"));

    }, [client]);

    if (authState === "loading") {
        return <Spinner fontSize={16} className="absolute top-1/2 left-1/2"/>
    }

    if (authState === "authenticated") {
        return <Navigate to="/vault" replace />
    }

    return (
        <>{children}</>
    )
};

export default PublicOnlyRoute;