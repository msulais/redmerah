import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as ColorPickerMode from './modes.enum.js'
import { APP_COLOR_PICKER } from "@/constants/apps"
import { hexToRgb, rgbToCmyk, rgbToHsl, rgbToHsv, rgbToHwb } from '@/utils/color'
import type { EnumOf } from '@/types/collections.js'

export const APP = APP_COLOR_PICKER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_PICKER_MODE: EnumOf<typeof ColorPickerMode> = ColorPickerMode.Rectangle
export const DEFAULT_COLOR = APP_COLOR_PICKER.color
export const DEFAULT_COLOR_IN_VALUE = Number.parseInt(DEFAULT_COLOR.replace(/[^A-Fa-f0-9]/g, ''), 16)
export const DEFAULT_COLOR_IN_RGB = hexToRgb(DEFAULT_COLOR)
export const DEFAULT_COLOR_IN_HSL = rgbToHsl(DEFAULT_COLOR_IN_RGB)
export const DEFAULT_COLOR_IN_HSV = rgbToHsv(DEFAULT_COLOR_IN_RGB)
export const DEFAULT_COLOR_IN_CMYK = rgbToCmyk(DEFAULT_COLOR_IN_RGB)
export const DEFAULT_COLOR_IN_HWB = rgbToHwb(DEFAULT_COLOR_IN_RGB)