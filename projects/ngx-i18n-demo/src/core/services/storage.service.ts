import { Location, PathLocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { IndexDBValue, StorageData } from '../types/indexedDB.type';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private location: Location,
    private pathLocationStrategy: PathLocationStrategy,
    private router: Router,
  ) { }

  /** In-memory mirror of the structured data persisted via IndexedDB. */
  private _storage: StorageData = {};
  /** Active IndexedDB connection used for all storage transactions. */
  private db?: IDBDatabase;
  /** IndexedDB database name scoped to the current base href. */
  private dbName?: string;
  /** Name of the object store that backs the persistence layer. */
  private objectStoreName = 'Database';

  /** Initializes the IndexedDB instance and registers lifecycle listeners. */
  initIndexDB(): Promise<void> {
    return new Promise((resolve) => {
      this.openIndexDB().then(() => {
        this.setupUnloadListener();
        resolve();
      });
    });
  }

  /**
   * Writes a value to both the in-memory cache and IndexedDB, refreshing sessionStorage as well.
   * Expired entries are purged before the new value is persisted.
   */
  setItem<T extends keyof StorageData>(key: T, value: StorageData[T]): Observable<void> {
    this._storage[key] = value;
    const subject = new Subject<void>();
    this.handleExpiredKeys(this._storage)
      .then(() => {
        this.storeInIndexDB(key, value)
          .then(() => {
            sessionStorage.setItem(this.dbName!, JSON.stringify(this._storage));
            subject.next();
            subject.complete();
          })
          .catch((error) => subject.error(error));
      })
      .catch((error) => subject.error(error));
    return subject;
  }

  /**
   * Retrieves a value by key from IndexedDB, first removing any expired entries.
   * Emits `null` when the key is not present or an error occurs.
   */
  getItem<T extends keyof StorageData>(key: T): Observable<StorageData[T] | null> {
    const subject = new Subject<StorageData[T] | null>();
    (async () => {
      if (!key) {
        subject.error(new Error('Key is required'));
      }
      try {
        await this.handleExpiredKeys(this._storage);
        const request = this.createTransaction('readonly').objectStore(this.objectStoreName)?.get(key);
        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          if (result && result.value) {
            subject.next(result.value as StorageData[T]);
            subject.complete();
          } else {
            subject.next(null);
            subject.complete();
          }
        };
        request.onerror = (event) => {
          throw new Error(`Key "${key}" does not exist in storage.`);
        };
      } catch (error) {
        subject.next(null);
        subject.complete();
      }
    })();

    return subject;
  }

  /**
   * Deletes a specific key from IndexedDB and the in-memory cache,
   * ensuring stale keys are purged beforehand.
   */
  removeItem<T extends keyof StorageData>(key: T): Observable<void> {
    const subject = new Subject<void>();
    this.handleExpiredKeys(this._storage).then(() => {
      const request = this.createTransaction('readonly').objectStore(this.objectStoreName).delete(key);
      request.onsuccess = () => {
        delete this._storage[key];
        sessionStorage.setItem(this.dbName!, JSON.stringify(this._storage));
        subject.next();
        subject.complete();
      };
      request.onerror = (event) => subject.error((event.target as IDBRequest).error);
    });
    return subject;
  }

  /** Clears every entry from IndexedDB, the in-memory cache, and sessionStorage. */
  clear(): Observable<void> {
    const subject = new Subject<void>();
    const request = this.createTransaction('readwrite').objectStore(this.objectStoreName).clear();
    request.onsuccess = (event) => {
      this._storage = {};
      sessionStorage.removeItem(this.dbName!);
      subject.next();
      subject.complete();
    };
    request.onerror = (event) => subject.error((event.target as IDBRequest).error);
    return subject;
  }

  /** Opens the IndexedDB database, creating the backing object store on first run. */
  openIndexDB(): Promise<void> {
    console.log('Initializing IndexedDB');
    return new Promise((resolve, reject) => {
      this.dbName = this.pathLocationStrategy.getBaseHref();
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          db.createObjectStore(this.objectStoreName, { keyPath: 'key' });
          console.log('Initializing IndexedDB successfully');
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = (event) => {
        console.error('IndexedDB initialization failed:', event);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  /** Logs current storage usage and quota information to the console. */
  async logStorageInfo(): Promise<void> {
    if ('storage' in navigator && 'estimator' in navigator.storage) {
      const { usage, quota, usageDetails } = await navigator.storage.estimate() as StorageEstimate & { usageDetails: Record<string, number> };
      console.log(`Using (bytes):`, usage ?? 0);
      console.log(`Quota (bytes):`, quota ?? 0);
      console.log('Details:', usageDetails);
    }
  }

  /** Creates a transaction against the object store, asserting that IndexedDB is ready. */
  private createTransaction(mode: 'readonly' | 'readwrite'): IDBTransaction {
    if (!this.db) {
      throw new Error('IndexedDB is not initialized');
    }
    return this.db!.transaction(this.objectStoreName, mode);
  }

  /** Removes any entries whose `expires` timestamp is in the past. */
  private handleExpiredKeys(storage: StorageData): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.createTransaction('readwrite');
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.getAllKeys();
      request.onsuccess = () => {
        const keys = request.result as string[];
        const deletePromises = keys.map((key) =>
          this.checkAndDeleteExpiredItem(objectStore, storage[key as keyof StorageData], key),
        );
        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };
      request.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  /** Deletes a record when its stored expiration timestamp is in the past. */
  private checkAndDeleteExpiredItem(
    objectStore: IDBObjectStore,
    item: StorageData[keyof StorageData],
    key: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (item?.expires && item.expires < Date.now()) {
        const deleteRequest = objectStore.delete(key);
        deleteRequest.onerror = (event) => reject((event.target as IDBRequest).error);
        deleteRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    });
  }

  /** Persists the provided key-value pair to the IndexedDB object store. */
  private storeInIndexDB<T extends keyof StorageData>(key: T, value: StorageData[T]): Promise<void> {
    return new Promise((resolve, reject) => {
      const valueForIndexDB: IndexDBValue<StorageData[T]> = { key, value };
      const request = this.createTransaction('readwrite').objectStore(this.objectStoreName).put(valueForIndexDB);
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  /**
   * Normalizes the browser history state on unload to avoid persisting stale query parameters.
   * This ensures the application boots with a clean URL when reloaded.
   */
  private setupUnloadListener(): void {
    window.onbeforeunload = () => {
      const state = this.location.getState();
      const pathWithQueryParams = this.location.path();
      const queryParams = pathWithQueryParams.split('?')[1] || '';
      const path = pathWithQueryParams.split('?')[0];
      this.location.replaceState(path, queryParams, state);
    };
  }
}
