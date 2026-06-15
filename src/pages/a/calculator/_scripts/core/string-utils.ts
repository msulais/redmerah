import * as Settings from "./settings"
import { formatNumber } from "@/utils/number"

export function formatOutput(num: number) {
	const decimal = Settings.sg_decimalFormat()
	const thousand = Settings.sg_groupingFormat()
	return (/[eE]/.test(num.toString())
		? num.toString().toUpperCase()
		: formatNumber(num, 3, {decimal, thousand})
	)
}