/**
 * Example usage of HybridGridStorage3
 *
 * This demonstrates how to use the new version-tag based conflict resolution system
 */

import { User } from "firebase/auth";
import {
  ConflictResolutionChoice,
  ConflictResolutionPrompt,
  HybridGridStorage3,
  SyncState,
} from "../storage/hybridGridStorage3";
import { Cell, CellType } from "../types/cells";

export class ExampleUsage {
  private storage: HybridGridStorage3;

  constructor(user: User | null) {
    this.storage = new HybridGridStorage3(user);

    // Set up conflict resolution handler
    this.storage.setConflictPromptHandler(this.handleConflictPrompt.bind(this));
  }

  /**
   * Example conflict resolution handler
   * In a real app, this would show a UI dialog to the user
   */
  private handleConflictPrompt(prompt: ConflictResolutionPrompt): void {
    console.log(`Conflict detected: ${prompt.conflictMessage}`);
    console.log(
      `Local cells: ${prompt.localCellsCount}, Remote cells: ${prompt.remoteCellsCount}`
    );

    // In a real app, you would show a UI dialog here
    // For this example, we'll default to keeping local changes
    const choice = this.shouldKeepLocalChanges()
      ? ConflictResolutionChoice.KeepLocal
      : ConflictResolutionChoice.KeepRemote;

    prompt.onResolve(choice);
  }

  /**
   * Example logic for deciding whether to keep local changes
   * In a real app, this would be based on user input
   */
  private shouldKeepLocalChanges(): boolean {
    // You could implement more sophisticated logic here:
    // - Show a dialog asking the user
    // - Compare timestamps or other metadata
    // - Have a user preference setting

    return true; // Default to keeping local changes
  }

  /**
   * Example of saving cells - triggers aggressive sync
   */
  async saveExampleCells(): Promise<void> {
    const cells: Cell[] = [
      {
        id: 1,
        text: "Example Headline",
        x: 0,
        y: 0,
        type: CellType.Headline,
        size: { x: 2, y: 1 },
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        text: "Example Task List",
        x: 0,
        y: 1,
        type: CellType.Tasklist,
        size: { x: 2, y: 2 },
        updatedAt: new Date().toISOString(),
        tasks: [
          {
            id: 1,
            text: "Example task",
            completed: false,
            cost: 1,
          },
        ],
      },
    ];

    await this.storage.saveCells(cells);
    console.log("Cells saved with aggressive sync");
  }

  /**
   * Example of loading cells - handles first load scenarios
   */
  async loadCells(): Promise<Cell[]> {
    return await this.storage.loadCells();
  }

  /**
   * Example of monitoring sync status
   */
  monitorSyncStatus(): void {
    const status = this.storage.getSyncStatus();

    switch (status.state) {
      case SyncState.Synced:
        console.log("✅ Everything is synced");
        break;
      case SyncState.LocalChanges:
        console.log("📝 Local changes pending sync");
        break;
      case SyncState.RemoteChanges:
        console.log("☁️ Remote changes detected");
        break;
      case SyncState.Conflict:
        console.log("⚠️ Conflict requires resolution");
        break;
      case SyncState.PullingRemote:
        console.log("⬇️ Pulling changes from remote");
        break;
      case SyncState.FirstLoad:
        console.log("🔄 First load in progress");
        break;
    }

    console.log(`Last sync: ${status.lastSyncTime || "Never"}`);
    console.log(`Local version: ${status.localVersionTag || "None"}`);
    console.log(`Remote version: ${status.remoteVersionTag || "None"}`);
  }

  /**
   * Example of handling user login
   */
  async handleUserLogin(user: User): Promise<void> {
    await this.storage.setUser(user);
    console.log("User login handled - first load scenarios processed");
  }

  /**
   * Cleanup when done
   */
  destroy(): void {
    this.storage.destroy();
  }
}
