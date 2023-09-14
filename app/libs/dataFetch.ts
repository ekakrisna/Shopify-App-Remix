import { useState, useEffect } from 'react';

type FetchState<T> =
    | { status: 'idle' }
    | { status: 'loading'; retrying: boolean }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error | null };

type FetchFunction<T> = (() => Promise<T>) | Promise<T>;

interface FetchOptions {
    retry?: number;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useCustomFetch<T>(
    key: [string, any] | string, // Key as an array [keyName, keyVariable]
    fetchFunction: FetchFunction<T>,
    options: FetchOptions = {}
) {
    const {
        retry = 0,
        onSuccess: externalOnSuccess,
        onError: externalOnError,
    } = options;

    const [fetchState, setFetchState] = useState<FetchState<T>>({ status: 'idle' });
    const [retryCount, setRetryCount] = useState(0);

    const [keyName, keyVariable] = key;

    const fetchData = async () => {
        setFetchState({ status: 'loading', retrying: false, error: null });

        try {
            const data = await (typeof fetchFunction === 'function' ? fetchFunction() : fetchFunction);
            setFetchState({ status: 'success', data });
            externalOnSuccess?.(data);
        } catch (error) {
            setFetchState({ status: 'error', error });
            externalOnError?.(error);
            if (retryCount < retry) {
                setFetchState({ status: 'loading', retrying: true, error: null });
                setTimeout(() => {
                    setRetryCount(retryCount + 1);
                    fetchData();
                }, 1000); // Retry after a delay (adjust as needed)
            }
        }
    };

    const refetch = () => fetchData();

    useEffect(() => {
        if (keyName && keyVariable) {
            // Watch for changes in keyName and keyVariable and trigger a refetch when they change
            fetchData();
        }
    }, [keyName, keyVariable]);

    const useFetchState = () => ({
        isLoading: fetchState.status === 'loading' && !fetchState.retrying,
        isError: fetchState.status === 'error',
        isIdle: fetchState.status === 'idle',
        isSuccess: fetchState.status === 'success',
        error: fetchState.error,
        data: fetchState.status === 'success' ? fetchState.data : null,
        refetch, // Include the refetch function
    });

    return useFetchState;
}