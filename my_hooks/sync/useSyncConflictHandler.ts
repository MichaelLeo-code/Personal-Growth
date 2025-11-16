 import { cellService, storageService } from "@/service";
import { ConflictResolutionChoice, ConflictResolutionPrompt } from "@/storage/hybridGridStorage3";
import { useEffect, useState } from "react";

export const useSyncConflictHandler = () => {
  const [conflictPrompt, setConflictPrompt] = useState<ConflictResolutionPrompt | null>(null);

  useEffect(() => {
    storageService.setConflictPromptHandler((prompt) => {
      console.log("Conflict detected, showing dialog");
      setConflictPrompt(prompt);
    });

    return () => {
      storageService.setConflictPromptHandler(() => {
        console.log("Conflict detected but no handler set (component unmounted)");
      });
    };
  }, []);

  const handleResolve = async (choice: ConflictResolutionChoice) => {
    if (!conflictPrompt) return;

    // Call the original resolve function
    await conflictPrompt.onResolve(choice);

    if (choice === ConflictResolutionChoice.KeepRemote) {
      console.log("Remote version chosen, reloading cells...");
      await cellService.reloadCells();
    }

    setConflictPrompt(null);
  };

  const dismissDialog = () => {
    setConflictPrompt(null);
  };

  return {
    conflictPrompt,
    handleResolve,
    dismissDialog,
  };
};
