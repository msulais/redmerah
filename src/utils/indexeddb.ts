import type { DatabaseNames } from "@/enums/storage"
import { arrayFill, arrayIncludes, arrayLength, arrayPush } from "./array"

type CreateObjectStoreParams<T> = {
	name: string
	keyPath: (keyof T) | string
	indexs: (keyof T)[]
}

type Listeners = {
	onSuccess?: (ev: Event, db: IDB) => unknown
	onBlocked?: (ev: IDBVersionChangeEvent, db: IDB) => unknown
	onError?: (ev: Event, db: IDB) => unknown
	onUpgrade?: (ev: IDBVersionChangeEvent, db: IDB) => unknown
}

export class IDB {
	readonly databaseName: DatabaseNames
	readonly version: number
	private _db: IDBDatabase | null = null
	private _isOpen: boolean = false

	constructor (databaseName: DatabaseNames, version: number = 1) {
		this.databaseName = databaseName
		this.version = version
	}

	async open(listeners?: Listeners): Promise<void> {
		return new Promise((ok, error) => {
			if (this.isOpen) {
				error("Database already open")
				return
			}

			const request = idbOpen(this.databaseName, this.version)
			request.onblocked = (ev) => {
				this._db = request.result
				listeners?.onBlocked?.(ev, this)
				error(ev)
			}
			request.onerror = (ev) => {
				this._db = request.result
				listeners?.onError?.(ev, this)
				error(ev)
			}
			request.onsuccess = (ev) => {
				this._isOpen = true
				this._db = request.result
				listeners?.onSuccess?.(ev, this)

				// handle different database version from other tab
				this._db!.onversionchange = () => {
					this.close()
					alert("Database version is outdated, please reload the page.")
				}

				ok()
			}
			request.onupgradeneeded = (ev) => {
				this._db = request.result
				listeners?.onUpgrade?.(ev, this)
				ok()
			}
		})
	}

	close(): void {
		if (this._db) idbClose(this._db)
		this._isOpen = false
	}

	/**
	 * Only called this inside `on_upgrade_needed()`
	 */
	createStore<T>({name, indexs, keyPath}: CreateObjectStoreParams<T>): IDBObjectStore | null {
		if (!this._db) return null
		keyPath = String(keyPath)

		let store = this.writeStore(name)
		if (idbStoreNames(this._db).contains(name)) {
			if (store == null) return store

			const $indexs = idbStoreIndexNames(store)
			for (const index of indexs) {
				const index_name = String(index)
				if ($indexs.contains(index_name)) continue
				idbStoreCreateIndex(store, index_name, index_name)
			}

			for (const index of $indexs) {
				if (arrayIncludes(indexs, index as keyof T) || index == keyPath) continue
				idbStoreDeleteIndex(store, index)
			}
		}
		else {
			store = idbCreateStore(this._db, name, {
				autoIncrement: true,
				keyPath: keyPath
			})

			for (const index of indexs) {
				const index_name = String(index)
				idbStoreCreateIndex(
					store,
					index_name,
					index_name,
					{unique: index_name == keyPath}
				)
			}
		}

		if (!arrayIncludes(indexs, keyPath as keyof T)) {
			idbStoreCreateIndex(store, keyPath, keyPath, {unique: true})
		}

		return store
	}

	async get<T>(store: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
		return new Promise<T | undefined>((ok, err) => {
			const request = idbStoreGet(store, query)
			request.onsuccess = () => ok(request.result as T)
			request.onerror = ev => err(ev)
		})
	}

	async getAll<T>(
		store: IDBObjectStore,
		query?: IDBValidKey | IDBKeyRange | null,
		count?: number
	): Promise<T[]> {
		return new Promise<T[]>((ok, err) => {
			const request = idbStoreGetAll(store, query, count)
			request.onsuccess = () => ok(request.result as T[])
			request.onerror = ev => err(ev)
		})
	}

