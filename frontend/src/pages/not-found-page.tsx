import { useWorkerService } from "@/context/worker-provider";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    const { client } = useWorkerService();
    const [redirectPath, setRedirectPath] = useState("")
    async function userAuth () {
        try {
            const user = await client.AuthService.user()
            if (user) {
                setRedirectPath("/vault")
            } else {setRedirectPath("/login")}
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        userAuth()
    }, [client])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-6xl font-bold">404</h1>

            <p className="text-muted-foreground">
                The page you are looking for does not exist.
            </p>

            <Link
                to={redirectPath}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFoundPage;