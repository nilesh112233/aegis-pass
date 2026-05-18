import { SecureStorage } from "./secure-storage";


type HeaderAddOns = Record<string, string>;

export async function fetchAuthApi(
    path: string,
    body?: object,
    headerAddOns?: HeaderAddOns,
    method = "POST"
): Promise<any> {
    let res: Response;
    try {
        res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${path}`, {
            method,
            headers: { "Content-Type": "application/json", ...(headerAddOns ?? {})},
            credentials: "include",
            body: JSON.stringify(body),
        });
    } catch (error) {
        throw new Error("Something went wrong. Unable to make fetch request.")
    }

    const data = await res.json()

    if (!res.ok) {
    // surface the first django error message
    const firstError =
      data?.non_field_errors?.[0] ||
      data?.email?.[0] ||
      data?.auth_token?.[0] ||
      data?.message ||
      "Something went wrong at fetchAuthApi.";
    console.log(firstError)
    throw new Error(firstError);
  }
    
    return data;
}


type allowedMethods = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export async function fetchVaultApi(
    path: string,
    method: allowedMethods,
    body?: object,
): Promise<any> {

    let res: Response;
    try {
        const token = SecureStorage.getAccessToken();

        res = await fetch(`${import.meta.env.VITE_API_URL}/api/vault/${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}`})
            },
            body: JSON.stringify(body),
        });
    } catch (error) {
        throw new Error("Something went wrong. Unable to reach vault API.")
    }

    const text = await res.text();

    if (!text) return null;

    // try {
    //     return JSON.parse(text);
    // } catch {
    //     throw new Error("Invalid JSON response from server");
    // }

    let data: any;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON response from server");
    }

    if (!res.ok) {
        const message =
            data?.non_field_errors?.[0] ||
            data?.message ||
            "Something went wrong.";
        throw new Error(message);
    }

    return data;

    // const data = await res.json();
    // return data;
}