	async put<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const request = idbStorePut(store, value, key)
			request.onsuccess = ev => ok(ev)
			request.onerror = ev => err(ev)
		})
	}

	async add<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const request = idbStoreAdd(store, value, key)
			request.onsuccess = (ev) => ok(ev)
			request.onerror = (ev) => err(ev)
		})
	}

	async delete(store: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const request = idbStoreDelete(store, query)
			request.onsuccess = (ev) => ok(ev)
			request.onerror = (ev) => err(ev)
		})
	}

	async cursor(
		store: IDBObjectStore,
		result: (cursor: IDBCursorWithValue | null, ev?: Event) => boolean,
		query?: IDBValidKey | IDBKeyRange | null,
		direction?: IDBCursorDirection
	): Promise<void> {
		return new Promise((ok, err) => {
			const request = idbStoreCursor(store, query, direction)

			request.onerror = ev => err(ev)
			request.onsuccess = ev => {
				const cursor = request.result
				if (!cursor) {
					result(cursor, ev)
					ok()
					return
				}

				const isContinue = result(cursor, ev)
				if (isContinue) cursor.continue()
				else ok()
			}
		})
	}

	removeDatabase(listeners?: Listeners): void {
		this.close()
		const request = idbDelete(this.databaseName)

		request.onblocked = (ev) => listeners?.onBlocked?.(ev, this)
		request.onerror = (ev) => listeners?.onError?.(ev, this)
		request.onsuccess = (ev) => listeners?.onSuccess?.(ev, this)
		request.onupgradeneeded = (ev) => listeners?.onUpgrade?.(ev, this)
	}

	transaction(
		store: string | string[],
		mode?: IDBTransactionMode,
		options?: IDBTransactionOptions
	): IDBTransaction | null {
		if (!this._db) return null;

		try {
			return idbTransaction(this._db, store, mode, options)
		} catch { return null }
	}

	stores(mode?: IDBTransactionMode, ...names: string[]): (IDBObjectStore | null)[] {
		const transaction = this.transaction(names, mode)
		const stores: (IDBObjectStore | null)[] = []

		if (transaction == null) return arrayFill(new Array(arrayLength(names)), null)

		for (const name of names) {
			try {
				const store = idbTransactionStore(transaction, name)
				arrayPush(stores, store)
			} catch { arrayPush(stores, null) }
		}

		return stores
	}

	readStore(store: string, options?: IDBTransactionOptions): IDBObjectStore | null {
		const transaction = this.transaction(store, 'readonly', options)
		if (transaction == null) return null

		return idbTransactionStore(transaction, store)
	}

	writeStore(store: string, options?: IDBTransactionOptions): IDBObjectStore | null {
		const transaction = this.transaction(store, 'readwrite', options)
		if (transaction == null) return null

		return idbTransactionStore(transaction, store)
	}

	get isOpen(): boolean {
		return this._isOpen
	}

	get db(): IDBDatabase | null {
		return this._db
	}

	get storeNames(): DOMStringList | null {
		if (this._db == null) return null

		return idbStoreNames(this._db)
	}
}

export function idbStorePut<T>(
	store: IDBObjectStore,
	value: T,
	key?: IDBValidKey
): IDBRequest<IDBValidKey> {
	return store.put(value, key)
}

export function idbStoreAdd<T>(
	store: IDBObjectStore,
	value: T,
	key?: IDBValidKey
): IDBRequest<IDBValidKey> {
	return store.add(value, key)
}

export function idbStoreGet<T>(
	store: IDBObjectStore,
	query: IDBValidKey | IDBKeyRange
): IDBRequest<T> {
	return store.get(query)
}

export function idbStoreGetAll<T>(
	store: IDBObjectStore,
	query?: IDBValidKey | IDBKeyRange | null,
	count?: number
): IDBRequest<T[]> {
	return store.getAll(query, count)
}

export function idbStoreDelete(
	store: IDBObjectStore,
	query: IDBValidKey | IDBKeyRange
): IDBRequest<undefined> {
	return store.delete(query)
}

export function idbStoreClear(store: IDBObjectStore): IDBRequest<undefined> {
	return store.clear()
}

export function idbStoreCursor(
	store: IDBObjectStore,
	query?: IDBValidKey | IDBKeyRange | null,
	direction?: IDBCursorDirection
): IDBRequest<IDBCursorWithValue | null> {
	return store.openCursor(query, direction)
}

export function idbStoreIndexNames(store: IDBObjectStore): DOMStringList {
	return store.indexNames
}

export function idbStoreCreateIndex(
	store: IDBObjectStore,
	name: string,
	key_path: string | string[],
	options?: IDBIndexParameters
): IDBIndex {
	return store.createIndex(name, key_path, options)
}

export function idbStoreDeleteIndex(
	store: IDBObjectStore,
	name: string
): void {
	return store.deleteIndex(name)
}

export function idbStoreNames(db: IDBDatabase): DOMStringList {
	return db.objectStoreNames
}

export function idbOpen(
	name: string,
	version?: number
): IDBOpenDBRequest {
	return indexedDB.open(name, version)
}

export function idbClose(db: IDBDatabase): void {
	return db.close()
}

export function idbCreateStore(
	db: IDBDatabase,
	name: string,
	options?: IDBObjectStoreParameters
): IDBObjectStore {
	return db.createObjectStore(name, options)
}

export function idbDelete(name: string): IDBOpenDBRequest {
	return indexedDB.deleteDatabase(name)
}

export function idbTransaction(
	db: IDBDatabase,
	store_names: string | string[],
	mode?: IDBTransactionMode,
	options?: IDBTransactionOptions
): IDBTransaction {
	return db.transaction(store_names, mode, options)
}

export function idbTransactionStore(
	transaction: IDBTransaction,
	name: string
): IDBObjectStore {
	return transaction.objectStore(name)
}