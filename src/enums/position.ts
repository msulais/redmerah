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
export const enum FlyoutPosition {
	left_top = 'lt',
	left_center_to_bottom = 'lctb',
	left_center = 'lc',
	left_center_to_top = 'lctp',
	left_bottom = 'lb',
	right_top = 'rt',
	right_center_to_bottom = 'rctb',
	right_center = 'rc',
	right_center_to_top = 'rctt',
	right_bottom = 'rb',
	center_top_to_right = 'cttr',
	center_top = 'ct',
	center_top_to_left = 'cttl',
	center_bottom_to_right = 'cbtr',
	center_bottom = 'cb',
	center_bottom_to_left = 'cbtl',
	center_center_left_top = 'cclt',
	center_center_left = 'ccl',
	center_center_left_bottom = 'cclb',
	center_center_top = 'cct',
	center_center = 'cc',
	center_center_bottom = 'ccb',
	center_center_right_top = 'ccrt',
	center_center_right = 'ccr',
	center_center_right_bottom = 'ccrb'
}