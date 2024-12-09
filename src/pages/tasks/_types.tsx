import type { HEXColor } from "@/types/color"
import type { Pages, SortBy, SortMode } from "./_enums"

export type Settings = {
	sort_by: SortBy
	sort_mode: SortMode
	is_show_deletetaskwarning: boolean
	hidden_navigation: Pages[]
}

export type SubTask = {
	id: number
	list_id: number
	task_id: number
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
	list_id: number
	task_id: number
	name: string
	size: number
	type: string
}

export type Task = {
	id: number
	list_id: number
	name: string
	complete: boolean
	label_ids: number[]
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