import { ConflictResolutionDialog } from "@/my_components/sync";
import { useConflictResolver } from "@/my_hooks";
import { storageService } from "@/service";
import React, { useEffect } from "react";

interface ConflictResolverProviderProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides conflict resolution UI for the hybrid storage.
 * This should wrap the main app to handle sync conflicts automatically.
 */
export const ConflictResolverProvider: React.FC<ConflictResolverProviderProps> = ({
  children,
}) => {
  const { dialogState, showConflictDialog, hideConflictDialog } = useConflictResolver();

  useEffect(() => {
    // Set up the conflict prompt handler with the storage service
    storageService.setConflictPromptHandler((prompt) => {
      console.log("Conflict detected, showing dialog");
      showConflictDialog(prompt);
    });

    return () => {
      // Clean up: set handler to null when component unmounts
      storageService.setConflictPromptHandler(() => {
        console.log("Conflict detected but no handler set (component unmounted)");
      });
    };
  }, [showConflictDialog]);

  return (
    <>
      {children}
      {dialogState.isVisible && dialogState.prompt && (
        <ConflictResolutionDialog
          localCellsCount={dialogState.prompt.localCellsCount}
          remoteCellsCount={dialogState.prompt.remoteCellsCount}
          conflictMessage={dialogState.prompt.conflictMessage}
          onResolve={dialogState.prompt.onResolve}
          onDismiss={hideConflictDialog}
        />
      )}
    </>
  );
};
