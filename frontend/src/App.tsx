import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "./context/theme-provider";
import { WorkerProvider } from "./context/worker-provider";
import AppRoutes from "./routes/routes";
import { Toaster } from "react-hot-toast";

function App() {

    return (
        <>
            <Toaster position="bottom-right" />
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <WorkerProvider>
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </WorkerProvider>
            </ThemeProvider>
        </>
    );
}

export default App;
