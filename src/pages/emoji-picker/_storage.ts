export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export enum ObjectStoreNames {
	settings = 'settings',
}

export enum ObjectStoreSettingsKeys {
	/** @param text `string` */
	last_text = 'last_text',
}