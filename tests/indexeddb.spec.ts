import { test, expect } from "@playwright/test";
import { PlaywrightIndexedDB } from "../src";

test.describe("PlaywrightIndexedDB", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${process.cwd()}/tests/test.html`);
  });

  test("should perform CRUD operations on IndexedDB", async ({ page }) => {
    // Initialize database first
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase("testDB");
        deleteReq.onsuccess = () => {
          const request = indexedDB.open("testDB", 1);
          request.onerror = () => reject(request.error);
          request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore("testStore", { keyPath: "id" });
          };
          request.onsuccess = () => {
            request.result.close();
            resolve();
          };
        };
      });
    });

    const db = new PlaywrightIndexedDB(page, {
      dbName: "testDB",
      storeName: "testStore",
      version: 1,
    });

    // Test putting an item
    const testItem = { id: 1, name: "Test Item" };
    await db.putItem(testItem);

    // Test getting an item
    const retrievedItem = await db.getItem(1);
    expect(retrievedItem).toEqual(testItem);

    // Test getting all items
    const allItems = await db.getAllItems();
    expect(allItems).toHaveLength(1);
    expect(allItems[0]).toEqual(testItem);

    // Test deleting an item
    await db.deleteItem(1);
    const deletedItem = await db.getItem(1);
    expect(deletedItem).toBeNull();

    // Test clearing the store
    await db.putItem({ id: 2, name: "Another Item" });
    await db.clear();
    const clearedItems = await db.getAllItems();
    expect(clearedItems).toHaveLength(0);
  });

  test("should handle errors gracefully", async ({ page }) => {
    // Initialize DB with a specific store
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase("testDB");
        request.onsuccess = () => {
          const openRequest = indexedDB.open("testDB", 1);
          openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore("existingStore", { keyPath: "id" });
          };
          openRequest.onsuccess = () => {
            openRequest.result.close();
            resolve();
          };
        };
      });
    });

    const db = new PlaywrightIndexedDB(page, {
      dbName: "testDB",
      storeName: "nonexistentStore",
      version: 1,
    });

    const error = await db.getAllItems().catch((e) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("not found");
  });
});
