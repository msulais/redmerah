import type { ECMA } from "terser"

export type Settings = {
	textWrap: boolean
	fontSize: number
	minifyOptions: {
		beautify: boolean
		ecma: ECMA
		module: boolean
		topLevel: boolean
		ie8: boolean
		keepClassNames: boolean
		keepFunctionNames: boolean
		safari10: boolean
	}
}