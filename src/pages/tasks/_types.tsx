import type { HEXColor } from "@/types/color"
import type { Pages, SortBy, SortMode } from "./_enums"

export type Settings = {
	sortBy: SortBy
	sortMode: SortMode
	isShowDeleteTaskWarning: boolean
	hiddenNavigation: Pages[]
}

export type SubTask = {
	id: number
	listId: number
	taskId: number
	name: string
	complete: boolean
}

export type TaskLabel = {
	id: number
	name: string
	color: HEXColor | null
}

export type TaskFileMetaData = {
	id: number
	listId: number
	taskId: number
	name: string
	size: number
	type: string
}

export type Task = {
	id: number
	listId: number
	name: string
	complete: boolean
	labelIds: number[]
	files: TaskFileMetaData[]
	reminder: Date | null
	important: boolean
	description: string
	subtasks: SubTask[]
}

export type TaskList = {
	id: number
	emoji: string | null
	name: string
	tasks: Task[]
}