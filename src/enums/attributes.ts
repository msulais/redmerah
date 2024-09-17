export enum RootAttributes {
    theme = 'data-theme',
    corner = 'data-corner',
    platform = 'data-platform'
}

export enum BodyAttributes {
    modalListener = 'data-modal-listener',
    popoverListener = 'data-popover-listener',
    tooltipListener = 'data-tooltip-listener',
    emojiListener = 'data-emoji-listener',

    /**
     * Disable all element pointer event. Except element that has [data-keep-pointer-event].
     */
    noPointerEvent = 'data-no-pointer-event'
}

export enum PopoverAttributes {
    anchorId = 'data-anchor-id',
    position = 'data-position',
    padding = 'data-padding',
    open = 'data-open',
    hasMaxWidth = 'data-has-max-width',
    hasMaxHeight = 'data-has-max-height',
    notAllowHideAnchor = 'data-not-allow-hide-anchor',
    move = 'data-move',
    popover = 'data-popover',
    gap = 'data-gap',
    focus = 'data-focus',
    focusTimeoutId = 'data-focus-timeout-id'
}

export enum ModalAttributes {
    open = 'data-open',
    modal = 'data-modal',
    focus = 'data-focus',
    focusTimeoutId = 'data-focus-timeout-id'
}