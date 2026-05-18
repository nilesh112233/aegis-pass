import { useWorkerService } from "@/context/worker-provider"
import { useEffect, useRef } from "react";

const THROTTLE_MS = 60_000;

export function useActivityTracker() {
    const { client } = useWorkerService();
    const lastSentRef = useRef<number>(0);

    useEffect(() => {
        function onActivity() {
            const now = Date.now();
            const timeSinceLastSent = now - lastSentRef.current;

            if (timeSinceLastSent < THROTTLE_MS) return;

            lastSentRef.current = now;
            console.log("recordActivity event sent to worker.")
            client.AuthService.recordActivity();
        }

        const events = ["mousemove", "keydown", "pointerdown", "scroll"];
        events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

        return () => {
            events.forEach(e => window.removeEventListener(e, onActivity));
        }

    }, [client])
};