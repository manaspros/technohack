import { useState, useEffect, useCallback } from "react";
import chatApi from "../../src/services/api";

interface FeatureState {
  rag: boolean;
  webSearch: boolean;
}

interface FeatureSyncProps {
  sessionId: string | null;
  onError?: (message: string) => void;
}

interface FeatureSyncResult {
  features: FeatureState;
  pendingToggles: { rag: boolean; webSearch: boolean };
  toggleFeature: (
    feature: "rag" | "webSearch",
    enabled: boolean
  ) => Promise<boolean>;
  syncing: boolean;
  syncError: string | null;
  lastUsedFeature: "rag" | "webSearch" | null;
}

export function useFeatureSync({
  sessionId,
  onError,
}: FeatureSyncProps): FeatureSyncResult {
  const [features, setFeatures] = useState<FeatureState>({
    rag: true, // Default to enabled
    webSearch: false, // Default to disabled
  });

  const [pendingToggles, setPendingToggles] = useState<{
    rag: boolean;
    webSearch: boolean;
  }>({
    rag: false,
    webSearch: false,
  });

  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastUsedFeature, setLastUsedFeature] = useState<
    "rag" | "webSearch" | null
  >(null);

  // Fetch initial feature state from backend when session is created
  useEffect(() => {
    if (!sessionId) return;

    const fetchFeatureState = async () => {
      try {
        setSyncing(true);
        setSyncError(null);

        const sessionInfo = await chatApi.getSession(sessionId);

        setFeatures({
          rag: sessionInfo.rag_enabled,
          webSearch: sessionInfo.web_search_enabled,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch feature states";
        setSyncError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setSyncing(false);
      }
    };

    fetchFeatureState();
  }, [sessionId, onError]);

  // Toggle feature in UI and sync with backend
  const toggleFeature = useCallback(
    async (
      feature: "rag" | "webSearch",
      enabled: boolean
    ): Promise<boolean> => {
      if (!sessionId) {
        if (onError)
          onError(
            "No active session. Send a message first to initialize a session."
          );
        return false;
      }

      // Update UI immediately for responsive feel
      setFeatures((prev) => ({
        ...prev,
        [feature]: enabled,
      }));

      // Set this feature as pending toggle
      setPendingToggles((prev) => ({
        ...prev,
        [feature]: true,
      }));

      try {
        // API feature name mapping
        const apiFeature = feature === "rag" ? "rag" : "websearch";

        // Call API to update backend state
        const result = await chatApi.toggleFeature({
          session_id: sessionId,
          feature: apiFeature,
          enabled,
        });

        if (!result.success) {
          // If API call was not successful, revert UI state
          setFeatures((prev) => ({
            ...prev,
            [feature]: !enabled,
          }));

          if (onError) onError(result.message || `Failed to toggle ${feature}`);
          return false;
        }

        // Update last used feature for visual indicators
        setLastUsedFeature(feature);

        return true;
      } catch (error) {
        // On error, revert UI state
        setFeatures((prev) => ({
          ...prev,
          [feature]: !enabled,
        }));

        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to toggle ${feature}`;

        setSyncError(errorMessage);
        if (onError) onError(errorMessage);
        return false;
      } finally {
        // Clear pending state
        setPendingToggles((prev) => ({
          ...prev,
          [feature]: false,
        }));
      }
    },
    [sessionId, onError]
  );

  return {
    features,
    pendingToggles,
    toggleFeature,
    syncing,
    syncError,
    lastUsedFeature,
  };
}
