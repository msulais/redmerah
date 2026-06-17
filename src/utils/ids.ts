import { stringToHash } from "./string"

let ID_INDEX = 0
const prefixID = 'ID' +  stringToHash('global-id')

/**
 * @deprecated
 */
export function createElementId(prefix?: string, suffix?: string): string {
	const generate = () => {
		++ID_INDEX
		return (prefix ?? prefixID) + ID_INDEX.toString(36) + (suffix ?? '')
	}
	let id = generate()

	// check if client-side
	if (document) {
		while (document.getElementById(id)) id = generate()
	}

	return id
}