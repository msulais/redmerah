import type { BatteryManager } from "@/interfaces/battery"
import { ElementIds } from "../shared/ids"
import { $ } from "./utils"
import { CDialog } from "@/components/Dialog"

const _ref_textLevel = $(ElementIds.bd_levelText) as HTMLHeadingElement
const _ref_statusText = $(ElementIds.bd_statusText) as HTMLDivElement
const _ref_container = $(ElementIds.bd_container) as HTMLDivElement

function _checkBrowserCompatibility(): void {
	const supported = 'getBattery' in navigator
	if (supported) {
		return
	}

	const dialog = $(ElementIds.dlg_browseNotSupported) as CDialog.CElement
	dialog.showModal()
}

function _initEvents(): void {
	const supported = 'getBattery' in navigator
	if (!supported) {
		return
	}

	;((navigator as any).getBattery() as Promise<BatteryManager>).then((battery) => {
		const update = () => {
			const charging = battery.charging
			const percentage = Math.round(battery.level * 100) + '%'
			_ref_textLevel.textContent = percentage
			_ref_statusText.textContent = charging? 'Charging' : 'Discharging'
			_ref_container.style.setProperty('--percentage', percentage)
		}
		update()
		battery.addEventListener('chargingchange', () => update())
		battery.addEventListener('levelchange', () => update())
		battery.addEventListener('chargingtimechange', () => update())
		battery.addEventListener('dischargingtimechange', () => update())
	}).catch((err) => {
		console.error(err)
	})
}

export default () => {
	_checkBrowserCompatibility()
	_initEvents()
}