/**
 * ```txt
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
export enum FlyoutPosition {
    leftTop = 'lt',
    leftCenterToBottom = 'lctb',
    leftCenter = 'lc',
    leftCenterToTop = 'lctp',
    leftBottom = 'lb',
    rightTop = 'rt',
    rightCenterToBottom = 'rctb',
    rightCenter = 'rc',
    rightCenterToTop = 'rctt',
    rightBottom = 'rb',
    centerTopToRight = 'cttr',
    centerTop = 'ct',
    centerTopToLeft = 'cttl',
    centerBottomToRight = 'cbtr',
    centerBottom = 'cb',
    centerBottomToLeft = 'cbtl',
    centerCenterLeftTop = 'cclt',
    centerCenterLeft = 'ccl',
    centerCenterLeftBottom = 'cclb',
    centerCenterTop = 'cct',
    centerCenter = 'cc',
    centerCenterBottom = 'ccb',
    centerCenterRightTop = 'ccrt',
    centerCenterRight = 'ccr',
    centerCenterRightBottom = 'ccrb'
}