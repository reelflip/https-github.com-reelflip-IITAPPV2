
/**
 * IITGEEPrep Production API Bridge v17.0
 * STRICT LIVE-ONLY MODE - NO MOCKING
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
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(options.headers || {})
                }
            });

            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                // This is a critical point: The server returned HTML/Text instead of JSON (likely a 404 or 500)
                throw {
                    status: res.status,
                    statusText: res.statusText,
                    raw: text,
                    isHtml: text.includes('<!DOCTYPE html>') || text.includes('<?php'),
                    message: `Server returned non-JSON response (HTTP ${res.status})`
                };
            }

            if (!res.ok) {
                throw {
                    status: res.status,
                    message: json.message || `Server Error ${res.status}`,
                    details: json.details || null,
                    raw: json
                };
            }

            return json;
        } catch (error: any) {
            // Propagate the real network error or the parsed server error
            throw error;
        }
    }
};
