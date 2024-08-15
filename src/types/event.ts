export type ComponentEvent<EventType = Event, CurrentTarget = HTMLElement, Target = Element> = EventType & {
    currentTarget: CurrentTarget
    target: Target
}