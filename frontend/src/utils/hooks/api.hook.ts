import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import type { ApiGet, ApiPost } from "../../api/axios";

type ApiState<T> = {
    data: T | null;
    isLoading: boolean;
    error: string | null;
};

function useApi<T>(
    apiCall: ApiGet<T> | ApiPost<T> | null,
    deps: unknown[] = [],
): ApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        async function fetchData(): Promise<void> {
            if (apiCall === null) return;
            try {
                setLoading(true);
                setError(null);

                const result = await apiCall.do(controller.signal);
                if (!cancelled) setData(result);
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof AxiosError) {
                        const message = err.response?.data?.message
                            ? `The server returned an error with this message: ${err.response.data.message}`
                            : "Unexpected error";
                        console.error(message);
                        setError(message);
                    } else {
                        setError("Unexpected error");
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();

        return (): void => {
            cancelled = true;
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, isLoading, error };
}

export { useApi };
