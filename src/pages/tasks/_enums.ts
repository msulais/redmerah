export enum Commands {
	toggleNavigationExpand,

	/** @param {Pages | number} page `Pages | number` either page or list id */
	updatePage,

	/** @param {SortBy} sortBy `SortBy` */
	updateSortBy,

	/** @param {SortMode} sortBy `SortMode` */
	updateSortMode,

	/**
	@param {Task} task `Task`
	@param {number} taskListIndex `number` */
	addTask,

	/**
	Don't use this to edit single subtask/file. Use `Commands.edit_subtask`/`Commands.edit_file` instead.
	@param {Task} task `Task`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number` */
	editTask,

	/**
	@param {Task} task `Task`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number` */
	deleteTask,

	/** @param {boolean | undefined} value `boolean | undefined` */
	toggleDeleteTaskWarning,

	/** @param {Pages[]} pages `Pages[]` */
	updateHiddenNavigation,

	/** @param {number} taskListIndex `number` */
	markAllCompleted,

	/** @param {number} taskListIndex `number` */
	markAllUncompleted,

	/** @param {number} taskListIndex `number` */
	clearTasks,

	/** @param {number} taskListIndex `number` */
	deleteCompletedTask,

	/** @param {number?} taskListIndex `number?` */
	copyTasks,

	/** @param {Event} event `Event` */
	addLabel,

	/**
	@param {Event} event `Event`
	@param {TaskLabel} label `TaskLabel` */
	editLabel,

	/** @param {TaskLabel} label `TaskLabel` */
	deleteLabel,

	/** @param {Event} event `Event` */
	showLabelsOptions,

	/**
	@param {FileList} files `FileList`
	@param {Task} task `Task`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@returns {Promise<TaskFileMetaData[]>} `Promise<TaskFileMetaData[]>` */
	addFiles,

	/**
	@param {Event} event `Event`
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@param {number} fileIndex `number` */
	downloadFile,

	/**
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@param {number} fileIndex `number` */
	editFile,

	/**
	@param {SubTask} subtask `SubTask`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@param {number} subtaskIndex `number` */
	editSubTask,

	/**
	@param {Event} event `Event`
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@param {number} fileIndex `number`
	@returns {Promise<Blob | null>} `Promise<Blob | null>`*/
	getFileBlob,

	/**
	@param {SubTask} subtask `SubTask`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@returns {SubTask} `Promise<SubTask>`*/
	addSubTask,

	/** @param {Event} event `Event` */
	addTaskList,

	/**
	@param {Event} event `Event`
	@param {number} taskListIndex `number` */
	deleteTaskList,

	/**
	@param {Event} event `Event`
	@param {number} taskListIndex `number` */
	renameTaskList,

	/**
	@param {Task} task `Task`
	@param {number} taskListIndex `number`
	@param {number} taskIndex `number`
	@param {number} targetTaskListIndex `number` */
	moveTask,

	getAllTask,
}

export enum Pages {
	tasks = 'tasks',
	all = 'all',
	completed = 'completed',
	uncompleted = 'uncompleted',
	important = 'important',
	planned = 'planned'
}

export enum SortBy {
	name = 'name',
	importance = 'importance',
	creationDate = 'creation-date',
	completed = 'completed',
	uncompleted = 'uncompleted'
}

export enum SortMode {
	ascending = 'asc',
	descending = 'desc'
}