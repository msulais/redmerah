let ID_INDEX = 0

export function createId(prefix?: string, suffix?: string): string {
	const generate = () => {
		++ID_INDEX
		return (prefix ?? 'gid-') + ID_INDEX.toString(36) + (suffix ?? '')
	}
	let id = generate()

	// check if client-side
	if (document) {
		while (document.getElementById(id)) id = generate()
	}

	return id
}