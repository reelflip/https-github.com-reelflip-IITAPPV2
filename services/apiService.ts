
/**
 * IITGEEPrep Strict Server Sync Engine v19.0
 * MODE: PRODUCTION (NO LOCAL FALLBACK)
 */

export const apiService = {
    async request(endpoint: string, options: RequestInit = {}) {
        const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(options.headers || {})
            }
        });

        if (res.status === 404) {
            throw new Error(`API_NOT_FOUND: ${endpoint}`);
        }

        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            throw new Error(`SERVER_ERROR: Invalid response format from ${endpoint}`);
        }

        if (!res.ok) {
            throw new Error(json.message || `API_ERROR: ${res.status}`);
        }

        return json;
    }
};
