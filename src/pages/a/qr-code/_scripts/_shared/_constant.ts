import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { EncodingMode, ErrorCorrectionLevel, Pages, QRVersion } from "./_enums"
import type { HEXColor } from "@/types/color"
import { pxToRem } from "@/utils/css"
import type { AppItem } from "@/types/apps"
import { APP_QR_CODE } from "@/constants/apps"

export const APP: AppItem = APP_QR_CODE
export const DEFAULT_PAGE: Pages = Pages.Generate
export const DEFAULT_DATA = 'https://www.redmerah.com/qr-code'
export const DEFAULT_THEME: PlatformThemeMode = PlatformThemeMode.Auto
export const DEFAULT_ANIMATION: PlatformAnimationMode = PlatformAnimationMode.Auto
export const DEFAULT_VERSION: QRVersion = QRVersion.Auto
export const DEFAULT_ENCODING_MODE: EncodingMode = EncodingMode.Auto
export const DEFAULT_ERROR_CORRECTION_LEVEL: ErrorCorrectionLevel = ErrorCorrectionLevel.Medium
export const DEFAULT_MARGIN: number = 4
export const DEFAULT_COLOR: HEXColor = '#000000'
export const DEFAULT_BACKGROUND_COLOR: HEXColor = '#FFFFFF'
export const SCREEN_WIDTH_SMALL = pxToRem(650)