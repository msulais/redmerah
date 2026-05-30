/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace astroHTML.JSX {
	interface HTMLAttributes {
		"br:variant"?: string
		"br:icon"?: boolean
		"br:focused"?: boolean
		"br:as"?: string
		"br:command"?: string
		"br:commandfor"?: string
	}
}