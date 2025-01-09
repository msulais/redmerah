import type { SubTask, Task, TaskFileMetaData, TaskLabel, TaskList } from "./_types"

export type ObjectStoreSettings<T = unknown> = {
	key: ObjectStoreKeys
	value: T
}
export type ObjectStoreMiscellaneous<T = unknown> = {
	key: ObjectStoreKeys
	value: T
}
export type ObjectStoreTaskLists = Omit<TaskList, 'tasks'>
export type ObjectStoreTasks = Omit<Task, 'subtasks' | 'files'>
export type ObjectStoreSubTasks = SubTask
export type ObjectStoreTaskLabels = TaskLabel
export type ObjectStoreTaskFileMetaData = TaskFileMetaData
export type ObjectStoreFiles = {
	id: number
	blob: Blob
}

export enum ObjectStoreNames {
	settings = 'settings',
	miscellaneous = 'miscellaneous',
	tasks = 'tasks',
	subtasks = 'subtasks',
	tasklists = 'tasklists',
	labels = 'labels',
	filemetadata = 'filemetadata',
	files = 'files'
}

export enum ObjectStoreKeys {

	/** @param {SortBy} value `SortBy` */
	settings_sortby = 'sort_by',

	/** @param {SortMode} value `SortMode` */
	settings_sortmode = 'sort_mode',

	/** @param {boolean} value `boolean` */
	settings_isshowdeletetaskwarning = 'is_show_delete_task_warning',

	/** @param {Pages[]} value `Pages[]` */
	settings_hidden_navigation = 'hidden_navigation',

	/** @param {boolean} value `boolean` */
	miscellaneous_issidenavigationexpanded = 'is_side_navigation_expanded',

	/** @param value `Pages|number` */
	miscellaneous_lastpage = 'last_page',
}