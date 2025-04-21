// Browser compatibility: https://caniuse.com/mdn-api_eyedropper
// API source           : https://wicg.github.io/eyedropper-api/#eyedropper-interface

export interface ColorSelectionResult {
	sRGBHex: string
}

export interface ColorSelectionOptions {
	signal: AbortSignal
}

export interface EyeDropper {
	open(options?: ColorSelectionOptions): Promise<ColorSelectionResult>
}