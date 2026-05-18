import type React from "react";
import { useWorkerService } from "@/context/worker-provider";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";   
import { Spinner } from "./ui/spinner";
import { useActivityTracker } from "@/hooks/use-activity-tracker";


type AuthState = "loading" | "authenticated" | "unauthenticated";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { client } = useWorkerService();
    const [authState, setAuthState] = useState<AuthState>("loading");
    // const navigate = useNavigate();

    useActivityTracker();

    useEffect(() => {
        client.AuthService.checkAuthStatus()
        .then((res) => {
            setAuthState(res.isAuthenticated ? "authenticated": "unauthenticated");
        })
        .catch(() => setAuthState("unauthenticated"));

        client.onForceLogout = () => {
            console.log("AT PROTECTED ROUTE onForceLogout called.")
            setAuthState("unauthenticated");
            return;
        };
    }, [client]);

    if (authState === "loading") {
        return <Spinner fontSize={26} className="absolute top-1/2 left-1/2"/>
    }

    if (authState === "unauthenticated") {
        return <Navigate to="/login" replace />
    }

    return (
        <>{children}</>
    )
};

export default ProtectedRoute;