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
	settings_sortBy = 'sort-by',

	/** @param {SortMode} value `SortMode` */
	settings_sortMode = 'sort-mode',

	/** @param {boolean} value `boolean` */
	settings_showDeleteTaskWarning = 'show-delete-task-warning',

	/** @param {Pages[]} value `Pages[]` */
	settings_hiddenNavigation = 'hidden-navigation',

	/** @param {boolean} value `boolean` */
	miscellaneous_isSideNavigationExpanded = 'is-side-navigation-expanded',

	/** @param value `Pages|number` */
	miscellaneous_lastPage = 'last-page',
}