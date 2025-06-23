import { createSignal, createUniqueId, For, onMount, type VoidComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

import type { USB, USBDevice } from "@/interfaces/usb"
import { ICON_CONNECTOR, ICON_DELETE, ICON_DISMISS, ICON_WARNING } from "@/constants/icons"
import { removeSplashScreen } from "@/utils/splash"
import { AppCSSColors } from "@/enums/app-data"
import { isTargetValidElement } from "@/utils/element"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import Icon from "@/components/Icon"
import Toast, { closeToast, openToast } from "@/components/Toast"
import Tooltip from "@/components/Tooltip"
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
	const usb = (navigator as any).usb as USB
	const buttonConnectId = createUniqueId()
	const [devices, setDevices] = createStore<USBDevice[]>([])
	const [isBrowserNotSupport, setIsBrowserNotSupport] = createSignal<boolean>(false)
	let toastBrowserNotSupportRef: HTMLDivElement

	function updateDevice(device: USBDevice): void {
		if (devices.some(d => d.productId === device.productId)) return

		setDevices(produce(devices => {
			devices.push(device)
			devices.sort((a, b) => a.productName.localeCompare(b.productName))
		}))
	}

	function initUSBDevices(): void {
		if (!usb) {
			setIsBrowserNotSupport(true)
			setTimeout(() => openToast(toastBrowserNotSupportRef, {
				autoclose: false
			}))
			return
		}
		usb.ondisconnect = ev => {
			for (let i = 0; i < devices.length; i++) {
				if (devices[i] !== ev.device) continue

				setDevices(produce(devices => {
					devices.splice(i, 1)
				}))
				break
			}
		}
		usb.getDevices().then((devices) => {
			for (const device of devices) {
				updateDevice(device)
			}
		})
	}

	function connectUSBDevice(): void {
		usb
		.requestDevice({filters: []})
		.then((device) => updateDevice(device))
	}

	onMount(() => {
		initUSBDevices()
		removeSplashScreen()
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
					color: `rgb(${AppCSSColors.accent})`
				}}
				target={"_blank"}
				rel={"noopener noreferrer"}
				href="https://caniuse.com/webusb">browser compatibility</a>.
		</Toast>
	</>)

	return (<main class={CSS.body}>
		<div
			onClick={ev => {
				const button = document.activeElement! as HTMLButtonElement
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
				)) return

				switch (button.id) {
				case buttonConnectId:
					connectUSBDevice()
					break
				default:
					const dataForget = button.dataset.forget
					if (dataForget) {
						const i = Number.parseInt(dataForget)
						return devices[i]?.forget().then(() => setDevices(produce(devices => {
							devices.splice(i, 1)
						})))
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
						<li><span>Opened</span>: {String(device.opened).toUpperCase()}</li>
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