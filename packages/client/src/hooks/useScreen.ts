import { useState, useEffect, useCallback, useContext } from "react";
import { schemaCache } from "../cache/schemaCache";
import { SchemaVersionContext } from "../App";

interface SDUIScreenResponse {
  screen: {
    id: string;
    name: string;
    schemaVersion: number;
    layout: Record<string, unknown>;
    children: unknown[];
    data?: Record<string, unknown>;
    meta?: Record<string, unknown>;
  };
  serverTimestamp: string;
}

interface UseScreenResult {
  screen: SDUIScreenResponse["screen"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const SESSION_ID = "user-1";

export function useScreen(
  screenId: string,
  params?: Record<string, string>
): UseScreenResult {
  const { version } = useContext(SchemaVersionContext);
  const [screen, setScreen] = useState<SDUIScreenResponse["screen"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = params
    ? "?" + new URLSearchParams(params).toString()
    : "";

  const cacheKey = `screen:${version}:${screenId}${queryString}`;

  const fetchScreen = useCallback(async () => {
    // Show cached data instantly while fetching fresh data
    const cached = schemaCache.get<SDUIScreenResponse>(cacheKey);
    if (cached) {
      setScreen(cached.data.screen);
      setLoading(false);
    }

    // Always fetch fresh from server
    try {
      const response = await fetch(`/api/screens/${screenId}${queryString}`, {
        headers: {
          "X-Session-Id": SESSION_ID,
          "X-Schema-Version": version,
          "X-SDUI-Capabilities":
            "text@1,button@1,card@1,grid@1,image@1,container@1,input@1,list@1,divider@1,spacer@1,badge@1",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch screen: ${response.statusText}`);
      }

      const data: SDUIScreenResponse = await response.json();
      schemaCache.set(cacheKey, data);
      setScreen(data.screen);
      setError(null);
    } catch (err) {
      // Only show error if we have no cached fallback
      if (!cached) {
        setError(err instanceof Error ? err.message : "Failed to load screen");
      }
    } finally {
      setLoading(false);
    }
  }, [screenId, queryString, cacheKey, version]);

  useEffect(() => {
    fetchScreen();
  }, [fetchScreen]);

  return { screen, loading, error, refetch: fetchScreen };
}
