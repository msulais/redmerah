export type ComponentEvent<T = Event, U = HTMLElement, V = Element> = T & {
    currentTarget: U 
    target: V
}