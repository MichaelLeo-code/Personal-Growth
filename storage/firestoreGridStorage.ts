import deepEqual from "fast-deep-equal";
import { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "../firebase";
import { Cell } from "../types/cells";
import { gridStorage } from "./gridStorageRenamed";

export class FirestoreGridStorage implements gridStorage {
  private readonly collectionName: string;
  private user: User;

  constructor(user: User, collectionName: string = "cells") {
    this.collectionName = collectionName;
    this.user = user;
  }

  setUser(user: User): void {
    this.user = user;
  }

  private getUserCollection() {
    return collection(FIREBASE_DB, "users", this.user.uid, this.collectionName);
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      const userCollection = this.getUserCollection();

      const existingDocs = await getDocs(userCollection);
      const newCellIds = new Set(cells.map((cell) => cell.id.toString()));

      const cellsToDelete = existingDocs.docs.filter(
        (doc) => !newCellIds.has(doc.id)
      );

      const cellsToSave = cells.filter((cell) => {
        const cellId = cell.id.toString();
        const existingDoc = existingDocs.docs.find((doc) => doc.id === cellId);

        if (!existingDoc) {
          return true;
        }

        const existingData = existingDoc.data();

        return !deepEqual(JSON.stringify(existingData), JSON.stringify(cell));
      });

      const deletePromises = cellsToDelete.map((docToDelete) =>
        deleteDoc(docToDelete.ref)
      );

      const savePromises = cellsToSave.map((cell) => {
        const docRef = doc(userCollection, cell.id.toString());

        return setDoc(docRef, cell);
      });

      await Promise.all([...deletePromises, ...savePromises]);

      console.log(
        `Firestore sync: ${cellsToDelete.length} deleted, ${cellsToSave.length} updated/created`
      );
    } catch (error) {
      console.error("Failed to save cells to Firestore:", error);
      throw new Error("Failed to save cells to Firestore");
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      const userCollection = this.getUserCollection();
      const q = query(userCollection, orderBy("id"));
      const querySnapshot = await getDocs(q);

      const cells: Cell[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cells.push(data as Cell);
      });

      return cells;
    } catch (error) {
      console.error("Failed to load cells from Firestore:", error);
      throw new Error("Failed to load cells from Firestore");
    }
  }

  async clearCells(): Promise<void> {
    try {
      const userCollection = this.getUserCollection();
      const querySnapshot = await getDocs(userCollection);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clear cells from Firestore:", error);
      throw new Error("Failed to clear cells from Firestore");
    }
  }
}
