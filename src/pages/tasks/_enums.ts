export enum Commands {
	toggle_navigation_expand = 'a',

	/** @param {Pages | number} page `Pages | number` either page or list id */
	change_page = 'b',

	/** @param {SortBy} sort_by `SortBy` */
	change_sort_by = 'c',

	/** @param {SortMode} sort_by `SortMode` */
	change_sort_mode = 'd',

	/**
	@param {Task} task `Task`
	@param {number} tasklist_index `number` */
	add_task = 'e',

	/**
	Don't use this to edit single subtask/file. Use `Commands.edit_subtask`/`Commands.edit_file` instead.
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number` */
	edit_task = 'g',

	/**
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number` */
	delete_task = 'h',

	/** @param {boolean | undefined} value `boolean | undefined` */
	toggle_delete_task_warning = 'i',

	/** @param {Pages[]} pages `Pages[]` */
	change_hidden_navigation = 'j',

	/** @param {number} tasklist_index `number` */
	mark_all_completed = 'k',

	/** @param {number} tasklist_index `number` */
	mark_all_uncompleted = 'l',

	/** @param {number} tasklist_index `number` */
	clear_tasks = 'm',

	/** @param {number} tasklist_index `number` */
	delete_completed_task = 'n',

	/** @param {number?} tasklist_index `number?` */
	copy_tasks = 'o',

	/** @param {Event} event `Event` */
	add_label = 'p',

	/**
	@param {Event} event `Event`
	@param {TaskLabel} label `TaskLabel` */
	edit_label = 'q',

	/** @param {TaskLabel} label `TaskLabel` */
	delete_label = 'r',

	/** @param {Event} event `Event` */
	show_labels_options = 's',

	/**
	@param {FileList} files `FileList`
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@returns {Promise<TaskFileMetaData[]>} `Promise<TaskFileMetaData[]>` */
	add_files = 't',

	/**
	@param {Event} event `Event`
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} file_index `number` */
	download_file = 'u',

	/**
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} file_index `number` */
	edit_file = 'v',

	/**
	@param {SubTask} subtask `SubTask`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} subtask_index `number` */
	edit_subtask = 'w',

	/**
	@param {Event} event `Event`
	@param {TaskFileMetaData} file `TaskFileMetaData`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} file_index `number`
	@returns {Promise<Blob | null>} `Promise<Blob | null>`*/
	get_file_blob = 'x',

	/**
	@param {SubTask} subtask `SubTask`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@returns {SubTask} `Promise<SubTask>`*/
	add_subtask = 'y',

	/** @param {Event} event `Event` */
	add_tasklist = 'z',

	/**
	@param {Event} event `Event`
	@param {number} tasklist_index `number` */
	delete_taskList = 'aa',

	/**
	@param {Event} event `Event`
	@param {number} tasklist_index `number` */
	rename_taskList = 'ab',

	/**
	@param {Task} task `Task`
	@param {number} tasklist_index `number`
	@param {number} task_index `number`
	@param {number} target_tasklist_index `number` */
	move_task = 'ac',

	get_all_task = 'ad',
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