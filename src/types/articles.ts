export type Heading = {
    element: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | string
    id: string
    content: string
}

export type HTMLmd<T = {}> = {
    data: T | object
    content: string
    headings: Heading[]
}