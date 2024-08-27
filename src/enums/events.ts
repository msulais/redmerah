export enum BodyEvents {
    /** @param element `HTMLDivElement` */
    openPopover = 'on-open-popover', 
    
    /** @param element `HTMLDivElement` */
    closePopover = 'on-close-popover', 
    
    /** @param element `HTMLDialogElement` */
    openModal = 'on-open-modal', 

    /** @param element `HTMLDialogElement` */
    closeModal = 'on-close-modal',
    
    openTextTooltip = 'on-open-text-tooltip',
    closeTextTooltip = 'on-close-text-tooltip',
    updatePointerTextTooltip = 'on-update-pointer-text-tooltip',
    
    /** @param emoji `Emoji` */
    addRecentEmoji = 'on-add-recent-emoji',

    /** @param element `HTMLDialogElement | HTMLDivElement` */
    getRecentEmoji = 'on-get-recent-emoji',
}