import type { HEXColor } from "./color"

export type AppItem = {
	logoUrl: string
	name: string
	description: string
	link: string
	color: HEXColor
	buildNumber: number
	buildVersion: `${string}.${string}.${string}`
}