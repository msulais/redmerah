import { LocalStorageKeys } from "@/enums/storage"

export function storageSet(key: LocalStorageKeys, value: string): void {
	return localStorage.setItem(key, value)
}

export function storageGet(key: LocalStorageKeys): string | null {
	return localStorage.getItem(key)
}

export function storageClear(): void {
	return localStorage.clear()
}

export function storageRemove(key: LocalStorageKeys): void {
	return localStorage.removeItem(key)
}