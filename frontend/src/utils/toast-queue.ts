// src/utils/toast-queue.ts
import toast from "react-hot-toast";

type ToastType = "success" | "error" | "info";

export const toastQueue = {
    push(message: string, type: ToastType = "success", delay = 300) {
        setTimeout(() => {
            switch (type) {
                case "success": toast.success(message);  break;
                case "error":   toast.error(message);    break;
                case "info":    toast(message);          break;
            }
        }, delay);
    },
};