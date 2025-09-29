import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { Pages } from "./_enums"
import { pxToRem } from "@/utils/css"
import type { AppItem } from "@/types/apps"
import { APP_CSS_UNIT_CONVERTER } from "@/constants/apps"
import { AngleUnits, LengthUnits, TimeUnits } from "./_units"

export const APP: AppItem = APP_CSS_UNIT_CONVERTER
export const DEFAULT_PAGE: Pages = Pages.length
export const DEFAULT_THEME: PlatformThemeMode = PlatformThemeMode.auto
export const DEFAULT_ANIMATION: PlatformAnimationMode = PlatformAnimationMode.auto
export const DEFAULT_PX_PER_REM = 16
export const DEFAULT_PX_PER_PERCENTAGE = 820
export const DEFAULT_PX_PER_VIEWPORT_HEIGHT = 820
export const DEFAULT_PX_PER_VIEWPORT_WIDTH = 1360
export const DEFAULT_LENGTH_INPUT = 300
export const DEFAULT_LENGTH_INPUT_UNIT = LengthUnits.px
export const DEFAULT_LENGTH_OUTPUT = DEFAULT_LENGTH_INPUT / DEFAULT_PX_PER_REM
export const DEFAULT_LENGTH_OUTPUT_UNIT = LengthUnits.rem
export const DEFAULT_ANGLE_INPUT = 200
export const DEFAULT_ANGLE_INPUT_UNIT = AngleUnits.deg
export const DEFAULT_ANGLE_OUTPUT = DEFAULT_ANGLE_INPUT * Math.PI / 180
export const DEFAULT_ANGLE_OUTPUT_UNIT = AngleUnits.rad
export const DEFAULT_TIME_INPUT = 0.25
export const DEFAULT_TIME_INPUT_UNIT = TimeUnits.s
export const DEFAULT_TIME_OUTPUT = DEFAULT_TIME_INPUT * 1000
export const DEFAULT_TIME_OUTPUT_UNIT = TimeUnits.ms
export const SCREEN_WIDTH_SMALL = pxToRem(650)