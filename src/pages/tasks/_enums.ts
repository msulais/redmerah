export enum Commands {
	toggle_navigation_expand,

	/** @param {Pages | number} page `Pages | number` either page or list id */
	change_page,

	/** @param {SortBy} sort_by `SortBy` */
	change_sort_by,

	/** @param {SortMode} sort_by `SortMode` */
	change_sort_mode,

	/**
	@param {Task} task `Task`
	@param {number} tasklist_index `number` */
	add_task,

	/**
	Don't use this to edit single subtask/file. Use `Commands.edit_subtask`/`Commands.edit_file` instead.
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number` */
	edit_task,

	/**
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number` */
	delete_task,

	/** @param {boolean | undefined} value `boolean | undefined` */
	toggle_delete_task_warning,

	/** @param {Pages[]} pages `Pages[]` */
	change_hidden_navigation,

	/** @param {number} tasklist_index `number` */
	mark_all_completed,

	/** @param {number} tasklist_index `number` */
	mark_all_uncompleted,

	/** @param {number} tasklist_index `number` */
	clear_tasks,

	/** @param {number} tasklist_index `number` */
	delete_completed_task,

	/** @param {number?} tasklist_index `number?` */
	copy_tasks,

	/** @param {Event} event `Event` */
	add_label,

	/**
	@param {Event} event `Event`
	@param {TaskLabel} label `TaskLabel` */
	edit_label,

	/** @param {TaskLabel} label `TaskLabel` */
	delete_label,

	/** @param {Event} event `Event` */
	show_labels_options,

	/**
	@param {FileList} files `FileList`
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@returns {Promise<TaskFileMetaData[]>} `Promise<TaskFileMetaData[]>` */
	add_files,

	/**
	@param {Event} event `Event`
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} file_index `number` */
	download_file,

	/**
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} file_index `number` */
	edit_file,

	/**
	@param {SubTask} subtask `SubTask`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} subtask_index `number` */
	edit_subtask,

	/**
	@param {Event} event `Event`
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} file_index `number`
	@returns {Promise<Blob | null>} `Promise<Blob | null>`*/
	get_file_blob,

	/**
	@param {SubTask} subtask `SubTask`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@returns {SubTask} `Promise<SubTask>`*/
	add_subtask,

	/** @param {Event} event `Event` */
	add_tasklist,

	/**
	@param {Event} event `Event`
	@param {number} tasklist_index `number` */
	delete_taskList,

	/**
	@param {Event} event `Event`
	@param {number} tasklist_index `number` */
	rename_taskList,

	/**
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} target_tasklist_index `number` */
	move_task,

	get_all_task,
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
	creation_date = 'creation_date',
	completed = 'completed',
	uncompleted = 'uncompleted'
}

export enum SortMode {
	ascending = 'asc',
	descending = 'desc'
}