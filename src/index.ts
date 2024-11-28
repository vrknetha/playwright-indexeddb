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
          request.onerror = (): void =>
            reject(new Error("Failed to open database"));
          request.onsuccess = (): void => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, "readonly");
              const store = transaction.objectStore(storeName);
              const getRequest = store.getAll();
              getRequest.onsuccess = (): void => {
                db.close();
                resolve(getRequest.result);
              };
              getRequest.onerror = (): void => reject(getRequest.error);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (params: any): any {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(params.dbName);
          request.onerror = (): void =>
            reject(new Error("Failed to open database"));
          request.onsuccess = (): void => {
            const db = request.result;
            try {
              const transaction = db.transaction(params.storeName, "readonly");
              const store = transaction.objectStore(params.storeName);
              const getRequest = store.get(params.key);
              getRequest.onsuccess = (): void => {
                db.close();
                resolve(getRequest.result || null);
              };
              getRequest.onerror = (): void => reject(getRequest.error);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (params: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(params.dbName);
          request.onerror = (): void =>
            reject(new Error("Failed to open database"));
          request.onsuccess = (event: Event): void => {
            const db = (event.target as IDBOpenDBRequest).result;
            try {
              const transaction = db.transaction(params.storeName, "readwrite");
              const store = transaction.objectStore(params.storeName);
              const putRequest =
                params.key !== undefined
                  ? store.put(params.item, params.key)
                  : store.put(params.item);
              putRequest.onsuccess = (): void => {
                db.close();
                resolve();
              };
              putRequest.onerror = (): void => reject(putRequest.error);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (params: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(params.dbName);
          request.onerror = (): void =>
            reject(new Error("Failed to open database"));
          request.onsuccess = (): void => {
            const db = request.result;
            try {
              const transaction = db.transaction(params.storeName, "readwrite");
              const store = transaction.objectStore(params.storeName);
              const deleteRequest = store.delete(params.key);
              deleteRequest.onsuccess = (): void => {
                db.close();
                resolve();
              };
              deleteRequest.onerror = (): void => reject(deleteRequest.error);
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
          request.onerror = (): void =>
            reject(new Error("Failed to open database"));
          request.onsuccess = (): void => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, "readwrite");
              const store = transaction.objectStore(storeName);
              const clearRequest = store.clear();
              clearRequest.onsuccess = (): void => {
                db.close();
                resolve();
              };
              clearRequest.onerror = (): void => reject(clearRequest.error);
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
