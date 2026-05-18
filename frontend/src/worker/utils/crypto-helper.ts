

export async function deriveKeys(
    email: string,
    password: string,
    iterations: number
): Promise<{ authToken: string, encryptionKey: CryptoKey}> {

    const encoder = new TextEncoder();

    // From password derive baseKey which is a CryptoKey object used for deriving masterKey 
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    )

    // Derive masterKey bits 
    const masterKeyBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: encoder.encode(email.toLocaleLowerCase().trim()),
            iterations,
            hash: "SHA-256",
        },
        baseKey,
        256
    );

    // Import masterKey for HKDF which will be used to derive Encryption key
    const masterKeyForHkdf = await crypto.subtle.importKey(
        "raw",
        masterKeyBits,
        "HKDF",
        false,
        ["deriveKey"]
    );

    // Derive encryption Key using masterKeyForHkdf 
    const derivedEncryptionKey = await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            salt: new Uint8Array(32),
            hash: "SHA-256",
            info: encoder.encode("aegis-pass-encryption-key-v1"),
        },
        masterKeyForHkdf,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    // Import masterKey for auth_token(string which will be sent to server as password)
    const masterKeyForAuthToken = await crypto.subtle.importKey(
        "raw",
        masterKeyBits,
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    // Derive authTokenBits using masterKeyForAuthToken 
    const authTokenBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: encoder.encode(password),
            iterations: 1,
            hash: "SHA-256",
        },
        masterKeyForAuthToken,
        256
    );


    const authToken = btoa(
        String.fromCharCode(...new Uint8Array(authTokenBits))
    );

    return { authToken, encryptionKey: derivedEncryptionKey };
}   



import { SecureStorage } from "./secure-storage";


export async function encrypt(plaintext: string): Promise<{ ciphertext: string, iv: string}> {
    const key = SecureStorage.getEncryptionKey()
    if (!key) throw new Error("No encryption Key in memory. Please Log in again.")

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv},
        key,
        encoded,
    );

    return {
        ciphertext: bufferToBase64(ciphertextBuffer),
        iv: bufferToBase64(iv),
    }
}


export async function decrypt(ciphertext: string, iv: string): Promise<string> {
    const key = SecureStorage.getEncryptionKey();
    if (!key) throw new Error("No encryption Key in memory. Please Log in again.")

    const ivBuffer = base64ToBuffer(iv);
    if (ivBuffer.length !== 12) throw new Error("Invalid IV length for AES-GCM.")

    const plaintextBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuffer },
        key,
        base64ToBuffer(ciphertext),
    )

    return new TextDecoder().decode(plaintextBuffer)
}


function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
}

function base64ToBuffer(base64: string) : Uint8Array<ArrayBuffer>{
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
}
