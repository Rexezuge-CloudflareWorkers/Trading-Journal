import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  const refresh: () => Promise<void> = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await fn());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    [...deps, tick],
  );

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const manualRefresh: () => Promise<void> = () => {
    setTick((value) => value + 1);
    return refresh();
  };

  return { data, loading, error, refresh: manualRefresh };
}
