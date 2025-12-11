import { useState, useEffect } from "react";

import type { Api, ApiSuccess, ApiError } from "../types/api.type";

function useFetch(url: string) {
    const [data, setData] = useState<unknown>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiResponse = (await (await fetch(url)).json()) as Api;
                if (!apiResponse.success) {
                    throw new Error((apiResponse as ApiError).message);
                }
                setData((apiResponse as ApiSuccess).data);
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
