import { ConflictResolutionPrompt } from "@/storage/hybridGridStorage3";
import { useCallback, useState } from "react";

export interface ConflictDialogState {
  isVisible: boolean;
  prompt: ConflictResolutionPrompt | null;
}

export const useConflictResolver = () => {
  const [dialogState, setDialogState] = useState<ConflictDialogState>({
    isVisible: false,
    prompt: null,
  });

  const showConflictDialog = useCallback((prompt: ConflictResolutionPrompt) => {
    setDialogState({
      isVisible: true,
      prompt,
    });
  }, []);

  const hideConflictDialog = useCallback(() => {
    setDialogState({
      isVisible: false,
      prompt: null,
    });
  }, []);

  return {
    dialogState,
    showConflictDialog,
    hideConflictDialog,
  };
};
