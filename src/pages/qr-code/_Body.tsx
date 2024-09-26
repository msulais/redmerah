import { createSignal, Show, type VoidComponent } from "solid-js"
import { BrowserQRCodeReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from "@zxing/library"

import type { Settings } from "./_types"
import { _2d, _at, _auto, _backgroundColor, _canvasRef, _catch, _centerBottomToRight, _clearRect, _color, _command, _contents, _currentTarget, _dataTransfer, _decodeFromImageElement, _encodingMode, _environment, _errorCorrectionLevel, _file, _files, _filled, _generate, _getAsFile, _getContext, _getText, _height, _image, _isGenerateError, _items, _jpeg, _kind, _length, _margin, _match, _none, _page, _png, _replace, _scan, _scanFile, _set, _settings, _split, _startsWith, _svg, _svgRef, _then, _tonal, _trim, _type, _value, _vector, _version, _width } from "@/constants/string"
import { setTimeDelayed } from "@/utils/timeout"
import { Commands, CopyFileType, DownloadFileType, Pages } from "./_enums"
import { preventDefault, stopPropagation } from "@/utils/event"
import { toggleAttribute } from "@/utils/attributes"
import { openFile } from "@/utils/file"
import { createObjectURL, revokeObjectURL } from "@/utils/url"
import { isMobile } from "@/utils/platforms"

import TextTooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import TextField from "@/components/TextField"
import Menu, { closeMenu, closeSubMenu, MenuItem, MenuPosition, openMenu, SubMenu, SubMenuItem } from "@/components/Menu"
import CSS from './_styles.module.scss'
import Toast, { openToast } from "@/components/Toast"

const _: VoidComponent<{
    page: Pages
    settings: Settings
    command: (type: Commands, ...args: unknown[]) => unknown
    canvasRef: (el: HTMLCanvasElement) => unknown
    isGenerateError: boolean
}> = (props) => {
    const barcodeFormats: BarcodeFormat[] = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.AZTEC,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.MAXICODE,
    ]
    const decoder = new BrowserQRCodeReader()
    const decoder2 = new BrowserQRCodeReader(new Map([[DecodeHintType.PURE_BARCODE, barcodeFormats]]))
    const decoder3 = new BrowserQRCodeReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, barcodeFormats]]))
    const decoder4 = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, barcodeFormats]]))
    const decoder5 = new BrowserQRCodeReader(new Map([[DecodeHintType.OTHER, barcodeFormats]]))
    const [is_submenu_downloadCanvasActions_open, setIs_submenu_downloadCanvasActions_open] = createSignal<boolean>(false)
    const [is_submenu_copyCanvasActions_open, setIs_submenu_copyCanvasActions_open] = createSignal<boolean>(false)
    const [QRCodeImageSource, setQRCodeImageSource] = createSignal<string | null>(null)
    const [QRCodeDecodedText, setQRCodeDecodedText] = createSignal<string>('')
    const [isDragEnter, setIsDragEnter] = createSignal<boolean>(false)
    let menu_canvasActions_ref: HTMLDialogElement
    let submenu_downloadCanvasActions_ref: HTMLDivElement
    let submenu_copyCanvasActions_ref: HTMLDivElement
    let img_QRCode_ref: HTMLImageElement
    let toast_errorScanQRCode_ref: HTMLDivElement

    async function scanQRImage(ev: Event): Promise<unknown> {
        if (QRCodeImageSource() == null) return;

        const getText = async (decoder: BrowserQRCodeReader) => (await decoder[_decodeFromImageElement](img_QRCode_ref))[_getText]()

        try { return setQRCodeDecodedText(await getText(decoder )) } catch {}
        try { return setQRCodeDecodedText(await getText(decoder2)) } catch {}
        try { return setQRCodeDecodedText(await getText(decoder3)) } catch {}
        try { return setQRCodeDecodedText(await getText(decoder4)) } catch {}
        try { return setQRCodeDecodedText(await getText(decoder5)) } catch {}

        setQRCodeDecodedText('')
        openToast(ev, toast_errorScanQRCode_ref)
    }

    function chooseFile(ev: Event, capture?: string): void {
        openFile('image/*', false, capture)[_then]((files) => {
            if (files == null || files[_length] == 0) return

            for (const file of files) {
                if (!file[_type][_startsWith](_image)) continue

                if (QRCodeImageSource() != null) revokeObjectURL(QRCodeImageSource()!)
                setQRCodeImageSource(createObjectURL(file))
                scanQRImage(ev)
            }
        })
    }

    return (<main class={CSS.body}>
        <div class={CSS.body_options}>
            <Button
                variant={props[_page] == Pages[_generate]? ButtonVariant[_filled] : ButtonVariant[_tonal]}
                onClick={() => props[_command](Commands.change_page, Pages[_generate])}>
                <Icon code={0xED21}/>Generate
            </Button>
            <Button
                variant={props[_page] == Pages[_scan]? ButtonVariant[_filled] : ButtonVariant[_tonal]}
                onClick={() => props[_command](Commands.change_page, Pages[_scan])}>
                <Icon code={0xEDC5}/>Scan
            </Button>
        </div>
        <div style={{display: props[_page] == Pages[_generate]? _contents : _none}}>
            <TextField
                labelText="Data"
                placeholder="Link, email, or any text"
                onInput={ev => props[_command](Commands.change_QRCodeData, ev[_currentTarget][_value])}
                labelAttr={{ class: CSS.body_input }}
            />
            <canvas
                class={CSS.body_canvas_output}
                ref={props[_canvasRef]}
                data-empty={toggleAttribute(props[_isGenerateError])}
                onContextMenu={ev => {
                    preventDefault(ev)
                    if (props[_isGenerateError]) return;
                    openMenu(ev, menu_canvasActions_ref, {position: MenuPosition[_centerBottomToRight]})
                }}
                onClick={ev => {
                    if (props[_isGenerateError]) return;
                    openMenu(ev, menu_canvasActions_ref, {position: MenuPosition[_centerBottomToRight]})
                }}
            />
        </div>
        <div
            style={{display: props[_page] == Pages[_scan]? _contents : _none}}
            class={CSS.body_scan}>
            <div
                class={CSS.body_image}
                data-drag-over={toggleAttribute(isDragEnter())}
                onClick={(ev) => chooseFile(ev)}
                onDrop={ev => {
                    setIsDragEnter(false)
                    preventDefault(ev)
                    if (ev[_dataTransfer] == null) return;

                    let $file: File | null = null
                    if (ev[_dataTransfer][_items]) for (const item of ev[_dataTransfer][_items]) {
                        if (item[_kind] != _file) continue

                        const file = item[_getAsFile]()
                        if (!file || !file[_type][_startsWith](_image)) continue
                        $file = file
                        break
                    }
                    else for (const file of ev[_dataTransfer][_files]) {
                        if (!file[_type][_startsWith](_image)) continue
                        $file = file
                        break
                    }

                    if ($file == null) return;
                    if (!$file[_type][_startsWith](_image)) return
                    if (QRCodeImageSource() != null) revokeObjectURL(QRCodeImageSource()!)
                    setQRCodeImageSource(createObjectURL($file))
                    scanQRImage(ev)
                }}
                onDragOver={ev => preventDefault(ev)}
                onDragEnter={() => setIsDragEnter(true)}
                onDragLeave={() => setIsDragEnter(false)}>
                <div data-no-pointer-event={toggleAttribute(isDragEnter())}>
                    <Show when={QRCodeImageSource() == null}>
                        <p><Icon code={0xED21}/>Drag QR code image here</p>
                    </Show>
                    <Show when={QRCodeImageSource() != null}>
                        <img ref={r => img_QRCode_ref = r} src={QRCodeImageSource()!} alt="" />
                    </Show>
                    <div>
                        <Show when={QRCodeImageSource() != null}>
                            <TextTooltip text="Dismiss">
                                <IconButton
                                    variant={ButtonVariant[_filled]}
                                    code={0xE5E9}
                                    filled
                                    onClick={ev => {
                                        revokeObjectURL(QRCodeImageSource()!)
                                        setQRCodeImageSource(null)
                                        setQRCodeDecodedText('')
                                        stopPropagation(ev)
                                    }}
                                />
                            </TextTooltip>
                        </Show>
                        <TextTooltip text="Choose file">
                            <IconButton
                                variant={QRCodeImageSource() != null? ButtonVariant[_filled] : ButtonVariant[_tonal]}
                                filled={QRCodeImageSource() != null}
                                onClick={ev => {
                                    chooseFile(ev)
                                    stopPropagation(ev)
                                }}
                                code={0xE900}
                            />
                        </TextTooltip>
                        <Show when={isMobile()}>
                            <TextTooltip text="Open camera">
                                <IconButton
                                    variant={QRCodeImageSource() != null? ButtonVariant[_filled] : ButtonVariant[_tonal]}
                                    filled={QRCodeImageSource() != null}
                                    onClick={ev => {
                                        chooseFile(ev, _environment)
                                        stopPropagation(ev)
                                    }}
                                    code={0xE354}
                                />
                            </TextTooltip>
                        </Show>
                    </div>
                </div>
            </div>
            <h2>{(QRCodeDecodedText()[_length] > 0? '"' : '') + QRCodeDecodedText() + (QRCodeDecodedText()[_length] > 0? '"' : '')}</h2>
        </div>
        <Menu ref={r => menu_canvasActions_ref = r}>
            <SubMenu
                style={{width: '172px'}}
                ref={r => submenu_downloadCanvasActions_ref = r}
                onToggleOpen={isOpen => setIs_submenu_downloadCanvasActions_open(isOpen)}
                item={<SubMenuItem
                    focused={is_submenu_downloadCanvasActions_open()}
                    iconCode={0xE0B9}>
                    Download as
                </SubMenuItem>}>
                <MenuItem
                    iconCode={0xE8FE}
                    onClick={() => {
                        props[_command](Commands.download_QRCode, DownloadFileType[_png])
                        closeSubMenu(submenu_downloadCanvasActions_ref)
                        setTimeDelayed(() => closeMenu(menu_canvasActions_ref), 300)
                    }}
                    trailing="PNG">
                    Image
                </MenuItem>
                <MenuItem
                    iconCode={0xE8FE}
                    onClick={() => {
                        props[_command](Commands.download_QRCode, DownloadFileType[_jpeg])
                        closeSubMenu(submenu_downloadCanvasActions_ref)
                        setTimeDelayed(() => closeMenu(menu_canvasActions_ref), 300)
                    }}
                    trailing="JPEG">
                    Image
                </MenuItem>
                <MenuItem
                    iconCode={0xE90C}
                    onClick={() => {
                        props[_command](Commands.download_QRCode, DownloadFileType[_svg])
                        closeSubMenu(submenu_downloadCanvasActions_ref)
                        setTimeDelayed(() => closeMenu(menu_canvasActions_ref), 300)
                    }}
                    trailing="SVG">
                    Vector
                </MenuItem>
            </SubMenu>
            <SubMenu
                style={{width: '172px'}}
                ref={r => submenu_copyCanvasActions_ref = r}
                onToggleOpen={isOpen => setIs_submenu_copyCanvasActions_open(isOpen)}
                item={<SubMenuItem
                    focused={is_submenu_copyCanvasActions_open()}
                    iconCode={0xE51B}>
                    Copy as
                </SubMenuItem>}>
                <MenuItem
                    iconCode={0xE8FE}
                    onClick={(ev) => {
                        props[_command](Commands.copy_QRCode, ev, CopyFileType[_png])
                        closeSubMenu(submenu_copyCanvasActions_ref)
                        setTimeDelayed(() => closeMenu(menu_canvasActions_ref), 300)
                    }}
                    trailing="PNG">
                    Image
                </MenuItem>
                <MenuItem
                    iconCode={0xE90C}
                    onClick={(ev) => {
                        props[_command](Commands.copy_QRCode, ev, CopyFileType[_svg])
                        closeSubMenu(submenu_copyCanvasActions_ref)
                        setTimeDelayed(() => closeMenu(menu_canvasActions_ref), 300)
                    }}
                    trailing="SVG">
                    Vector
                </MenuItem>
            </SubMenu>
        </Menu>
        <Toast ref={r => toast_errorScanQRCode_ref = r} leading={<Icon code={0xF29B}/>}>Unable to scan QR Code in the image</Toast>
    </main>)
}

export default _