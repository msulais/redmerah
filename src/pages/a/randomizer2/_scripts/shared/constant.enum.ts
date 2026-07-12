import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import * as RandomizerColors from './randomizer-colors.js'
import * as RandomizerNumber from './randomizer-number.js'
import type { HEXColor } from '@/types/color.js'

export const APP = Apps.APP_RANDOMIZER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_INSTANT_RESULT = false

export const DEFAULT_STRING_OUTPUT = 'LVSskEwIlSKo5K3691Q7CeluR4CmI8Bj1eWe54AJAc84ITAeEQoXxqj5UWKQBtIn'
export const DEFAULT_STRING_LENGTH = 64
export const DEFAULT_STRING_CUSTOM = ''
export const DEFAULT_STRING_LOWERCASE = true
export const DEFAULT_STRING_UPPERCASE = true
export const DEFAULT_STRING_NUMBERS = true
export const DEFAULT_STRING_SYMBOLS = false

export const DEFAULT_NUMBER_COUNT = 64
export const DEFAULT_NUMBER_DIGITS = 0
export const DEFAULT_NUMBER_TYPE: RandomizerNumber.NumberTypes = RandomizerNumber.NumberTypes.Decimal
export const DEFAULT_NUMBER_PREFIX = ''
export const DEFAULT_NUMBER_SUFFIX = ''
export const DEFAULT_NUMBER_SEPARATOR = ', '
export const DEFAULT_NUMBER_MIN = 0
export const DEFAULT_NUMBER_MAX = 0xffff
export const DEFAULT_NUMBER_REPEAT = true
export const DEFAULT_NUMBER_SORT: RandomizerNumber.SortDirection = RandomizerNumber.SortDirection.None
export const DEFAULT_NUMBER_OUTPUT = '60339, 40737, 55428, 56598, 62275, 42659, 38508, 38927, 60092, 30496, 12124, 57621, 35644, 27520, 13145, 21203, 45524, 6434, 20156, 27879, 27605, 43963, 2684, 63446, 41128, 41574, 3164, 50387, 55176, 11918, 25830, 48472, 33582, 57393, 33352, 32804, 37010, 42680, 49228, 43145, 2545, 35442, 10486, 20084, 10221, 11485, 28339, 62318, 2382, 18593, 37110, 2060, 21532, 40996, 27337, 32517, 38060, 1844, 20254, 55453, 33483, 13108, 65057, 47013'

export const DEFAULT_COLORS_SPACE: RandomizerColors.ColorSpaces = RandomizerColors.ColorSpaces.RGB
export const DEFAULT_COLORS_COUNT = 16
export const DEFAULT_COLORS_HEX_MIN = 0
export const DEFAULT_COLORS_HEX_MAX = 0xffffff
export const DEFAULT_COLORS_HSL_H_MIN = 0
export const DEFAULT_COLORS_HSL_H_MAX = 360
export const DEFAULT_COLORS_HSL_S_MIN = 0
export const DEFAULT_COLORS_HSL_S_MAX = 100
export const DEFAULT_COLORS_HSL_L_MIN = 0
export const DEFAULT_COLORS_HSL_L_MAX = 100
export const DEFAULT_COLORS_RGB_R_MIN = 0
export const DEFAULT_COLORS_RGB_R_MAX = 0xff
export const DEFAULT_COLORS_RGB_G_MIN = 0
export const DEFAULT_COLORS_RGB_G_MAX = 0xff
export const DEFAULT_COLORS_RGB_B_MIN = 0
export const DEFAULT_COLORS_RGB_B_MAX = 0xff
export const DEFAULT_COLORS_OUTPUT: HEXColor[] = [
	"#275726", "#93684B", "#B56F27", "#B129AE",
	"#8EE626", "#75055F", "#FDEFC9", "#ACFBDA",
	"#F6F5E9", "#5B80C6", "#27E4D6", "#057D6F",
	"#4EEA66", "#490285", "#612043", "#B04DC2"
]