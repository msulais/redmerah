import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ColorPickerMode } from "./_enums"
import { APP_COLOR_PICKER } from "@/constants/apps"
import { hexToRgb, rgbToCmyk, rgbToHsl, rgbToHsv, rgbToHwb } from "@/utils/color"
import type { AppItem } from "@/types/apps"

export const APP: AppItem = APP_COLOR_PICKER
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_PICKER_MODE: ColorPickerMode = ColorPickerMode.rectangle
export const DEFAULT_COLOR = APP_COLOR_PICKER.color
export const DEFAULT_COLOR_IN_VALUE = Number.parseInt(DEFAULT_COLOR.replace(/[^A-Fa-f0-9]/g, ''), 16)
export const DEFAULT_COLOR_IN_RGB = hexToRgb(DEFAULT_COLOR)
export const DEFAULT_COLOR_IN_HSL = rgbToHsl(DEFAULT_COLOR_IN_RGB)
export const DEFAULT_COLOR_IN_HSV = rgbToHsv(DEFAULT_COLOR_IN_RGB)
export const DEFAULT_COLOR_IN_CMYK = rgbToCmyk(DEFAULT_COLOR_IN_RGB)
export const DEFAULT_COLOR_IN_HWB = rgbToHwb(DEFAULT_COLOR_IN_RGB)