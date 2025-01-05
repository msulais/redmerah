import type { DatabaseNames } from "@/enums/storage"
import { array_fill, array_includes, array_length, array_push } from "./array"

type CreateObjectStoreParams<T> = {
	name: string
	key_path: (keyof T) | string
	indexs: (keyof T)[]
}

type Listeners = {
	on_success?: (ev: Event, db: IDB) => unknown
	on_blocked?: (ev: IDBVersionChangeEvent, db: IDB) => unknown
	on_error?: (ev: Event, db: IDB) => unknown
	on_upgrade_needed?: (ev: IDBVersionChangeEvent, db: IDB) => unknown
}

export class IDB {
	readonly database_name: DatabaseNames
	readonly version: number
	private _db: IDBDatabase | null = null
	private _is_open: boolean = false

	constructor (database_name: DatabaseNames, version: number = 1) {
		this.database_name = database_name
		this.version = version
	}

	async open(listeners?: Listeners): Promise<void> {
		return new Promise((ok, error) => {
			if (this.is_open) {
				error("Database already open")
				return
			}

			const open_request = idb_open(this.database_name, this.version)

			open_request.onblocked = (ev) => {
				this._db = open_request.result
				listeners?.on_blocked?.(ev, this)
				error(ev)
			}

			open_request.onerror = (ev) => {
				this._db = open_request.result
				listeners?.on_error?.(ev, this)
				error(ev)
			}

			open_request.onsuccess = (ev) => {
				this._is_open = true
				this._db = open_request.result
				listeners?.on_success?.(ev, this)

				// handle different database version from other tab
				this._db!.onversionchange = () => {
					this.close()
					alert("Database version is outdated, please reload the page.")
				}

				ok()
			}

			open_request.onupgradeneeded = (ev) => {
				this._db = open_request.result
				listeners?.on_upgrade_needed?.(ev, this)
				ok()
			}
		})
	}

	close(): void {
		if (this._db) idb_close(this._db)
		this._is_open = false
	}

	/**
	 * Only called this inside `on_upgrade_needed()`
	 */
	create_store<T>({name, indexs, key_path}: CreateObjectStoreParams<T>): IDBObjectStore | null {
		if (!this._db) return null
		key_path = String(key_path)

		let store = this.write_store(name)
		if (idb_storenames(this._db).contains(name)) {
			if (store == null) return store

			const $indexs = idb_store_indexnames(store)
			for (const index of indexs) {
				const index_name = String(index)
				if ($indexs.contains(index_name)) continue
				idb_store_createindex(store, index_name, index_name)
			}

			for (const index of $indexs) {
				if (array_includes(indexs, index as keyof T) || index == key_path) continue
				idb_store_deleteindex(store, index)
			}
		}
		else {
			store = idb_create_store(this._db, name, {
				autoIncrement: true,
				keyPath: key_path
			})

			for (const index of indexs) {
				const index_name = String(index)
				idb_store_createindex(
					store,
					index_name,
					index_name,
					{unique: index_name == key_path}
				)
			}
		}

		if (!array_includes(indexs, key_path as keyof T)) {
			idb_store_createindex(store, key_path, key_path, {unique: true})
		}

		return store
	}

	async get<T>(store: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
		return new Promise<T | undefined>((ok, err) => {
			const get_request = idb_store_get(store, query)
			get_request.onsuccess = () => ok(get_request.result as T)
			get_request.onerror = ev => err(ev)
		})
	}

	async get_all<T>(
		store: IDBObjectStore,
		query?: IDBValidKey | IDBKeyRange | null,
		count?: number
	): Promise<T[]> {
		return new Promise<T[]>((ok, err) => {
			const get_all_request = idb_store_getall(store, query, count)
			get_all_request.onsuccess = () => ok(get_all_request.result as T[])
			get_all_request.onerror = ev => err(ev)
		})
	}

