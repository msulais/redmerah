import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import { AngleUnits, LengthUnits, TimeUnits } from './units'

export const APP = Apps.APP_CSS_UNIT_CONVERTER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_PX_PER_REM = 16
export const DEFAULT_PX_PER_100_PERCENT = 820
export const DEFAULT_PX_PER_100_VIEWPORT_HEIGHT = 820
export const DEFAULT_PX_PER_100_VIEWPORT_WIDTH = 1360
export const DEFAULT_LENGTH_INPUT = '300'
export const DEFAULT_LENGTH_INPUT_UNIT = LengthUnits.px
export const DEFAULT_LENGTH_OUTPUT = 300 / DEFAULT_PX_PER_REM
export const DEFAULT_LENGTH_OUTPUT_UNIT = LengthUnits.rem
export const DEFAULT_ANGLE_INPUT = '200'
export const DEFAULT_ANGLE_INPUT_UNIT = AngleUnits.deg
export const DEFAULT_ANGLE_OUTPUT = 200 * Math.PI / 180
export const DEFAULT_ANGLE_OUTPUT_UNIT = AngleUnits.rad
export const DEFAULT_TIME_INPUT = '0.25'
export const DEFAULT_TIME_INPUT_UNIT = TimeUnits.s
export const DEFAULT_TIME_OUTPUT = 0.25 * 1000
export const DEFAULT_TIME_OUTPUT_UNIT = TimeUnits.ms