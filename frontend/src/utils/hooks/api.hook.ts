import { AxiosError } from "axios";
import { useEffect, useState } from "react";

type ApiState<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
};

function useApi<T>(
    apiCall: () => Promise<T>,
    deps: unknown[] = [],
): ApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const result = await apiCall();
                if (!cancelled) setData(result);
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof AxiosError) {
                        setError(
                            err.response?.data?.message ?? "Unexpected error",
                        );
                    } else {
                        setError("Unexpected error");
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [...deps, apiCall]);

    return { data, isLoading, error };
}

export { useApi };
