import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import * as RandomizerNumber from './randomizer-number.js'

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

export const DEFAULT_NUMBER_COUNT = 8
export const DEFAULT_NUMBER_DIGITS = 0
export const DEFAULT_NUMBER_TYPE: RandomizerNumber.NumberTypes = RandomizerNumber.NumberTypes.Decimal
export const DEFAULT_NUMBER_PREFIX = ''
export const DEFAULT_NUMBER_SUFFIX = ''
export const DEFAULT_NUMBER_SEPARATOR = ', '
export const DEFAULT_NUMBER_MIN = 0
export const DEFAULT_NUMBER_MAX = 0xffff
export const DEFAULT_NUMBER_REPEAT = true
export const DEFAULT_NUMBER_SORT: RandomizerNumber.SortDirection = RandomizerNumber.SortDirection.None
export const DEFAULT_NUMBER_OUTPUT = '19783, 3086, 42351, 3081, 5264, 38401, 24394, 19826'