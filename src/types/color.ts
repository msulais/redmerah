export type HSLColor = {

    /**
     * 0-1
     */
    h: number
    
    /**
     * 0-1
     */
    s: number
    
    /**
     * 0-1
     */
    l: number
}

export type RGBColor = {
    
    /**
     * 0-255
     */
    r: number 
    
    /**
     * 0-255
     */
    g: number 
    
    /**
     * 0-255
     */
    b: number
}

export type HSVColor = {
    /**
     * 0-1
     */
    h: number
    
    /**
     * 0-1
     */
    s: number
    
    /**
     * 0-1
     */
    v: number
}

export type HEXColor = `#${string}`