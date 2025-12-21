
/**
 * IITGEEPrep Strict Server Sync Engine v18.0
 * MODE: EXCLUSIVELY SERVER-SIDE (NO LOCAL FALLBACK)
 */

export const apiService = {
    async request(endpoint: string, options: RequestInit = {}) {
        const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(options.headers || {})
                }
            });

            // If the server returns 404, the API folder or file is missing
            if (res.status === 404) {
                throw new Error(`API_NOT_FOUND: The endpoint ${endpoint} was not found on the server.`);
            }

            const text = await res.text();
            let json;
            
            try {
                json = JSON.parse(text);
            } catch (e) {
                // If it's not JSON, the server likely returned an HTML error page (like a 404 or 500)
                throw new Error(`NON_JSON_RESPONSE: Server returned a non-JSON response (HTTP ${res.status}). Ensure backend files are uploaded to the /api/ directory.`);
            }

            if (!res.ok) {
                throw new Error(json.message || `SERVER_ERROR: ${res.status} ${res.statusText}`);
            }

            return json;
        } catch (error: any) {
            // Re-throw to be handled by the UI (App.tsx / SyncStatusBadge)
            console.error(`Strict Sync Error [${endpoint}]:`, error.message || error);
            throw error;
        }
    }
};
