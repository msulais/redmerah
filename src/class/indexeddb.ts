import { _add, _close, _continue, _createIndex, _createObjectStore, _databaseName, _delete, _deleteDatabase, _get, _getAll, _includes, _isOpen, _objectStore, _onblocked, _onBlocked, _onerror, _onError, _onSuccess, _onsuccess, _onupgradeneeded, _onUpgradeNeeded, _onversionchange, _open, _openCursor, _put, _readonly, _readwrite, _result, _transaction, _version } from "@/data/string"
import { getIndexedDB } from "@/data/window"
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
    onUpgradeNeeded?: (ev: IDBVersionChangeEvent, db: IDB) => unknown
}

const __db = '_db'
const __isOpen = '_isOpen'

export class IDB {
    readonly databaseName: DatabaseNames
    readonly version: number
    private _db: IDBDatabase | null = null
    private _isOpen: boolean = false

    constructor (databaseName: DatabaseNames, version: number = 1) {
        this[_databaseName] = databaseName
        this[_version] = version
    }

    async open(listeners?: Listeners): Promise<void> {
        return new Promise((ok, error) => {
            if (this[_isOpen]) {
                error("Database already open")
                return
            }

            const openRequest = getIndexedDB()[_open](this[_databaseName], this[_version])

            openRequest[_onblocked] = (ev) => {
                this[__db] = openRequest[_result]
                if (listeners && listeners[_onBlocked]) listeners[_onBlocked](ev, this)
                error(ev)
            }

            openRequest[_onerror] = (ev) => {
                this[__db] = openRequest[_result]
                if (listeners && listeners[_onError]) listeners[_onError](ev, this)
                error(ev)
            }

            openRequest[_onsuccess] = (ev) => {
                this[__isOpen] = true
                this[__db] = openRequest[_result]
                if (listeners && listeners[_onSuccess]) listeners[_onSuccess](ev, this)

                // handle different database version from other tab
                this[__db]![_onversionchange] = () => {
                    this[_close]()
                    alert("Database version is outdated, please reload the page.")
                }

                ok()
            }

            openRequest[_onupgradeneeded] = (ev) => {
                this[__db] = openRequest[_result]
                if (listeners && listeners[_onUpgradeNeeded]) listeners[_onUpgradeNeeded](ev, this)
                ok()
            }
        })
    }

    close(): void {
        if (this[__db]) this[__db][_close]()
        this[__isOpen] = false
    }

    /**
     * Only called this inside `onUpgradeNeeded()`
     */
    createObjectStore<T>({name, indexs, keyPath}: CreateObjectStoreParams<T>): IDBObjectStore | null {
        if (!this[__db]) return null;

        keyPath = String(keyPath)

        const objectStore = this[__db]![_createObjectStore](name, {
            autoIncrement: true,
            keyPath: keyPath
        })

        for (const i of indexs) {
            const name = String(i)
            objectStore[_createIndex](name, name, {unique: name == keyPath})
        }

        if (!indexs[_includes](keyPath as keyof T)) objectStore[_createIndex](keyPath, keyPath, {unique: true})
        return objectStore
    }

    async get<T>(objectStore: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<T | undefined> {
        return new Promise<T | undefined>((ok, err) => {
            const getRequest = objectStore[_get](query)
            getRequest[_onsuccess] = () => ok(getRequest[_result] as T)
            getRequest[_onerror] = ev => err(ev)
        })
    }

    async getAll<T>(objectStore: IDBObjectStore, query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<T[]> {
        return new Promise<T[]>((ok, err) => {
            const getAllRequest = objectStore[_getAll](query, count)
            getAllRequest[_onsuccess] = () => ok(getAllRequest[_result] as T[])
            getAllRequest[_onerror] = ev => err(ev)
        })
    }

    async put<T>(objectStore: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
        return new Promise<Event>((ok, err) => {
            const putRequest = objectStore[_put](value, key)
            putRequest[_onsuccess] = ev => ok(ev)
            putRequest[_onerror] = ev => err(ev)
        })
    }

    async add<T>(objectStore: IDBObjectStore, value: T, key?: IDBValidKey): Promise<Event> {
        return new Promise<Event>((ok, err) => {
            const addRequest = objectStore[_add](value, key)
            addRequest[_onsuccess] = (ev) => ok(ev)
            addRequest[_onerror] = (ev) => err(ev)
        })
    }

    async delete(objectStore: IDBObjectStore, query: IDBValidKey | IDBKeyRange): Promise<Event> {
        return new Promise<Event>((ok, err) => {
            const deleteRequest = objectStore[_delete](query)
            deleteRequest[_onsuccess] = (ev) => ok(ev)
            deleteRequest[_onerror] = (ev) => err(ev)
        })
    }

    async cursor(objectStore: IDBObjectStore, result: (cursor: IDBCursorWithValue | null, ev?: Event) => boolean, query?: IDBValidKey | IDBKeyRange | null, direction?: IDBCursorDirection): Promise<void> {
        return new Promise((ok, err) => {
            const openCursorRequest = objectStore[_openCursor](query, direction)

            openCursorRequest[_onerror] = ev => err(ev)
            openCursorRequest[_onsuccess] = ev => {
                const cursor = openCursorRequest[_result]
                if (!cursor) {
                    result(cursor, ev)
                    ok()
                    return
                }

                const isContinue = result(cursor, ev)
                if (isContinue) cursor[_continue]()
                else ok()
            }
        })
    }

    removeDB(listeners?: Listeners): void {
        this[_close]()
        const deleteRequest = getIndexedDB()[_deleteDatabase](this[_databaseName])

        deleteRequest[_onblocked] = (ev) => {
            if (listeners && listeners[_onBlocked]) listeners[_onBlocked](ev, this)
        }

        deleteRequest[_onerror] = (ev) => {
            if (listeners && listeners[_onError]) listeners[_onError](ev, this)
        }

        deleteRequest[_onsuccess] = (ev) => {
            if (listeners && listeners[_onSuccess]) listeners[_onSuccess](ev, this)
        }

        deleteRequest[_onupgradeneeded] = (ev) => {
            if (listeners && listeners[_onUpgradeNeeded]) listeners[_onUpgradeNeeded](ev, this)
        }
    }

    transaction(storeNames: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions): IDBTransaction | null {
        if (!this[__db]) return null;

        try {
            return this[__db][_transaction](storeNames, mode, options)
        } catch { return null }
    }

    readObjectStore(storeName: string, options?: IDBTransactionOptions): IDBObjectStore | null {
        const transaction = this[_transaction](storeName, _readonly, options)
        if (transaction == null) return null

        return transaction[_objectStore](storeName)
    }

    writeObjectStore(storeName: string, options?: IDBTransactionOptions): IDBObjectStore | null {
        const transaction = this[_transaction](storeName, _readwrite, options)
        if (transaction == null) return null

        return transaction[_objectStore](storeName)
    }

    get isOpen(): boolean {
        return this[__isOpen]
    }

    get db(): IDBDatabase | null {
        return this[__db]
    }
}