import { createSignal, createUniqueId, For, onMount, type VoidComponent } from "solid-js"
import { createStore, produce } from "solid-js/store"

import type { USBDevice } from "@/interfaces/usb"
import { ICON_CONNECTOR, ICON_DELETE, ICON_DISMISS, ICON_WARNING } from "@/constants/icons"
import { string_locale_compare, string_touppercase } from "@/utils/string"
import { promise_done } from "@/utils/object"
import { array_length, array_push, array_some, array_sort } from "@/utils/array"
import { navigator_usb } from "@/utils/navigator"
import { document_active, document_body } from "@/utils/document"
import { element_click, element_dataset, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { event_add_listener, event_current_target } from "@/utils/event"
import { number_parse } from "@/utils/number"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import Expander, { ExpanderHeader, ExpanderVariant } from "@/components/Expander"
import Icon from "@/components/Icon"
import CSS from './_styles.module.scss'
import { remove_splash_screen } from "@/scripts/splash"
import Toast, { close_toast, open_toast } from "@/components/Toast"
import Tooltip from "@/components/Tooltip"
import { timeout_set } from "@/utils/timeout"

const _: VoidComponent = () => {
	const usb = navigator_usb()
	const button_connect_id = createUniqueId()
	const [devices, set_devices] = createStore<USBDevice[]>([])
	const [is_browser_not_support, set_is_browser_not_support] = createSignal<boolean>(false)
	let toast_browsernotsupport_ref: HTMLDivElement

	function update_device(device: USBDevice): void {
		if (array_some(devices, d => d.productId === device.productId)) return

		set_devices(produce(devices => {
			array_push(devices, device)
			array_sort(devices, (a, b) => string_locale_compare(
				a.productName,
				b.productName
			))
		}))
	}

	function init_usb_devices(ev: Event): void {
		if (!usb) {
			set_is_browser_not_support(true)
			timeout_set(() => open_toast(ev, toast_browsernotsupport_ref, {
				autoclose: false
			}))
			return
		}
		usb.ondisconnect = ev => {
			for (let i = 0; i < array_length(devices); i++) {
				if (devices[i] !== ev.device) continue

				set_devices(produce(devices => {
					devices.splice(i, 1)
				}))
				break
			}
		}
		promise_done(
			usb.getDevices(),
			devices => {
				for (const device of devices) update_device(device)
			}
		)
	}

	function connect_usb_device(): void {
		promise_done(
			navigator_usb().requestDevice({filters:[]}),
			(device) => {
				update_device(device)
			}
		)
	}

	onMount(() => {
		let clicked = false
		event_add_listener(document_body(), 'click', ev => {
			if (clicked) return;
			init_usb_devices(ev)
			remove_splash_screen()
			clicked = true
		})

		element_click(document_body())
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_browsernotsupport_ref = r}
			c_leading={<Icon c_code={ICON_WARNING}/>}
			c_trailing={<Tooltip>
				<IconButton
					data-tooltip="Close"
					c_code={ICON_DISMISS}
					c_variant={ButtonVariant.tonal}
					onClick={() => close_toast(toast_browsernotsupport_ref)}
				/>
			</Tooltip>}>
			Browser not supported. See <a
				style={{
					"text-decoration": 'underline',
					color: 'rgb(var(--g-color-accent))'
				}}
				target={"_blank"}
				rel={"noopener noreferrer"}
				href="https://caniuse.com/webusb">browser compatibility</a>.
		</Toast>
	</>)

	return (<main class={CSS.body}>
		<div
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) === 'BUTTON'
				)) return

				switch (element_id(button)) {
				case button_connect_id:
					connect_usb_device()
					break
				default:
					const data_forget = element_dataset(button, 'forget')
					if (data_forget) {
						const i = number_parse(data_forget, true)
						return promise_done(
							devices[i]?.forget(),
							() => set_devices(produce(devices => {
								devices.splice(i, 1)
							}))
						)
					}
				}
			}}>
			<div class={CSS.body_connect}>
				<Button
					c_variant={ButtonVariant.filled}
					id={button_connect_id}
					disabled={is_browser_not_support()}>
					<Icon c_code={ICON_CONNECTOR} c_filled/>
					Connect USB
				</Button>
			</div>
			<For each={devices}>{(device, i) =>
				<Expander
					class={CSS.body_usb_device}
					c_variant={ExpanderVariant.outlined}
					c_header={<ExpanderHeader>
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
						<li><span>Opened</span>: {string_touppercase(String(device.opened))}</li>
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
							c_variant={ButtonVariant.tonal}
							data-forget={i()}>
							<Icon c_code={ICON_DELETE}/>Disconnect
						</Button>
					</div>
				</Expander>
			}</For>
		</div>
		<Toasts/>
	</main>)
}

export default _