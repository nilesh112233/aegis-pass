import { jwtDecode } from "jwt-decode";
import { SecureStorage } from "./secure-storage";
import { fetchAuthApi } from "./api-helper";


// const INACTIVITY_TIME_LIMIT: number = SecureStorage.getSessionTimeoutLimit() * 60 * 1000;



class TokenManager {
    private static _instance: TokenManager | null = null;

    private isRefreshing: boolean = false;
    private refreshSubscribers: Array<(token: string) => void> = [];
    private refreshTimeout?: ReturnType<typeof setTimeout>;
    private inactivityTimout?: ReturnType<typeof setTimeout>;
    private lastActivityTime: number = Date.now();
    private isSessionActive: boolean = false;

    private constructor() {}

    static instance() {
        if (!TokenManager._instance) {
            TokenManager._instance = new TokenManager();
        }
        return TokenManager._instance;
    }

    async getAccessToken(): Promise<string | null> {
        const token = SecureStorage.getAccessToken();
        if (token && !this.isExpired(token)) {
            return token;
        }
        const refreshed = await this.refreshToken();
        
        if (!refreshed) {
            throw new Error("Session expired. Please log in again.")
        }
        return refreshed;
    }

    setAccessToken(token: string): void {
        SecureStorage.setAccessToken(token);
        this.isSessionActive = true;
        this.scheduleRefresh(token);
        // this.resetInactivityTimer();  // THIS MIGHT CAUSE ERROR
    }

    clearAccessToken(): void {
        SecureStorage.clearAccessToken();
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        if (this.inactivityTimout) clearTimeout(this.inactivityTimout);
        this.isSessionActive = false;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    private scheduleRefresh(token: string) {
        const decoded = jwtDecode<{ exp?: number }>(token);

        if (!decoded.exp) return;

        const expiryTime = decoded.exp * 1000;
        const refreshTime = expiryTime - Date.now() - 30_000;

        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);

        if(refreshTime <= 0) {
            this.refreshIfActive();
            return;
        }

        this.refreshTimeout = setTimeout(() => {
            this.refreshIfActive();
        }, refreshTime);
    }

    async refreshToken(): Promise<string | null> {
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;

        try {
            // Make an auth request to backend for refreshing the access token
            // const res = await authApiClient.post("auth/token/refresh");
            const res = await fetchAuthApi("refresh/")
            if (!res) {
                SecureStorage.clearAll();
                return null;
            }

            // Derive the new Access Token
            const newAccessToken: string = res.access;

            // Set the accessToken in authStore
            this.setAccessToken(newAccessToken);

            // Notify all the refresh accessToken subscriber
            this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
            // console.log("ACCESSTOKEN REFRESHED");
            return newAccessToken;
        } catch {
            SecureStorage.clearAll();
            return null;
        } finally {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
        }
    }

    recordActivity(): void {
        if (!this.isSessionActive) return;
        this.lastActivityTime = Date.now();
        this.resetInactivityTimer();
    }

    updateSessionTimeoutLimit(limit: number) {
        SecureStorage.setSessionTimeoutLimit(limit);

        // Recreate timer using new limit
        this.resetInactivityTimer();
    }

    private refreshIfActive(): void {
        const idleTime = Date.now() - this.lastActivityTime;

        if (idleTime >= SecureStorage.getSessionTimeoutLimit()*60*1000) {
            console.log(`LOGGING OUT DUE INACTIVITY. last acitivity was at ${new Date(this.lastActivityTime).toLocaleString('en-US')}`);
            this.forceLogout();
            return;
        }
        this.refreshToken();
    }

    private resetInactivityTimer(): void {
        if (!this.isSessionActive) return;
        if(this.inactivityTimout) clearTimeout(this.inactivityTimout);

        this.inactivityTimout = setTimeout(() => {
            this.forceLogout();
        }, SecureStorage.getSessionTimeoutLimit()*60*1000)
    }

    private forceLogout(): void {
        SecureStorage.clearAll();
        this.clearAccessToken();

        self.postMessage({ type: "FORCE_LOGOUT" });
    }

    private isExpired(token: string): boolean {
        const decoded = jwtDecode(token);
        return !!decoded.exp && decoded.exp * 1000 < Date.now();
    }
}

export const tokenManager = TokenManager.instance();
