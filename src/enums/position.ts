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
	LeftTop = 'lt',
	LeftCenterToBottom = 'lctb',
	LeftCenter = 'lc',
	LeftCenterToTop = 'lctp',
	LeftBottom = 'lb',
	RightTop = 'rt',
	RightCenterToBottom = 'rctb',
	RightCenter = 'rc',
	RightCenterToTop = 'rctt',
	RightBottom = 'rb',
	CenterTopToRight = 'cttr',
	CenterTop = 'ct',
	CenterTopToLeft = 'cttl',
	CenterBottomToRight = 'cbtr',
	CenterBottom = 'cb',
	CenterBottomToLeft = 'cbtl',
	CenterCenterLeftTop = 'cclt',
	CenterCenterLeft = 'ccl',
	CenterCenterLeftBottom = 'cclb',
	CenterCenterTop = 'cct',
	CenterCenter = 'cc',
	CenterCenterBottom = 'ccb',
	CenterCenterRightTop = 'ccrt',
	CenterCenterRight = 'ccr',
	CenterCenterRightBottom = 'ccrb'
}