	async put<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const put_request = idb_store_put(store, value, key)
			put_request.onsuccess = ev => ok(ev)
			put_request.onerror = ev => err(ev)
		})
	}

	async add<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const add_request = idb_store_add(store, value, key)
			add_request.onsuccess = (ev) => ok(ev)
			add_request.onerror = (ev) => err(ev)
		})
	}

	async delete(store: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const delete_request = idb_store_delete(store, query)
			delete_request.onsuccess = (ev) => ok(ev)
			delete_request.onerror = (ev) => err(ev)
		})
	}

	async cursor(
		store: IDBObjectStore,
		result: (cursor: IDBCursorWithValue | null, ev?: Event) => boolean,
		query?: IDBValidKey | IDBKeyRange | null,
		direction?: IDBCursorDirection
	): Promise<void> {
		return new Promise((ok, err) => {
			const open_cursor_request = idb_store_cursor(store, query, direction)

			open_cursor_request.onerror = ev => err(ev)
			open_cursor_request.onsuccess = ev => {
				const cursor = open_cursor_request.result
				if (!cursor) {
					result(cursor, ev)
					ok()
					return
				}

				const is_continue = result(cursor, ev)
				if (is_continue) cursor.continue()
				else ok()
			}
		})
	}

	remove_database(listeners?: Listeners): void {
		this.close()
		const delete_request = idb_delete(this.database_name)

		delete_request.onblocked = (ev) => listeners?.on_blocked?.(ev, this)
		delete_request.onerror = (ev) => listeners?.on_error?.(ev, this)
		delete_request.onsuccess = (ev) => listeners?.on_success?.(ev, this)
		delete_request.onupgradeneeded = (ev) => listeners?.on_upgrade_needed?.(ev, this)
	}

	transaction(
		store: string | string[],
		mode?: IDBTransactionMode,
		options?: IDBTransactionOptions
	): IDBTransaction | null {
		if (!this._db) return null;

		try {
			return idb_transaction(this._db, store, mode, options)
		} catch { return null }
	}

	stores(mode?: IDBTransactionMode, ...names: string[]): (IDBObjectStore | null)[] {
		const transaction = this.transaction(names, mode)
		const stores: (IDBObjectStore | null)[] = []

		if (transaction == null) return array_fill(new Array(array_length(names)), null)

		for (const name of names) {
			try {
				const store = idb_transaction_store(transaction, name)
				array_push(stores, store)
			} catch { array_push(stores, null) }
		}

		return stores
	}

	read_store(store: string, options?: IDBTransactionOptions): IDBObjectStore | null {
		const transaction = this.transaction(store, 'readonly', options)
		if (transaction == null) return null

		return idb_transaction_store(transaction, store)
	}

	write_store(store: string, options?: IDBTransactionOptions): IDBObjectStore | null {
		const transaction = this.transaction(store, 'readwrite', options)
		if (transaction == null) return null

		return idb_transaction_store(transaction, store)
	}

	get is_open(): boolean {
		return this._is_open
	}

	get db(): IDBDatabase | null {
		return this._db
	}

	get store_names(): DOMStringList | null {
		if (this._db == null) return null

		return idb_storenames(this._db)
	}
}

/**
 * Adds or updates a record in store with the given value and key.
 *
 * If the store uses in-line keys and key is specified a "DataError" DOMException will be thrown.
 *
 * If `put()` is used, any existing record with the key will be replaced. If add() is used, and if a
 * record with the key already exists the request will fail, with request's error set to a
 * "ConstraintError" DOMException.
 *
 * If successful, request's result will be the record's key.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/put)
 */
export function idb_store_put<T>(
	store: IDBObjectStore,
	value: T,
	key?: IDBValidKey
): IDBRequest<IDBValidKey> {
	return store.put(value, key)
}

/**
 * Adds or updates a record in store with the given value and key.
 *
 * If the store uses in-line keys and key is specified a "DataError" DOMException will be thrown.
 *
 * If put() is used, any existing record with the key will be replaced. If add() is used, and if a
 * record with the key already exists the request will fail, with request's error set to a
 * "ConstraintError" DOMException.
 *
 * If successful, request's result will be the record's key.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/add)
 */
export function idb_store_add<T>(
	store: IDBObjectStore,
	value: T,
	key?: IDBValidKey
): IDBRequest<IDBValidKey> {
	return store.add(value, key)
}

/**
 * Retrieves the value of the first record matching the given key or key range in query.
 *
 * If successful, request's result will be the value, or undefined if there was no matching record.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/get)
 */
export function idb_store_get<T>(
	store: IDBObjectStore,
	query: IDBValidKey | IDBKeyRange
): IDBRequest<T> {
	return store.get(query)
}

/**
 * Retrieves the values of the records matching the given key or key range in query (up to count if
 * given).
 *
 * If successful, request's result will be an Array of the values.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/getAll)
 */
