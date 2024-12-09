import { EncodingMode, ErrorCorrectionLevel } from "./_enums"
import type { Settings } from "./_types"

export const DEFAULT_COLOR: Settings['color'] = '#000000'
export const DEFAULT_BACKGROUND_COLOR: Settings['background_color'] = '#FFFFFF'
export const DEFAULT_ENCODING_MODE: Settings['encoding_mode'] = EncodingMode.auto
export const DEFAULT_ERROR_CORRECTION_LEVEL: Settings['error_correction_level'] = ErrorCorrectionLevel.medium
export const DEFAULT_MARGIN: Settings['margin'] = 4
export const DEFAULT_VERSION: Settings['version'] = null
export const MINIMUM_QR_CODE_IMAGE_SIZE = 512