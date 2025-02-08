import { createSignal, createUniqueId, For, onMount, type VoidComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

import type { USBDevice } from "@/interfaces/usb"
import { ICON_CONNECTOR, ICON_DELETE, ICON_DISMISS, ICON_WARNING } from "@/constants/icons"
import { stringLocaleCompare, stringToUpperCase } from "@/utils/string"
import { promiseDone } from "@/utils/object"
import { arrayLength, arrayPush, arraySome, arraySort, arraySplice } from "@/utils/array"
import { navigatorUSB } from "@/utils/navigator"
import { documentActive, documentBody } from "@/utils/document"
import { elementClick, elementDataset, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { eventListenerAdd, eventCurrentTarget } from "@/utils/event"
import { numberParse } from "@/utils/number"
import { removeSplashScreen } from "@/scripts/splash"
import { AppColors } from "@/enums/colors"
import { timeTimerSet } from "@/utils/time"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import Icon from "@/components/Icon"
import Toast, { closeToast, openToast } from "@/components/Toast"
import Tooltip from "@/components/Tooltip"
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const usb = navigatorUSB()
	const buttonConnectId = createUniqueId()
	const [devices, setDevices] = createStore<USBDevice[]>([])
	const [isBrowserNotSupport, setIsBrowserNotSupport] = createSignal<boolean>(false)
	let toastBrowserNotSupportRef: HTMLDivElement

	function updateDevice(device: USBDevice): void {
		if (arraySome(devices, d => d.productId === device.productId)) return

		setDevices(produce(devices => {
			arrayPush(devices, device)
			arraySort(devices, (a, b) => stringLocaleCompare(
				a.productName,
				b.productName
			))
		}))
	}

	function initUSBDevices(ev: Event): void {
		if (!usb) {
			setIsBrowserNotSupport(true)
			timeTimerSet(() => openToast(ev, toastBrowserNotSupportRef, {
				autoclose: false
			}))
			return
		}
		usb.ondisconnect = ev => {
			for (let i = 0; i < arrayLength(devices); i++) {
				if (devices[i] !== ev.device) continue

				setDevices(produce(devices => {
					arraySplice(devices, i, 1)
				}))
				break
			}
		}
		promiseDone(
			usb.getDevices(),
			devices => {
				for (const device of devices) updateDevice(device)
			}
		)
	}

	function connectUSBDevice(): void {
		promiseDone(
			navigatorUSB().requestDevice({filters:[]}),
			(device) => {
				updateDevice(device)
			}
		)
	}

	onMount(() => {
		let clicked = false
		eventListenerAdd(documentBody(), 'click', ev => {
			if (clicked) return;
			initUSBDevices(ev)
			removeSplashScreen()
			clicked = true
		})

		elementClick(documentBody())
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toastBrowserNotSupportRef = r}
			c:leading={<Icon c:code={ICON_WARNING}/>}
			c:trailing={<Tooltip>
				<IconButton
					data-tooltip="Close"
					c:code={ICON_DISMISS}
					c:variant={ButtonVariant.tonal}
					onClick={() => closeToast(toastBrowserNotSupportRef)}
				/>
			</Tooltip>}>
			Browser not supported. See <a
				style={{
					"text-decoration": 'underline',
					color: `rgb(${AppColors.accent})`
				}}
				target={"_blank"}
				rel={"noopener noreferrer"}
				href="https://caniuse.com/webusb">browser compatibility</a>.
		</Toast>
	</>)

	return (<main class={CSS.body}>
		<div
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) === 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonConnectId:
					connectUSBDevice()
					break
				default:
					const data_forget = elementDataset(button, 'forget')
					if (data_forget) {
						const i = numberParse(data_forget, true)
						return promiseDone(
							devices[i]?.forget(),
							() => setDevices(produce(devices => {
								arraySplice(devices, i, 1)
							}))
						)
					}
				}
			}}>
			<div class={CSS.body_connect}>
				<Button
					c:variant={ButtonVariant.filled}
					id={buttonConnectId}
					disabled={isBrowserNotSupport()}>
					<Icon c:code={ICON_CONNECTOR} c:filled/>
					Connect USB
				</Button>
			</div>
			<For each={devices}>{(device, i) =>
				<Expander
					class={CSS.body_usb_device}
					c:variant={ExpanderVariant.outlined}
					c:header={<ExpanderHeader>
						{device.productName.trim().length === 0? '<Unknown>' : device.productName}
					</ExpanderHeader>}>
					<ul>
						<li><span>Device class</span>: {device.deviceClass}</li>
						<li><span>Device protocol</span>: {device.deviceProtocol}</li>
						<li><span>Device subclass</span>: {device.deviceSubclass}</li>
						<li><span>Device version major</span>: {device.deviceVersionMajor}</li>
						<li><span>Device version minor</span>: {device.deviceVersionMinor}</li>
						<li><span>Device version subminor</span>: {device.deviceVersionSubminor}</li>
						<li><span>Manufacturer name</span>: {device.manufacturerName ?? 'Unknown'}</li>
						<li><span>Opened</span>: {stringToUpperCase(String(device.opened))}</li>
						<li><span>Product ID</span>: {device.productId}</li>
						<li><span>Product name</span>: {device.productName}</li>
						<li><span>Serial number</span>: {device.serialNumber ?? 'Unknown'}</li>
						<li><span>USB version major</span>: {device.usbVersionMajor}</li>
						<li><span>USB version minor</span>: {device.usbVersionMinor}</li>
						<li><span>USB version subminor</span>: {device.usbVersionSubminor}</li>
						<li><span>Vendor ID</span>: {device.vendorId}</li>
					</ul>
					<div class={CSS.body_usb_device_actions}>
						<Button
							c:variant={ButtonVariant.tonal}
							data-forget={i()}>
							<Icon c:code={ICON_DELETE}/>Disconnect
						</Button>
					</div>
				</Expander>
			}</For>
		</div>
		<Toasts/>
	</main>)
}

export default _