import type { HEXColor } from "./color"

export type AppItem = {
    logoURL: string
    title: string
    description: string
    link: string
    color: HEXColor
    buildNumber: number
    buildVersion: `${string}.${string}.${string}`
}