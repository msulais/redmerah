import { Pages } from "./_enums"
import type { TaskList } from "./_types"

export const SIZE_SIDE_NAVIGATION_NONE = 640
export const TASKS_PAGES = [
	{ type: Pages.tasks, text: 'Tasks', icon: 0xE8E2 },
	{ type: Pages.all, text: 'All', icon: 0xE069 },
	{ type: Pages.completed, text: 'Completed', icon: 0xE3CC },
	{ type: Pages.uncompleted, text: 'Uncompleted', icon: 0xE3D4 },
	{ type: Pages.important, text: 'Important', icon: 0xEF1B },
	{ type: Pages.planned, text: 'Planned', icon: 0xE01B },
]
export const DEFAULT_TASK_LIST: TaskList = {
	id: 0,
	name: 'Tasks',
	tasks: [],
	emoji: null
}