import type { BatteryManager } from "@/interfaces/battery"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { CIcon } from "@/components/Icon"
import { IconCodes } from "@/enums/icons"
import { CDialog } from "@/components/Dialog"

const _ref_textLevel = $(ElementIds.bd_levelText) as HTMLHeadingElement
const _ref_statusIcon = $(ElementIds.bd_statusIcon) as CIcon.CElement
const _ref_statusText = $(ElementIds.bd_statusText) as HTMLSpanElement

function _checkBrowserCompatibility(): void {
	const supported = 'getBattery' in navigator
	if (supported) return

	const dialog = $(ElementIds.dlg_browseNotSupported) as CDialog.CElement
	dialog.showModal()
}

function _initEvents(): void {
	const supported = 'getBattery' in navigator
	if (!supported) {return}

	;((navigator as any).getBattery() as Promise<BatteryManager>).then((battery) => {
		const update = () => {
			const charging = battery.charging
			_ref_textLevel.textContent = Math.round(battery.level * 100) + '%'
			_ref_statusText.textContent = charging? 'Charging' : 'Discharging'
			CIcon.update(_ref_statusIcon, {
				Icon: {code: charging? IconCodes.batteryCharge : IconCodes.battery5}
			})
		}
		update()
		battery.addEventListener('chargingchange', () => update())
		battery.addEventListener('levelchange', () => update())
		battery.addEventListener('chargingtimechange', () => update())
		battery.addEventListener('dischargingtimechange', () => update())
	}).catch(() => {
		// TODO: show message
	})
}

export default () => {
	_checkBrowserCompatibility()
	_initEvents()
}