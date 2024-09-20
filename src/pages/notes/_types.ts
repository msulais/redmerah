import type { Delta } from "quill/core"

export type Note = {
    id: number
    title: string
    emoji: string | null
    content: Delta | null
}