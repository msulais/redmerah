/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace astroHTML.JSX {
	interface HTMLAttributes {
		"br:variant"?: string
		"br:icon"?: boolean
		"br:focused"?: boolean
		"br:preventdefault"?: boolean
		"br:tooltip"?: string
		"br:as"?: string
		"br:command"?: string
		"br:commandfor"?: string
	}
}