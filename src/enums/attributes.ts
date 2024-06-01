export enum RootAttributes {
    theme = 'data-theme'
}

export enum BodyAttributes {
    flyoutListener = 'data-flyout-listener',
    flyoutOpen = 'data-flyout-open',

    // Disable all element pointer event. Except element
    // that has [data-keep-pointer-event] attribute.
    noPointerEvent = 'data-no-pointer-event'
}

export enum PopoverAttributes {
    anchorId = 'data-anchor-id',
    position = 'data-position',
    padding = 'data-padding',
    open = 'data-open',
    move = 'data-move',
    popover = 'data-popover',
    gap = 'data-gap'
}

export enum ModalAttributes {
    open = 'data-open', 
    modal = 'data-modal'
}