import { formatNumber } from "@/utils/number"
import { SettingsStore } from "./_settings"

export function formatOutput(num: number) {
	const decimal = SettingsStore.value.decimalFormat
	const thousand = SettingsStore.value.groupingFormat
	return (/[eE]/.test(num.toString())
		? num.toString().toUpperCase()
		: formatNumber(num, {decimal, thousand })
	)
}