/**
 * ```
 *        |            |                      |
 *        |      LEFT  |        CENTER        |  RIGHT
 * —————— + —————————— + ———————————————————— + ———————
 *        |
 *        |            ^                      ^
 * TOP    |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 *        |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 * CENTER |     [<^v ] | [^v> ] [<^v>] [<^v ] | [^v> ]
 *        |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 * BOTTOM |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 *        |            v                      v
 * ```
 */
export enum PopoverPosition {
    LEFT_TOP = 'lt',
    LEFT_CENTER_TO_BOTTOM = 'lctb',
    LEFT_CENTER = 'lc',
    LEFT_CENTER_TO_TOP = 'lctp',
    LEFT_BOTTOM = 'lb',
    RIGHT_TOP = 'rt',
    RIGHT_CENTER_TO_BOTTOM = 'rctb',
    RIGHT_CENTER = 'rc',
    RIGHT_CENTER_TO_TOP = 'rctt',
    RIGHT_BOTTOM = 'rb',
    CENTER_TOP_TO_RIGHT = 'cttr',
    CENTER_TOP = 'ct',
    CENTER_TOP_TO_LEFT = 'cttl',
    CENTER_BOTTOM_TO_RIGHT = 'cbtr',
    CENTER_BOTTOM = 'cb',
    CENTER_BOTTOM_TO_LEFT = 'cbtl',
    CENTER_CENTER_LEFT_TOP = 'cclt',
    CENTER_CENTER_LEFT = 'ccl',
    CENTER_CENTER_LEFT_BOTTOM = 'cclb',
    CENTER_CENTER_TOP = 'cct',
    CENTER_CENTER = 'cc',
    CENTER_CENTER_BOTTOM = 'ccb',
    CENTER_CENTER_RIGHT_TOP = 'ccrt',
    CENTER_CENTER_RIGHT = 'ccr',
    CENTER_CENTER_RIGHT_BOTTOM = 'ccrb'
}

export enum Position {
    top = 'top', 
    right = 'right', 
    bottom = 'bottom', 
    left = 'left'
}