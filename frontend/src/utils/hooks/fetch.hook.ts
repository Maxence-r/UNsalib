import { useState, useEffect } from "react";

import type { Api } from "../types/api.type";

function useFetch(url: string) {
    const [data, setData] = useState<unknown | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                setData((await response.json() as Api).data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (!url) return;

        setLoading(true);
        fetchData();
    }, [url]);

    return { isLoading, data, error };
}

export { useFetch };
