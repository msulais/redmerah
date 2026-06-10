/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace astroHTML.JSX {
	interface HTMLAttributes {
		"br:icon"            ?: boolean
		"br:focused"         ?: boolean
		"br:preventdefault"  ?: boolean
		"br:disabled"        ?: boolean
		"br:keepfocusvisible"?: boolean
		"br:selected"        ?: boolean
		"br:variant"         ?: string
		"br:tooltip"         ?: string
		"br:as"              ?: string
		"br:command"         ?: string
		"br:commandfor"      ?: string
		"br:hash"            ?: string
		"br:query"           ?: string
		"br:path"            ?: string
		"br:label"           ?: string
	}
}