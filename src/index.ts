import { Page } from "@playwright/test";

export interface IndexedDBOptions {
  dbName: string;
  storeName: string;
  version?: number;
}

export class PlaywrightIndexedDB {
  private page: Page;
  private dbName: string;
  private storeName: string;
  private version: number;

  constructor(page: Page, options: IndexedDBOptions) {
    this.page = page;
    this.dbName = options.dbName;
    this.storeName = options.storeName;
    this.version = options.version || 1;
  }

  async getAllItems<T>(): Promise<T[]> {
    return this.page.evaluate(
      ({ dbName, storeName }) => {
        return new Promise<any[]>((resolve, reject) => {
          const request = indexedDB.open(dbName);
          request.onerror = () => reject(new Error("Failed to open database"));
          request.onsuccess = () => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, "readonly");
              const store = transaction.objectStore(storeName);
              const getRequest = store.getAll();
              getRequest.onsuccess = () => {
                db.close();
                resolve(getRequest.result);
              };
              getRequest.onerror = () => reject(getRequest.error);
            } catch (e) {
              db.close();
              reject(e);
            }
          };
        });
      },
      { dbName: this.dbName, storeName: this.storeName }
    );
  }

  async getItem<T>(key: IDBValidKey): Promise<T | null> {
    return this.page.evaluate(
      (params: any) => {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(params.dbName);
          request.onerror = () => reject(new Error("Failed to open database"));
          request.onsuccess = () => {
            const db = request.result;
            try {
              const transaction = db.transaction(params.storeName, "readonly");
              const store = transaction.objectStore(params.storeName);
              const getRequest = store.get(params.key);
              getRequest.onsuccess = () => {
                db.close();
                resolve(getRequest.result || null);
              };
              getRequest.onerror = () => reject(getRequest.error);
            } catch (e) {
              db.close();
              reject(e);
            }
          };
        });
      },
      { dbName: this.dbName, storeName: this.storeName, key }
    ) as Promise<T | null>;
  }

  async putItem<T>(item: T, key?: IDBValidKey): Promise<void> {
    await this.page.evaluate(
      ({ dbName, storeName, item, key }) => {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(dbName);
          request.onerror = () => reject(new Error("Failed to open database"));
          request.onsuccess = () => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, "readwrite");
              const store = transaction.objectStore(storeName);
              const putRequest =
                key !== undefined ? store.put(item, key) : store.put(item);
              putRequest.onsuccess = () => {
                db.close();
                resolve();
              };
              putRequest.onerror = () => reject(putRequest.error);
            } catch (e) {
              db.close();
              reject(e);
            }
          };
        });
      },
      { dbName: this.dbName, storeName: this.storeName, item, key }
    );
  }

  async deleteItem(key: IDBValidKey): Promise<void> {
    await this.page.evaluate(
      ({ dbName, storeName, key }) => {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(dbName);
          request.onerror = () => reject(new Error("Failed to open database"));
          request.onsuccess = () => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, "readwrite");
              const store = transaction.objectStore(storeName);
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => {
                db.close();
                resolve();
              };
              deleteRequest.onerror = () => reject(deleteRequest.error);
            } catch (e) {
              db.close();
              reject(e);
            }
          };
        });
      },
      { dbName: this.dbName, storeName: this.storeName, key }
    );
  }

  async clear(): Promise<void> {
    await this.page.evaluate(
      ({ dbName, storeName }) => {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(dbName);
          request.onerror = () => reject(new Error("Failed to open database"));
          request.onsuccess = () => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, "readwrite");
              const store = transaction.objectStore(storeName);
              const clearRequest = store.clear();
              clearRequest.onsuccess = () => {
                db.close();
                resolve();
              };
              clearRequest.onerror = () => reject(clearRequest.error);
            } catch (e) {
              db.close();
              reject(e);
            }
          };
        });
      },
      { dbName: this.dbName, storeName: this.storeName }
    );
  }
}
