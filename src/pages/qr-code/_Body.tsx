import { createMemo, createSignal, createUniqueId, Show, type VoidComponent } from "solid-js"
import { BrowserQRCodeReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from "@zxing/library"

import { timeout_set } from "@/utils/timeout"
import { all_CopyFileType, all_DownloadFileType, Commands, CopyFileType, DownloadFileType, Pages } from "./_enums"
import { event_current_target, event_prevent_default, event_target } from "@/utils/event"
import { attr_set_if_exist } from "@/utils/attributes"
import { file_open } from "@/utils/file"
import { url_create, url_revoke } from "@/utils/url"
import { is_mobile } from "@/utils/platforms"
import { promise_done, valid_enum_value } from "@/utils/object"
import { array_length } from "@/utils/array"
import { string_length, string_starts_with } from "@/utils/string"
import { document_active } from "@/utils/document"
import { element_dataset, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { number_is_not_defined, number_parse } from "@/utils/number"

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import TextField from "@/components/TextField"
import Menu, { close_menu, close_submenu, MenuItem, MenuPosition, open_menu, SubMenu, SubMenuItem } from "@/components/Menu"
import Toast, { open_toast } from "@/components/Toast"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	page: Pages
	command: (type: Commands, ...args: unknown[]) => unknown
	canvas_ref: (el: HTMLCanvasElement) => unknown
	is_generate_error: boolean
}> = (props) => {
	const barcode_format: BarcodeFormat[] = [
		BarcodeFormat.QR_CODE,
		BarcodeFormat.AZTEC,
		BarcodeFormat.DATA_MATRIX,
		BarcodeFormat.MAXICODE,
	]
	const decoder = new BrowserQRCodeReader()
	const decoder2 = new BrowserQRCodeReader(new Map([[DecodeHintType.PURE_BARCODE, barcode_format]]))
	const decoder3 = new BrowserQRCodeReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, barcode_format]]))
	const decoder4 = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, barcode_format]]))
	const decoder5 = new BrowserQRCodeReader(new Map([[DecodeHintType.OTHER, barcode_format]]))
	const [is_submenu_downloadcanvasactions_open, set_is_submenu_downloadcanvasactions_open] = createSignal<boolean>(false)
	const [is_submenu_copycanvasactions_open, set_is_submenu_copycanvasactions_open] = createSignal<boolean>(false)
	const [qrcode_image_src, set_qrcode_image_src] = createSignal<string | null>(null)
	const [qrcode_decoded_text, set_qrcode_decoded_text] = createSignal<string>('')
	const [is_drag_enter, set_is_drag_enter] = createSignal<boolean>(false)
	const page = createMemo(() => props.page)
	const button_option_generate_id = createUniqueId()
	const button_option_scan_id = createUniqueId()
	const canvas_generate_output_id = createUniqueId()
	const div_scan_image_id = createUniqueId()
	const button_scan_dismiss_id = createUniqueId()
	const button_scan_choosefile_id = createUniqueId()
	const button_scan_opencamera_id = createUniqueId()
	let menu_canvasactions_ref: HTMLDialogElement
	let submenu_downloadcanvasactions_ref: HTMLDivElement
	let submenu_copycanvasactions_ref: HTMLDivElement
	let img_qrcode_ref: HTMLImageElement
	let toast_errorscanqrcode_ref: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function scan_qrcode_image(ev: Event): Promise<unknown> {
		if (qrcode_image_src() == null) return;

		const decode_image = async (decoder: BrowserQRCodeReader) => (await decoder.decodeFromImageElement(img_qrcode_ref)).getText()

		try { return set_qrcode_decoded_text(await decode_image(decoder )) } catch {}
		try { return set_qrcode_decoded_text(await decode_image(decoder2)) } catch {}
		try { return set_qrcode_decoded_text(await decode_image(decoder3)) } catch {}
		try { return set_qrcode_decoded_text(await decode_image(decoder4)) } catch {}
		try { return set_qrcode_decoded_text(await decode_image(decoder5)) } catch {}

		set_qrcode_decoded_text('')
		open_toast(ev, toast_errorscanqrcode_ref)
	}

	function choose_file(ev: Event, capture?: string): void {
		promise_done(
			file_open('image/*', false, capture),
			(files) => {
				if (files == null || array_length(files as unknown as File[]) == 0) return

				for (const file of files) {
					if (!string_starts_with(file.type, 'image')) continue

					if (qrcode_image_src() != null) url_revoke(qrcode_image_src()!)
					set_qrcode_image_src(url_create(file))
					scan_qrcode_image(ev)
				}
			}
		)
	}

	const Menus: VoidComponent = () => {
		return (<Menu
			ref={r => menu_canvasactions_ref = r}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				const data_download = element_dataset(button, 'download')
				if (data_download) {
					const type = number_parse(data_download, true)
					if (
						number_is_not_defined(type)
						|| !valid_enum_value(type, all_DownloadFileType)
					) return

					command(Commands.download_qrcode, type as DownloadFileType)
					close_submenu(submenu_downloadcanvasactions_ref)
					timeout_set(() => close_menu(menu_canvasactions_ref), 300)
					return
				}

				const data_copy = element_dataset(button, 'copy')
				if (data_copy) {
					const type = number_parse(data_copy, true)
					if (
						number_is_not_defined(type)
						|| !valid_enum_value(type, all_CopyFileType)
					) return

					command(Commands.copy_qrcode, ev, type as CopyFileType)
					close_submenu(submenu_copycanvasactions_ref)
					timeout_set(() => close_menu(menu_canvasactions_ref), 300)
					return
				}
			}}>
			<SubMenu
				style={{width: '172px'}}
				ref={r => submenu_downloadcanvasactions_ref = r}
				on_toggle_open={isOpen => set_is_submenu_downloadcanvasactions_open(isOpen)}
				item={<SubMenuItem
					focused={is_submenu_downloadcanvasactions_open()}
					icon_code={0xE0B9}>
					Download as
				</SubMenuItem>}>
				<MenuItem
					icon_code={0xE8FE}
					data-download={DownloadFileType.png}
					trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					icon_code={0xE8FE}
					data-download={DownloadFileType.jpeg}
					trailing="JPEG">
					Image
				</MenuItem>
				<MenuItem
					icon_code={0xE90C}
					data-download={DownloadFileType.svg}
					trailing="SVG">
					Vector
				</MenuItem>
			</SubMenu>
			<SubMenu
				style={{width: '172px'}}
				ref={r => submenu_copycanvasactions_ref = r}
				on_toggle_open={isOpen => set_is_submenu_copycanvasactions_open(isOpen)}
				item={<SubMenuItem
					focused={is_submenu_copycanvasactions_open()}
					icon_code={0xE51B}>
					Copy as
				</SubMenuItem>}>
				<MenuItem
					icon_code={0xE8FE}
					data-copy={CopyFileType.png}
					trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					icon_code={0xE90C}
					data-copy={CopyFileType.svg}
					trailing="SVG">
					Vector
				</MenuItem>
			</SubMenu>
		</Menu>)
	}

	const Toasts: VoidComponent = () => {
		return (<Toast
			ref={r => toast_errorscanqrcode_ref = r}
			leading={<Icon code={0xF29B}/>}>
			Unable to scan QR Code in the image
		</Toast>)
	}

	const OptionPage: VoidComponent = () => {
		return (<div class={CSS.body_options}>
			<Button
				id={button_option_generate_id}
				variant={page() == Pages.generate? ButtonVariant.filled : ButtonVariant.tonal}>
				<Icon code={0xED21}/>Generate
			</Button>
			<Button
				id={button_option_scan_id}
				variant={page() == Pages.scan? ButtonVariant.filled : ButtonVariant.tonal}>
				<Icon code={0xEDC5}/>Scan
			</Button>
		</div>)
	}

	const PageGenerate: VoidComponent = () => {
		return (<div style={{display: page() == Pages.generate? 'contents' : 'none'}}>
			<TextField
				label="Data"
				placeholder="Link, email, or any text"
				onInput={ev => command(Commands.change_qrcode_data, event_current_target(ev).value)}
				attr_wrapper={{ class: CSS.body_input }}
			/>
			<canvas
				class={CSS.body_canvas_output}
				id={canvas_generate_output_id}
				ref={props.canvas_ref}
				data-empty={attr_set_if_exist(props.is_generate_error)}
			/>
		</div>)
	}

	const PageScan: VoidComponent = () => {
		return (<div
			style={{display: page() == Pages.scan? 'contents' : 'none'}}
			class={CSS.body_scan}>
			<div
				class={CSS.body_image}
				id={div_scan_image_id}
				data-drag-over={attr_set_if_exist(is_drag_enter())}
				tabindex="0"
				onDrop={ev => {
					set_is_drag_enter(false)
					event_prevent_default(ev)
					const data_transfer = ev.dataTransfer
					if (data_transfer == null) return;

					let $file: File | null = null
					if (data_transfer.items) for (const item of data_transfer.items) {
						if (item.kind != 'file') continue

						const file = item.getAsFile()
						if (!file || !string_starts_with(file.type, 'image')) continue
						$file = file
						break
					}
					else for (const file of data_transfer.files) {
						if (!string_starts_with(file.type, 'image')) continue
						$file = file
						break
					}

					if ($file == null) return;
					if (!string_starts_with($file.type, 'image')) return
					if (qrcode_image_src() != null) url_revoke(qrcode_image_src()!)
					set_qrcode_image_src(url_create($file))
					scan_qrcode_image(ev)
				}}
				onDragOver={ev => event_prevent_default(ev)}
				onDragEnter={() => set_is_drag_enter(true)}
				onDragLeave={() => set_is_drag_enter(false)}>
				<div data-g-no-pointer-event={attr_set_if_exist(is_drag_enter())}>
					<Show when={qrcode_image_src() == null}>
						<p><Icon code={0xED21}/>Drag QR code image here</p>
					</Show>
					<Show when={qrcode_image_src() != null}>
						<img ref={r => img_qrcode_ref = r} src={qrcode_image_src()!} alt="" />
					</Show>
					<div>
						<Tooltip>
							<Show when={qrcode_image_src() != null}>
								<IconButton
									id={button_scan_dismiss_id}
									data-tooltip="Dismiss"
									variant={ButtonVariant.filled}
									code={0xE5E9}
									filled
								/>
							</Show>
							<IconButton
								id={button_scan_choosefile_id}
								data-tooltip="Choose file"
								variant={qrcode_image_src() != null? ButtonVariant.filled : ButtonVariant.tonal}
								filled={qrcode_image_src() != null}
								code={0xE900}
							/>
							<Show when={is_mobile()}>
								<IconButton
									id={button_scan_opencamera_id}
									data-tooltip="Open camera"
									variant={qrcode_image_src() != null? ButtonVariant.filled : ButtonVariant.tonal}
									filled={qrcode_image_src() != null}
									code={0xE354}
								/>
							</Show>
						</Tooltip>
					</div>
				</div>
			</div>
			<h2>{
				(string_length(qrcode_decoded_text()) > 0? '"' : '')
				+ qrcode_decoded_text()
				+ (string_length(qrcode_decoded_text()) > 0? '"' : '')
			}</h2>
		</div>)
	}

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
			)) return

			switch (element_id(button)) {
				case button_option_generate_id: {
					command(Commands.change_page, Pages.generate)
					break
				}
				case button_option_scan_id: {
					command(Commands.change_page, Pages.scan)
					break
				}
				case canvas_generate_output_id: {
					if (props.is_generate_error) return

					open_menu(
						ev, menu_canvasactions_ref,
						{position: MenuPosition.center_bottom_to_right}
					)
					break
				}
				case div_scan_image_id: {
					choose_file(ev)
					break
				}
				case button_scan_dismiss_id: {
					url_revoke(qrcode_image_src()!)
					set_qrcode_image_src(null)
					set_qrcode_decoded_text('')
					break
				}
				case button_scan_choosefile_id: {
					choose_file(ev)
					break
				}
				case button_scan_opencamera_id: {
					choose_file(ev, 'environment')
					break
				}
			}
		}}
		onContextMenu={ev => {
			const target = event_target(ev) as HTMLElement
			switch (element_id(target)) {
				case canvas_generate_output_id: {
					if (props.is_generate_error) return

					event_prevent_default(ev)
					open_menu(
						ev, menu_canvasactions_ref,
						{position: MenuPosition.center_bottom_to_right}
					)
					break
				}
			}
		}}>
		<OptionPage />
		<PageGenerate />
		<PageScan />
		<Menus />
		<Toasts />
	</main>)
}

export default _