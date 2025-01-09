export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export enum ObjectStoreNames {
	settings = 'settings',
}

export enum ObjectStoreSettingsKeys {
	/** @param page `Pages` */
	last_page = 'last_page',
}