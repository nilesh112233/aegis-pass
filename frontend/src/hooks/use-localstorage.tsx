import { useState, useEffect } from "react";


function useLocalStorage(key: string, defaultValue: boolean): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {

    const [value, setValue] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.log("Error reading from localStorage", key, error);
            return defaultValue;
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.log("Error writing localStorage key", key, error);
        }
    }, [key, value]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === key) {
                setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [key, defaultValue]);

    return [value, setValue];
}

export default useLocalStorage;