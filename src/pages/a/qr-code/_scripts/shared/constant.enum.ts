import * as BrTheme from '@/components/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import type { HEXColor } from '@/types/color'
import { EncodingMode, ErrorCorrectionLevel } from './qrcode'

export const APP = Apps.APP_QR_CODE
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_DATA = 'https://www.redmerah.com' + APP.link
export const DEFAULT_AUTO_VERSION: boolean = true
export const DEFAULT_VERSION: number = 1
export const DEFAULT_ENCODING_MODE: EncodingMode = EncodingMode.Auto
export const DEFAULT_ERROR_CORRECTION_LEVEL: ErrorCorrectionLevel = ErrorCorrectionLevel.Medium
export const DEFAULT_MARGIN: number = 4
export const DEFAULT_COLOR: HEXColor = '#000000'
export const DEFAULT_BACKGROUND_COLOR: HEXColor = '#FFFFFF'