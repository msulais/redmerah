import { _auto, _medium } from "@/constants/string"
import { EncodingMode, ErrorCorrectionLevel } from "./_enums"
import type { Settings } from "./_types"

export const DEFAULT_COLOR: Settings['color'] = '#000000'
export const DEFAULT_BACKGROUND_COLOR: Settings['backgroundColor'] = '#FFFFFF'
export const DEFAULT_ENCODING_MODE: Settings['encodingMode'] = EncodingMode[_auto]
export const DEFAULT_ERROR_CORRECTION_LEVEL: Settings['errorCorrectionLevel'] = ErrorCorrectionLevel[_medium]
export const DEFAULT_MARGIN: Settings['margin'] = 4
export const DEFAULT_VERSION: Settings['version'] = null
export const MINIMUM_QR_CODE_IMAGE_SIZE = 512