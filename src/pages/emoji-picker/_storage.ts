export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export const enum ObjectStoreNames {
	settings = 'settings',
}

export const enum ObjectStoreSettingsKeys {
	/** @param text `string` */
	last_text = 'last_text',
}