import type { DatabaseNames } from "@/enums/storage"

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

			const request = indexedDB.open(this.databaseName, this.version)
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
		if (this._db) this._db.close()
		this._isOpen = false
	}

	/**
	 * Only called this inside `on_upgrade_needed()`
	 */
	createStore<T>({name, indexs, keyPath}: CreateObjectStoreParams<T>): IDBObjectStore | null {
		if (!this._db) return null
		keyPath = String(keyPath)

		let store = this.writeStore(name)
		if (this._db.objectStoreNames.contains(name)) {
			if (store == null) return store

			const $indexs = store.indexNames
			for (const index of indexs) {
				const indexName = String(index)
				if ($indexs.contains(indexName)) continue

				store.createIndex(indexName, indexName)
			}

			for (const index of $indexs) {
				if (indexs.includes(index as keyof T) || index === keyPath) continue

				store.deleteIndex(index)
			}
		}
		else {
			store = this._db.createObjectStore(name, {
				autoIncrement: true,
				keyPath: keyPath
			})

			for (const index of indexs) {
				const indexName = String(index)
				store.createIndex(
					indexName,
					indexName,
					{unique: indexName === keyPath}
				)
			}
		}

		if (!indexs.includes(keyPath as keyof T)) {
			store.createIndex(keyPath, keyPath, {unique: true})
		}

		return store
	}

	async get<T>(store: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
		return new Promise<T | undefined>((ok, err) => {
			const request = store.get(query)
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
			const request = store.getAll(query, count)
			request.onsuccess = () => ok(request.result as T[])
			request.onerror = ev => err(ev)
		})
	}

	async put<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const request = store.put(value, key)
			request.onsuccess = ev => ok(ev)
			request.onerror = ev => err(ev)
		})
	}

	async add<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const request = store.add(value, key)
			request.onsuccess = (ev) => ok(ev)
			request.onerror = (ev) => err(ev)
		})
	}

	async delete(store: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<Event> {
		return new Promise<Event>((ok, err) => {
			const request = store.delete(query)
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
			const request = store.openCursor(query, direction)
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
		const request = indexedDB.deleteDatabase(this.databaseName)

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
		if (!this._db) return null

		try {
			return this._db.transaction(store, mode, options)
		} catch { return null }
	}

	stores(mode?: IDBTransactionMode, ...names: string[]): (IDBObjectStore | null)[] {
		const transaction = this.transaction(names, mode)
		const stores: (IDBObjectStore | null)[] = []

		if (transaction === null) return new Array(names.length).fill(null)

		for (const name of names) {
			try {
				const store = transaction.objectStore(name)
				stores.push(store)
			} catch { stores.push(null) }
		}

		return stores
	}

	readStore(store: string, options?: IDBTransactionOptions): IDBObjectStore | null {
		const transaction = this.transaction(store, 'readonly', options)
		if (transaction === null) return null

		return transaction.objectStore(store)
	}

	writeStore(store: string, options?: IDBTransactionOptions): IDBObjectStore | null {
		const transaction = this.transaction(store, 'readwrite', options)
		if (transaction === null) return null

		return transaction.objectStore(store)
	}

	get isOpen(): boolean {
		return this._isOpen
	}

	get db(): IDBDatabase | null {
		return this._db
	}

	get storeNames(): DOMStringList | null {
		if (this._db == null) return null

		return this._db.objectStoreNames
	}
}