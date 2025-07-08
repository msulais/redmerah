import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { EncodingMode, ErrorCorrectionLevel, Pages, QRVersion } from "./_enums"
import type { HEXColor } from "@/types/color"

export const DEFAULT_PAGE: Pages = Pages.generate
export const DEFAULT_DATA = 'https://www.redmerah.com/qr-code'
export const DEFAULT_THEME: PlatformThemeMode = PlatformThemeMode.auto
export const DEFAULT_ANIMATION: PlatformAnimationMode = PlatformAnimationMode.auto
export const DEFAULT_VERSION: QRVersion = QRVersion.auto
export const DEFAULT_ENCODING_MODE: EncodingMode = EncodingMode.auto
export const DEFAULT_ERROR_CORRECTION_LEVEL: ErrorCorrectionLevel = ErrorCorrectionLevel.medium
export const DEFAULT_MARGIN: number = 4
export const DEFAULT_COLOR: HEXColor = '#000000'
export const DEFAULT_BACKGROUND_COLOR: HEXColor = '#FFFFFF'
export const SCREEN_WIDTH_SMALL = 650