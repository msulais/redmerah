import type { HEXColor } from "@/types/color";
import type { SubTask, Task, TaskFileMetaData, TaskLabel, TaskList } from "./_types";

export enum Commands {
    toggle_navigation_expand = 'a',

    /** @param {Pages | number} page `Pages | number` either page or list id */
    change_page = 'b',
    
    /** @param {SortBy} sortBy `SortBy` */
    change_sortBy = 'c',
    
    /** @param {SortMode} sortBy `SortMode` */
    change_sortMode = 'd',
    
    /** 
    @param {Task} task `Task`
    @param {number} taskListIndex `number` */
    add_task = 'e',
    
    /** 
    Don't use this to edit single subtask/file. Use `Commands.edit_subtask`/`Commands.edit_file` instead.
    @param {Task} task `Task`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number` */
    edit_task = 'g',
    
    /** 
    @param {Task} task `Task`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number` */
    delete_task = 'h',
    
    /** @param {boolean | undefined} value `boolean | undefined` */
    toggle_deleteTaskWarning = 'i', 
    
    /** @param {Pages[]} pages `Pages[]` */
    change_hiddenNavigation = 'j', 
    
    /** @param {number} taskListIndex `number` */
    mark_all_completed = 'k',

    /** @param {number} taskListIndex `number` */
    mark_all_uncompleted = 'l',

    /** @param {number} taskListIndex `number` */
    clear_tasks = 'm',

    /** @param {number} taskListIndex `number` */
    delete_completed_task = 'n', 

    /** @param {number} taskListIndex `number` */
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
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number` 
    @returns {Promise<TaskFileMetaData[]>} `Promise<TaskFileMetaData[]>` */
    add_files = 't', 
    
    /** 
    @param {TaskFileMetaData} file `TaskFileMetaData`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number`
    @param {number} fileIndex `number` */
    download_file = 'u', 
    
    /** 
    @param {TaskFileMetaData} file `TaskFileMetaData`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number`
    @param {number} fileIndex `number` */
    edit_file = 'v', 
    
    /** 
    @param {SubTask} subtask `SubTask`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number`
    @param {number} subtaskIndex `number` */
    edit_subtask = 'w', 
    
    /** 
    @param {TaskFileMetaData} file `TaskFileMetaData`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number`
    @param {number} fileIndex `number` 
    @returns {Promise<Blob | null>} `Promise<Blob | null>`*/
    get_file_blob = 'x',
    
    /** 
    @param {SubTask} subtask `SubTask`
    @param {number} taskListIndex `number`
    @param {number} taskIndex `number` 
    @returns {SubTask} `Promise<SubTask>`*/
    add_subtask = 'y', 
    
    /** @param {Event} event `Event` */
    add_taskList = 'z', 
    
    /** 
    @param {Event} event `Event`
    @param {number} taskListIndex `number` */
    delete_taskList = 'aa', 
    
    /** 
    @param {Event} event `Event`
    @param {number} taskListIndex `number` */
    rename_taskList = 'ab', 
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
    creationDate = 'creation_date', 
    completed = 'completed',
    uncompleted = 'uncompleted'
}

export enum SortMode {
    ascending = 'asc',
    descending = 'desc'
}