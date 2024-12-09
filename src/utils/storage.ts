import { LocalStorageKeys } from "@/enums/storage"

export function storage_set(key: LocalStorageKeys, value: string): void {
	return localStorage.setItem(key, value)
}

export function storage_get(key: LocalStorageKeys): string | null {
	return localStorage.getItem(key)
}

export function storage_clear(): void {
	return localStorage.clear()
}

export function storage_remove(key: LocalStorageKeys): void {
	return localStorage.removeItem(key)
}