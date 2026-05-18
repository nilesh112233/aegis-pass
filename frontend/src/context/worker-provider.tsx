import { WorkerClient } from "@/worker/worker-client";
import React, { createContext, useContext, useRef } from "react";

// add all the states and function to the WorkerCOntextType which will be used later
type WorkerContextType = {
    client: WorkerClient
}

// context for worker
const WorkerContext = createContext<WorkerContextType | null>(null);

// workerContext provider wrapper
export const WorkerProvider: React.FC<{ children: React.ReactNode}> = ({ children, }) => {
    const renderCount = useRef(0);
    renderCount.current++;
    console.log("WorkerProvider render #", renderCount.current)
    const clientRef = useRef<WorkerClient | null>(null);

    if (!clientRef.current) {
        clientRef.current = new WorkerClient();
    }


    return (
        <WorkerContext.Provider value={{client: clientRef.current}}>
            {children}
        </WorkerContext.Provider>
    );
};


// create useContext hook for worker context
export const useWorkerService = () => {
    const ctx = useContext(WorkerContext);

    if (!ctx) throw new Error("useWorker must be used inside WorkerProvider");
    return ctx;
}