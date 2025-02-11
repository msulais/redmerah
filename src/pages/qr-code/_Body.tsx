import { createMemo, createSignal, createUniqueId, Show, type VoidComponent } from "solid-js"
import { BrowserQRCodeReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from "@zxing/library"

import { timeTimerSet } from "@/utils/time"
import { Commands, CopyFileType, DownloadFileType, Pages } from "./_enums"
import { eventCurrentTarget, eventPreventDefault, eventTarget } from "@/utils/event"
import { attrSetIfExist } from "@/utils/attributes"
import { fileOpen } from "@/utils/file"
import { urlCreate, urlRevoke } from "@/utils/url"
import { isMobile } from "@/utils/platforms"
import { promiseDone, validEnumValue } from "@/utils/object"
import { arrayLength, arrayPush } from "@/utils/array"
import { stringLength, stringStartsWith } from "@/utils/string"
import { documentActive } from "@/utils/document"
import { elementChildren, elementDataset, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown } from "@/utils/keyboard"
import { ICON_ARROW_DOWNLOAD, ICON_CAMERA_ADD, ICON_COPY, ICON_DISMISS, ICON_IMAGE, ICON_IMAGE_ADD, ICON_IMAGE_CIRCLE, ICON_QR_CODE, ICON_SCAN_TEXT, ICON_WARNING } from "@/constants/icons"

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import TextField from "@/components/TextField"
import Menu, { closeMenu, closeSubMenu, MenuItem, MenuPosition, openMenu, SubMenu, SubMenuItem } from "@/components/Menu"
import Toast, { openToast } from "@/components/Toast"
import CSS from './_styles.module.scss'

const _: VoidComponent<{
	page: Pages
	command: (type: Commands, ...args: unknown[]) => unknown
	canvasRef: (el: HTMLCanvasElement) => unknown
	isGenerateError: boolean
}> = (props) => {
	const barcodeFormat: BarcodeFormat[] = [
		BarcodeFormat.QR_CODE,
		BarcodeFormat.AZTEC,
		BarcodeFormat.DATA_MATRIX,
		BarcodeFormat.MAXICODE,
	]
	const decoder = new BrowserQRCodeReader()
	const decoder2 = new BrowserQRCodeReader(new Map([[DecodeHintType.PURE_BARCODE, barcodeFormat]]))
	const decoder3 = new BrowserQRCodeReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, barcodeFormat]]))
	const decoder4 = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, barcodeFormat]]))
	const decoder5 = new BrowserQRCodeReader(new Map([[DecodeHintType.OTHER, barcodeFormat]]))
	const [isSubMenuCanvasActions_downloadOpen, setIsSubMenuCanvasActions_downloadOpen] = createSignal<boolean>(false)
	const [isSubMenuCanvasActions_copyOpen, setIsSubMenuCanvasActions_copyOpen] = createSignal<boolean>(false)
	const [QRCodeImageSource, setQRCodeImageSource] = createSignal<string | null>(null)
	const [QRCodeDecodedText, setQRCodeDecodedText] = createSignal<string>('')
	const [isDragEnter, setIsDragEnter] = createSignal<boolean>(false)
	const page = createMemo(() => props.page)
	const buttonOption_generateId = createUniqueId()
	const buttonOption_scanId = createUniqueId()
	const canvasGenerateOutputId = createUniqueId()
	const divScan_imageId = createUniqueId()
	const buttonScan_dismissId = createUniqueId()
	const buttonScan_chooseFileId = createUniqueId()
	const buttonScan_openCameraId = createUniqueId()
	let menuCanvasActionsRef: HTMLDialogElement
	let subMenuCanvasActions_downloadRef: HTMLDivElement
	let subMenuCanvasActions_copyRef: HTMLDivElement
	let imgQRCodeRef: HTMLImageElement
	let toastErrorScanQRCodeRef: HTMLDivElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	async function scanQRCodeImage(): Promise<unknown> {
		if (QRCodeImageSource() == null) return;

		const decodeImage = async (decoder: BrowserQRCodeReader) => (await decoder.decodeFromImageElement(imgQRCodeRef)).getText()

		try { return setQRCodeDecodedText(await decodeImage(decoder )) } catch {}
		try { return setQRCodeDecodedText(await decodeImage(decoder2)) } catch {}
		try { return setQRCodeDecodedText(await decodeImage(decoder3)) } catch {}
		try { return setQRCodeDecodedText(await decodeImage(decoder4)) } catch {}
		try { return setQRCodeDecodedText(await decodeImage(decoder5)) } catch {}

		setQRCodeDecodedText('')
		openToast(toastErrorScanQRCodeRef)
	}

	function chooseFile(capture?: string): void {
		promiseDone(
			fileOpen('image/*', false, capture),
			(files) => {
				if (files == null || arrayLength(files as unknown as File[]) == 0) return

				for (const file of files) {
					if (!stringStartsWith(file.type, 'image')) continue

					if (QRCodeImageSource() != null) urlRevoke(QRCodeImageSource()!)
					setQRCodeImageSource(urlCreate(file))
					scanQRCodeImage()
				}
			}
		)
	}

	const Menus: VoidComponent = () => {
		return (<Menu
			ref={r => menuCanvasActionsRef = r}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				const dataDownload = elementDataset(button, 'download')
				if (dataDownload
					&& validEnumValue(dataDownload, DownloadFileType)
				) {
					command(Commands.downloadQRCode, dataDownload as DownloadFileType)
					closeSubMenu(subMenuCanvasActions_downloadRef)
					timeTimerSet(() => closeMenu(menuCanvasActionsRef), 200)
					return
				}

				const dataCopy = elementDataset(button, 'copy')
				if (dataCopy
					&& validEnumValue(dataCopy, CopyFileType)
				) {
					command(Commands.copyQRCode, dataCopy as CopyFileType)
					closeSubMenu(subMenuCanvasActions_copyRef)
					timeTimerSet(() => closeMenu(menuCanvasActionsRef), 200)
					return
				}
			}}>
			<SubMenu
				style={{width: '172px'}}
				ref={r => subMenuCanvasActions_downloadRef = r}
				c:onToggleOpen={isOpen => setIsSubMenuCanvasActions_downloadOpen(isOpen)}
				c:item={<SubMenuItem
					c:focused={isSubMenuCanvasActions_downloadOpen()}
					c:iconCode={ICON_ARROW_DOWNLOAD}>
					Download as
				</SubMenuItem>}>
				<MenuItem
					c:iconCode={ICON_IMAGE}
					data-download={DownloadFileType.png}
					c:trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_IMAGE}
					data-download={DownloadFileType.jpeg}
					c:trailing="JPEG">
					Image
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_IMAGE_CIRCLE}
					data-download={DownloadFileType.svg}
					c:trailing="SVG">
					Vector
				</MenuItem>
			</SubMenu>
			<SubMenu
				style={{width: '172px'}}
				ref={r => subMenuCanvasActions_copyRef = r}
				c:onToggleOpen={isOpen => setIsSubMenuCanvasActions_copyOpen(isOpen)}
				c:item={<SubMenuItem
					c:focused={isSubMenuCanvasActions_copyOpen()}
					c:iconCode={ICON_COPY}>
					Copy as
				</SubMenuItem>}>
				<MenuItem
					c:iconCode={ICON_IMAGE}
					data-copy={CopyFileType.png}
					c:trailing="PNG">
					Image
				</MenuItem>
				<MenuItem
					c:iconCode={ICON_IMAGE_CIRCLE}
					data-copy={CopyFileType.svg}
					c:trailing="SVG">
					Vector
				</MenuItem>
			</SubMenu>
		</Menu>)
	}

	const Toasts: VoidComponent = () => {
		return (<Toast
			ref={r => toastErrorScanQRCodeRef = r}
			c:leading={<Icon c:code={ICON_WARNING}/>}>
			Unable to scan QR Code in the image
		</Toast>)
	}

	const OptionPage: VoidComponent = () => {
		const buttons: HTMLButtonElement[] = []

		return (<div
			class={CSS.body_options}
			onFocusIn={ev => {
				const self = eventCurrentTarget(ev)
				if (arrayLength(buttons) === 0) {
					arrayPush(buttons, ...elementChildren(self))
				}
				keyboardOnFocusIn(ev, buttons)
			}}
			onFocusOut={ev => keyboardOnFocusOut(ev, buttons)}
			onKeyDown={ev => keyboardOnKeyDown(ev, buttons, {left: 'prev', right: 'next'})}>
			<Button
				id={buttonOption_generateId}
				c:variant={page() == Pages.generate? ButtonVariant.filled : ButtonVariant.tonal}>
				<Icon c:code={ICON_QR_CODE}/>Generate
			</Button>
			<Button
				id={buttonOption_scanId}
				c:variant={page() == Pages.scan? ButtonVariant.filled : ButtonVariant.tonal}>
				<Icon c:code={ICON_SCAN_TEXT}/>Scan
			</Button>
		</div>)
	}

	const PageGenerate: VoidComponent = () => {
		return (<div style={{display: page() == Pages.generate? 'contents' : 'none'}}>
			<TextField
				c:label="Data"
				placeholder="Link, email, or any text"
				onInput={ev => command(Commands.updateQRCodeData, eventCurrentTarget(ev).value)}
				c:attrWrapper={{ class: CSS.body_input }}
			/>
			<canvas
				class={CSS.body_canvas_output}
				id={canvasGenerateOutputId}
				ref={props.canvasRef}
				data-empty={attrSetIfExist(props.isGenerateError)}
			/>
		</div>)
	}

	const PageScan: VoidComponent = () => {
		return (<div
			style={{display: page() == Pages.scan? 'contents' : 'none'}}
			class={CSS.body_scan}>
			<div
				class={CSS.body_image}
				id={divScan_imageId}
				data-drag-over={attrSetIfExist(isDragEnter())}
				tabindex="0"
				onDrop={ev => {
					setIsDragEnter(false)
					eventPreventDefault(ev)
					const dataTransfer = ev.dataTransfer
					if (dataTransfer == null) return;

					let $file: File | null = null
					if (dataTransfer.items) for (const item of dataTransfer.items) {
						if (item.kind != 'file') continue

						const file = item.getAsFile()
						if (!file || !stringStartsWith(file.type, 'image')) continue
						$file = file
						break
					}
					else for (const file of dataTransfer.files) {
						if (!stringStartsWith(file.type, 'image')) continue
						$file = file
						break
					}

					if ($file == null) return;
					if (!stringStartsWith($file.type, 'image')) return
					if (QRCodeImageSource() != null) urlRevoke(QRCodeImageSource()!)
					setQRCodeImageSource(urlCreate($file))
					scanQRCodeImage()
				}}
				onDragOver={ev => eventPreventDefault(ev)}
				onDragEnter={() => setIsDragEnter(true)}
				onDragLeave={() => setIsDragEnter(false)}>
				<div data-g-no-pointer-event={attrSetIfExist(isDragEnter())}>
					<Show when={QRCodeImageSource() == null}>
						<p><Icon c:code={ICON_QR_CODE}/>Drag QR code image here</p>
					</Show>
					<Show when={QRCodeImageSource() != null}>
						<img ref={r => imgQRCodeRef = r} src={QRCodeImageSource()!} alt="" />
					</Show>
					<div>
						<Tooltip>
							<Show when={QRCodeImageSource() != null}>
								<IconButton
									id={buttonScan_dismissId}
									data-tooltip="Dismiss"
									c:variant={ButtonVariant.filled}
									c:code={ICON_DISMISS}
									c:filled
								/>
							</Show>
							<IconButton
								id={buttonScan_chooseFileId}
								data-tooltip="Choose file"
								c:variant={QRCodeImageSource() != null? ButtonVariant.filled : ButtonVariant.tonal}
								c:filled={QRCodeImageSource() != null}
								c:code={ICON_IMAGE_ADD}
							/>
							<Show when={isMobile()}>
								<IconButton
									id={buttonScan_openCameraId}
									data-tooltip="Open camera"
									c:variant={QRCodeImageSource() != null? ButtonVariant.filled : ButtonVariant.tonal}
									c:filled={QRCodeImageSource() != null}
									c:code={ICON_CAMERA_ADD}
								/>
							</Show>
						</Tooltip>
					</div>
				</div>
			</div>
			<h2>{
				(stringLength(QRCodeDecodedText()) > 0? '"' : '')
				+ QRCodeDecodedText()
				+ (stringLength(QRCodeDecodedText()) > 0? '"' : '')
			}</h2>
		</div>)
	}

	return (<main
		class={CSS.body}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
			)) return

			switch (elementId(button)) {
			case buttonOption_generateId:
				command(Commands.updatePage, Pages.generate)
				break
			case buttonOption_scanId:
				command(Commands.updatePage, Pages.scan)
				break
			case canvasGenerateOutputId:
				if (props.isGenerateError) return

				openMenu(
					menuCanvasActionsRef,
					{position: MenuPosition.centerBottomToRight}
				)
				break
			case divScan_imageId:
				chooseFile()
				break
			case buttonScan_dismissId:
				urlRevoke(QRCodeImageSource()!)
				setQRCodeImageSource(null)
				setQRCodeDecodedText('')
				break
			case buttonScan_chooseFileId:
				chooseFile()
				break
			case buttonScan_openCameraId:
				chooseFile('environment')
				break
			}
		}}
		onContextMenu={ev => {
			const target = eventTarget(ev) as HTMLElement
			switch (elementId(target)) {
			case canvasGenerateOutputId:
				if (props.isGenerateError) return

				eventPreventDefault(ev)
				openMenu(
					menuCanvasActionsRef,
					{position: MenuPosition.centerBottomToRight}
				)
				break
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