import type { BatteryManager } from '@/interfaces/battery'
import appbar from './_appbar'
import { ElementIds } from './_enums'
import { updateIconRef } from '@/native-components/Icon'
import { isAnimationAllowed } from '@/utils/animation'
import { animateUpdateTextElement } from '@/utils/element'
import { IconCodes } from '@/enums/icons'

const $ = (id: string) => document.getElementById(id)

function _checkBrowserCompatibility(): void {
	const supported = 'getBattery' in navigator
	if (supported) return

	const dialog = $(ElementIds.dialogBrowserNotSupported) as HTMLDialogElement
	dialog.showModal()
}

function _initEvents(): void {
	const supported = 'getBattery' in navigator
	if (!supported) return

	const levelTextRef = $(ElementIds.bodyLevelText) as HTMLHeadingElement
	const statusIconRef = $(ElementIds.bodyStatusIcon) as HTMLElement
	const statusTextRef = $(ElementIds.bodyStatusText) as HTMLSpanElement
	;((navigator as any).getBattery() as Promise<BatteryManager>).then((battery) => {
		const update = () => {
			const charging = battery.charging
			if (isAnimationAllowed()) {
				animateUpdateTextElement(levelTextRef, (battery.level * 100) + '%')
				animateUpdateTextElement(statusTextRef, charging? 'Charging' : 'Discharging')
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
	_checkBrowserCompatibility()
	_initEvents()
}

main()