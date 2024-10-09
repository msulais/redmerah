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
	taskLists = 'taskLists',
	labels = 'labels',
	taskFileMetaData = 'taskFileMetaData',
	files = 'files'
}

export enum ObjectStoreKeys {

	/** @param {SortBy} value `SortBy` */
	settings_sortBy = 'sortBy',

	/** @param {SortMode} value `SortMode` */
	settings_sortMode = 'sortMode',

	/** @param {boolean} value `boolean` */
	settings_isShowDeleteTaskWarning = 'isShowDeleteTaskWarning',

	/** @param {Pages[]} value `Pages[]` */
	settings_hiddenNavigation = 'hiddenNavigation',

	/** @param {boolean} value `boolean` */
	miscellaneous_isSideNavigationExpand = 'isSideNavigationExpand',

	/** @param value `Pages|number` */
	miscellaneous_lastPage = 'lastPage',
}