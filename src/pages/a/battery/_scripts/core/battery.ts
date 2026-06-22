import * as BrDialog from '@/web-components/components/br-dialog.js'
import * as Ids from '../shared/ids.enum.js'
import type { BatteryManager } from "@/interfaces/battery"
import { $ } from "./dom-utils"

const _ref_textLevel = $(Ids.LevelText) as HTMLHeadingElement
const _ref_statusText = $(Ids.StatusText) as HTMLDivElement
const _ref_container = $(Ids.Container) as HTMLDivElement
const _ref_warningDialog = $(Ids.WarningDialog) as BrDialog.BiruDialogElement

function _checkBrowserCompatibility(): void {
	const supported = 'getBattery' in navigator
	if (supported) {
		return
	}

	_ref_warningDialog.biru.open()
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