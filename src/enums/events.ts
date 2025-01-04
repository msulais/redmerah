export enum BodyEvents {
	// TODO: use custom Element <div> for listener
	/** @param element `HTMLDivElement` */
	open_popover = 'on-open-popover',

	/** @param element `HTMLDivElement` */
	close_popover = 'on-close-popover',

	/** @param element `HTMLDialogElement` */
	open_modal = 'on-open-modal',

	/** @param element `HTMLDialogElement` */
	close_modal = 'on-close-modal',

	open_tooltip = 'on-open-text-tooltip',
	close_tooltip = 'on-close-text-tooltip',

	/** @param emoji `Emoji` */
	add_recent_emoji = 'on-add-recent-emoji',

	/** @param element `HTMLDialogElement | HTMLDivElement` */
	get_recent_emoji = 'on-get-recent-emoji',
}