export function idb_store_getall<T>(
	store: IDBObjectStore,
	query?: IDBValidKey | IDBKeyRange | null,
	count?: number
): IDBRequest<T[]> {
	return store.getAll(query, count)
}

/**
 * Deletes records in store with the given key or in the given key range in query.
 *
 * If successful, request's result will be undefined.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/delete)
 */
export function idb_store_delete(
	store: IDBObjectStore,
	query: IDBValidKey | IDBKeyRange
): IDBRequest<undefined> {
	return store.delete(query)
}

/**
 * Deletes all records in store.
 *
 * If successful, request's result will be undefined.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/clear)
 */
export function idb_store_clear(store: IDBObjectStore): IDBRequest<undefined> {
	return store.clear()
}

/**
 * Opens a cursor over the records matching query, ordered by direction. If query is null, all
 * records in store are matched.
 *
 * If successful, request's result will be an IDBCursorWithValue pointing at the first matching
 * record, or null if there were no matching records.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/openCursor)
 */
export function idb_store_cursor(
	store: IDBObjectStore,
	query?: IDBValidKey | IDBKeyRange | null,
	direction?: IDBCursorDirection
): IDBRequest<IDBCursorWithValue | null> {
	return store.openCursor(query, direction)
}

/**
 * Returns a list of the names of indexes in the store.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/indexNames)
 */
export function idb_store_indexnames(store: IDBObjectStore): DOMStringList {
	return store.indexNames
}

/**
* Creates a new index in store with the given name, keyPath and options and returns a new IDBIndex.
* If the keyPath and options define constraints that cannot be satisfied with the data already in
* store the upgrade transaction will abort with a "ConstraintError" DOMException.
*
* Throws an "InvalidStateError" DOMException if not called within an upgrade transaction.
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/createIndex)
*/
export function idb_store_createindex(
	store: IDBObjectStore,
	name: string,
	key_path: string | string[],
	options?: IDBIndexParameters
): IDBIndex {
	return store.createIndex(name, key_path, options)
}

/**
 * Deletes the index in store with the given name.
 *
 * Throws an "InvalidStateError" DOMException if not called within an upgrade transaction.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBObjectStore/deleteIndex)
 */
export function idb_store_deleteindex(
	store: IDBObjectStore,
	name: string
): void {
	return store.deleteIndex(name)
}

/**
 * Returns a list of the names of object stores in the database.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/objectStoreNames)
 */
export function idb_storenames(db: IDBDatabase): DOMStringList {
	return db.objectStoreNames
}

/**
 * Attempts to open a connection to the named database with the current version, or 1 if it does not
 * already exist. If the request is successful request's result will be the connection.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBFactory/open)
 */
export function idb_open(
	name: string,
	version?: number
): IDBOpenDBRequest {
	return indexedDB.open(name, version)
}

/**
 * Closes the connection once all running transactions have finished.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/close)
 */
export function idb_close(db: IDBDatabase): void {
	return db.close()
}

/**
 * Creates a new object store with the given name and options and returns a new IDBObjectStore.
 *
 * Throws a "InvalidStateError" DOMException if not called within an upgrade transaction.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/createObjectStore)
 */
export function idb_create_store(
	db: IDBDatabase,
	name: string,
	options?: IDBObjectStoreParameters
): IDBObjectStore {
	return db.createObjectStore(name, options)
}

/**
 * Attempts to delete the named database. If the database already exists and there are open
 * connections that don't close in response to a versionchange event, the request will be blocked
 * until all they close. If the request is successful request's result will be null.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBFactory/deleteDatabase)
 */
export function idb_delete(name: string): IDBOpenDBRequest {
	return indexedDB.deleteDatabase(name)
}

/**
 * Returns a new transaction with the given mode ("readonly" or "readwrite") and scope which can be
 * a single object store name or an array of names.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBDatabase/transaction)
 */
export function idb_transaction(
	db: IDBDatabase,
	store_names: string | string[],
	mode?: IDBTransactionMode,
	options?: IDBTransactionOptions
): IDBTransaction {
	return db.transaction(store_names, mode, options)
}

/**
 * Returns an IDBObjectStore in the transaction's scope.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/IDBTransaction/objectStore)
 */
export function idb_transaction_store(
	transaction: IDBTransaction,
	name: string
): IDBObjectStore {
	return transaction.objectStore(name)
}