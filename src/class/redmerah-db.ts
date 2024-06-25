import type { DatabaseNames } from "@/enums/storage"

type QueryParams<T> = {
    where?: (value: T & {id: string}) => boolean
    columns?: (keyof (T & {id: string}))[]
    limit?: number
    orderBy?: keyof (T & {id: string})
    distinct?: boolean
    orderMode?: 'ASC' | 'DESC'
}

type UpdateParams<T> = {
    where?: (value: T & {id: string}) => boolean
    columns: (keyof T)[]
    args: unknown[]
}

export class RedmerahDB<T> {
    readonly _databaseName: DatabaseNames
    private _version: number

    constructor (databaseName: DatabaseNames, version: number = 1) {
        this._databaseName = databaseName
        this._version = version

        // TODO: open database
    }

    async query({where, columns, limit, orderBy, distinct, orderMode}: QueryParams<T & {id: string}>): Promise<(T & { id: string })[] | null> {
        // TODO: query database
        return null
    }

    async update({where, args, columns}: UpdateParams<T>): Promise<(T & { id: string })[] | null> {
        // TODO: update database
        return null
    }

    async insert(...items: T[]): Promise<(T & { id: string })[] | null> {
        // TODO: insert database
        return null
    }

    async delete(where?: (value: T & {id: string}) => boolean): Promise<(T & { id: string })[] | null> {
        // TODO: delete database
        return null
    }

    async removeDB(): Promise<boolean> {
        // TODO: remove database
        return false
    }

    get version(): number {
        return this._version
    }

    get databaseName(): DatabaseNames {
        return this._databaseName
    }
}