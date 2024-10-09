import { getLocalStorage } from "@/constants/storage"
import { _clear, _getItem, _mode, _objectStore, _removeItem, _setItem, _transaction } from "@/constants/string"
import { LocalStorageKeys } from "@/enums/storage"

export function setLocalStorageItem(key: LocalStorageKeys, value: string): void {
	return getLocalStorage()[_setItem](key, value)
}

export function getLocalStorageItem(key: LocalStorageKeys): string | null {
	return getLocalStorage()[_getItem](key)
}

export function clearLocalStorage(): void {
	return getLocalStorage()[_clear]()
}

export function removeLocalStorageItem(key: LocalStorageKeys): void {
	return getLocalStorage()[_removeItem](key)
}