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
    LEFT_TOP,
    LEFT_CENTER_TO_BOTTOM,
    LEFT_CENTER,
    LEFT_CENTER_TO_TOP,
    LEFT_BOTTOM,
    RIGHT_TOP,
    RIGHT_CENTER_TO_BOTTOM,
    RIGHT_CENTER,
    RIGHT_CENTER_TO_TOP,
    RIGHT_BOTTOM,
    CENTER_TOP_TO_RIGHT,
    CENTER_TOP,
    CENTER_TOP_TO_LEFT,
    CENTER_BOTTOM_TO_RIGHT,
    CENTER_BOTTOM,
    CENTER_BOTTOM_TO_LEFT,
    CENTER_CENTER_LEFT_TOP,
    CENTER_CENTER_LEFT,
    CENTER_CENTER_LEFT_BOTTOM,
    CENTER_CENTER_TOP,
    CENTER_CENTER,
    CENTER_CENTER_BOTTOM,
    CENTER_CENTER_RIGHT_TOP,
    CENTER_CENTER_RIGHT,
    CENTER_CENTER_RIGHT_BOTTOM
}