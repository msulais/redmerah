export function sanitizeXML(input: string) {
	return (
		input
		.replace(/&/g, '&amp;') // must first
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	)
}

export function unsanitizeXML(input: string) {
	return (input
		.replace(/&amp;/g, '&' )
		.replace(/&quot;/g, '"' )
		.replace(/&apos;/g, '\'')
		.replace(/&lt;/g, '<' )
		.replace(/&gt;/g, '>' )
	)
}