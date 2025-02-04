import { ICON_ALERT, ICON_APPS_LIST_DETAIL, ICON_CHECKBOX_CHECKED, ICON_CHECKBOX_UNCHECKED, ICON_HOME, ICON_STAR } from "@/constants/icons"
import { Pages } from "./_enums"
import type { TaskList } from "./_types"

export const SIZE_SIDE_NAVIGATION_NONE = 640
export const TASKS_PAGES = [
	{ type: Pages.tasks, text: 'Tasks', icon: ICON_HOME },
	{ type: Pages.all, text: 'All', icon: ICON_APPS_LIST_DETAIL },
	{ type: Pages.completed, text: 'Completed', icon: ICON_CHECKBOX_CHECKED },
	{ type: Pages.uncompleted, text: 'Uncompleted', icon: ICON_CHECKBOX_UNCHECKED },
	{ type: Pages.important, text: 'Important', icon: ICON_STAR },
	{ type: Pages.planned, text: 'Planned', icon: ICON_ALERT },
]
export const DEFAULT_TASK_LIST: TaskList = {
	id: 0,
	name: 'Tasks',
	tasks: [],
	emoji: null
}