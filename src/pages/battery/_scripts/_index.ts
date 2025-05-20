import type { BatteryManager } from '@/interfaces/battery'
import appbar from './_appbar'
import { ElementIds, ID } from './_enums'
import { updateIconRef } from '@/native-components/Icon'
import { isAnimationAllowed } from '@/utils/animation'
import { elementAnimateUpdateText } from '@/utils/element'
import { IconCodes } from '@/enums/icons'

const $ = (id: string) => document.getElementById(id)

function checkBrowserCompatibility(): void {
	const supported = 'getBattery' in navigator
	if (supported) return

	const dialog = $(ID + ElementIds.dialogBrowserNotSupported) as HTMLDialogElement
	dialog.showModal()
}

function initEvents(): void {
	const supported = 'getBattery' in navigator
	if (!supported) return

	const levelTextRef = $(ID + ElementIds.bodyLevelText) as HTMLHeadingElement
	const statusIconRef = $(ID + ElementIds.bodyStatusIcon) as HTMLElement
	const statusTextRef = $(ID + ElementIds.bodyStatusText) as HTMLSpanElement
	;((navigator as any).getBattery() as Promise<BatteryManager>).then((battery) => {
		const update = () => {
			const charging = battery.charging
			if (isAnimationAllowed()) {
				elementAnimateUpdateText(levelTextRef, (battery.level * 100) + '%')
				elementAnimateUpdateText(statusTextRef, charging? 'Charging' : 'Discharging')
			}
			else {
				levelTextRef.textContent = (battery.level * 100) + '%'
				statusTextRef.textContent = charging? 'Charging' : 'Discharging'
			}
			updateIconRef(statusIconRef, {
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

function main(): void {
	appbar()
	checkBrowserCompatibility()
	initEvents()
}

main()