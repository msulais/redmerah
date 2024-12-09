import type { HEXColor } from "./color"

export type AppItem = {
	logo_url: string
	name: string
	description: string
	link: string
	color: HEXColor
	build_number: number
	build_version: `${string}.${string}.${string}`
}