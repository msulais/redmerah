import type { BatteryManager } from "@/interfaces/battery"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { updateIconRef } from "@/components/Icon"
import { IconCodes } from "@/enums/icons"

const _textLevelRef = $(ElementIds.bd_levelText) as HTMLHeadingElement
const _statusIconRef = $(ElementIds.bd_statusIcon) as HTMLElement
const _statusTextRef = $(ElementIds.bd_statusText) as HTMLSpanElement

function _checkBrowserCompatibility(): void {
	const supported = 'getBattery' in navigator
	if (supported) return

	const dialog = $(ElementIds.dlg_browseNotSupported) as HTMLDialogElement
	dialog.showModal()
}

function _initEvents(): void {
	;((navigator as any).getBattery() as Promise<BatteryManager>).then((battery) => {
		const update = () => {
			const charging = battery.charging
			_textLevelRef.textContent = (battery.level * 100) + '%'
			_statusTextRef.textContent = charging? 'Charging' : 'Discharging'
			updateIconRef(_statusIconRef, {
				IconCode: charging? IconCodes.batteryCharge : IconCodes.battery5
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