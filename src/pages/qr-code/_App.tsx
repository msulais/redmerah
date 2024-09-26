import { createSignal, onMount, type VoidComponent } from "solid-js"
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"

import type { HEXColor } from "@/types/color"
import type { Settings } from "./_types"
import { _scan, _writeObjectStore, _settings, _put, _miscellaneous, _encodingMode, _auto, _color, _backgroundColor, _errorCorrectionLevel, _margin, _version, _getContext, _2d, _clearRect, _width, _height, _svg, _replace, _toUpperCase, _jpeg, _toDataURL, _png, _then, _toBlob, _clipboard, _write, _writeText, _splash, _animate, _spring, _finished, _remove, _readObjectStore, _get, _value, _createObjectStore, _open, _key, _generate } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { setTimeDelayed } from "@/utils/timeout"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import { createStore } from "solid-js/store"
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_COLOR, DEFAULT_ENCODING_MODE, DEFAULT_ERROR_CORRECTION_LEVEL, DEFAULT_MARGIN, DEFAULT_VERSION } from "./_constants"
import { downloadFileByURL } from "@/utils/url"
import { downloadFile } from "@/utils/file"
import { getNavigator } from "@/constants/window"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreMiscellaneous, type ObjectStoreSettings } from "./_storage"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
    const db = new IDB(DatabaseNames.qrCode)
    const [page, setPage] = createSignal<Pages>(Pages[_generate])
    const [isGenerateError, setIsGenerateError] = createSignal<boolean>(true)
    const [QRCodeData, setQRCodeData] = createSignal<string>('')
    const [settings, setSettings] = createStore<Settings>({
        backgroundColor: DEFAULT_BACKGROUND_COLOR,
        color: DEFAULT_COLOR,
        encodingMode: DEFAULT_ENCODING_MODE,
        errorCorrectionLevel: DEFAULT_ERROR_CORRECTION_LEVEL,
        margin: DEFAULT_MARGIN,
        version: DEFAULT_VERSION
    })
    let canvas_ref: HTMLCanvasElement
    let toast_copied_ref: HTMLDivElement
    let timeoutId: number | null = null

    function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
        const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
        if (!store_settings) return;

        for (const item of items) {
            store_settings[_put]({ key: item[0], value: item[1] })
        }
    }

    function saveMiscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
        const store = db[_writeObjectStore](ObjectStoreNames[_miscellaneous])
        if (store == null) return;

        for (const item of items) {
            store[_put]({ key: item[0], value: item[1] })
        }
    }

    function generate(): void {
        if (timeoutId != null) clearTimeout(timeoutId)

        timeoutId = setTimeDelayed(() => {
            dataToQRCanvas(canvas_ref, settings[_encodingMode] == EncodingMode[_auto]
                ? QRCodeData()
                : [{data: QRCodeData(), mode: settings[_encodingMode] as any}],
            {
                color: {
                    dark: settings[_color],
                    light: settings[_backgroundColor]
                },
                scale: 16,
                errorCorrectionLevel: settings[_errorCorrectionLevel],
                margin: settings[_margin],
                version: settings[_version] == null? undefined : settings[_version],
            }, (error) => {
                setIsGenerateError(error != null)
                if (!error) return;
                const ctx = canvas_ref[_getContext](_2d)
                ctx?.[_clearRect](0, 0, canvas_ref[_width], canvas_ref[_height])
            })
            timeoutId = null
        }, 300)
    }

    function getSVG(): Promise<string> {
        return new Promise((ok, err) => {
            dataToQRString(settings[_encodingMode] == EncodingMode[_auto]
                ? QRCodeData()
                : [{data: QRCodeData(), mode: settings[_encodingMode] as any}],
            {
                color: {
                    dark: settings[_color],
                    light: settings[_backgroundColor]
                },
                scale: 16,
                type: _svg,
                errorCorrectionLevel: settings[_errorCorrectionLevel],
                margin: settings[_margin],
                version: settings[_version] == null? undefined : settings[_version],
            }, (error, svg) => {
                if (error) return err(error)

                ok(svg[_replace](/(?<!\w)(?<=d=)".+?"/gs, (value) => value[_toUpperCase]()))
            })
        })
    }

    function downloadQRCode(type: DownloadFileType): void { switch (type) {
        case DownloadFileType[_jpeg]: {
            downloadFileByURL(canvas_ref[_toDataURL]('image/jpeg', 0.95), 'redmerah-qr-code.jpeg')
            break
        }
        case DownloadFileType[_png]: {
            downloadFileByURL(canvas_ref[_toDataURL]('image/png', 0.95), 'redmerah-qr-code.png')
            break
        }
        case DownloadFileType[_svg]: {
            getSVG()[_then](svg => downloadFile(new Blob([svg], {type: 'image/svg+xml'}), 'redmerah-qr-code.svg'))
            break
        }
    }}

    function copyQRCode(ev: Event, type: CopyFileType): void { switch (type) {
        case CopyFileType[_png]: {
            canvas_ref[_toBlob]((blob) => {
                if (blob == null) return;

                getNavigator()[_clipboard][_write]([new ClipboardItem({ 'image/png': blob })])
                    [_then](() => openToast(ev, toast_copied_ref))
            }, 'image/png', 0.95)
        }
        case CopyFileType[_svg]: {
            getSVG()[_then](svg => getNavigator()[_clipboard][_writeText](svg)[_then](() => openToast(ev, toast_copied_ref)))
            break
        }
    }}

    function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
        case Commands.change_page: {
            setPage(args[0] as Pages)
            saveMiscellaneous([ObjectStoreKeys.miscellaneous_lastPage, args[0]])
            break
        }
        case Commands.change_settings_errorCorrectionLevel: {
            setSettings(_errorCorrectionLevel, args[0] as Settings['errorCorrectionLevel'])
            saveSettings([ObjectStoreKeys.settings_errorCorrectionLevel, args[0]])
            generate()
            break
        }
        case Commands.change_settings_color: {
            setSettings(_color, args[0] as Settings['color'])
            saveSettings([ObjectStoreKeys.settings_color, args[0]])
            generate()
            break
        }
        case Commands.change_settings_backgroundColor: {
            setSettings(_backgroundColor, args[0] as Settings['backgroundColor'])
            saveSettings([ObjectStoreKeys.settings_backgroundColor, args[0]])
            generate()
            break
        }
        case Commands.change_settings_version: {
            setSettings(_version, args[0] as Settings['version'])
            saveSettings([ObjectStoreKeys.settings_version, args[0]])
            generate()
            break
        }
        case Commands.change_settings_encodingMode: {
            setSettings(_encodingMode, args[0] as Settings['encodingMode'])
            saveSettings([ObjectStoreKeys.settings_encodingMode, args[0]])
            generate()
            break
        }
        case Commands.change_settings_margin: {
            setSettings(_margin, args[0] as Settings['margin'])
            saveSettings([ObjectStoreKeys.settings_margin, args[0]])
            generate()
            break
        }
        case Commands.change_QRCodeData: {
            setQRCodeData(args[0] as string)
            generate()
            break
        }
        case Commands.download_QRCode: {
            downloadQRCode(args[0] as DownloadFileType)
            break
        }
        case Commands.copy_QRCode: {
            copyQRCode(args[0] as Event, args[1] as CopyFileType)
            break
        }
        default: return
    }}

    function removeSplashScreen(): void {
        setTimeDelayed(() => {
            const splash_ref = getElementById(ElementIds[_splash])
            splash_ref?.[_animate](
                {opacity: 0},
                {
                    duration: 1000,
                    easing: AnimationEffectTiming[_spring]
                }
            )[_finished][_then](() => splash_ref[_remove]())
        })
    }

    function initDatabase(): void {
        db[_open]({
            onSuccess() {
                initSettings()
                initLastPage()
            },
            onUpgradeNeeded(_, db) {
                db[_createObjectStore]<ObjectStoreSettings>({
                    name: ObjectStoreNames[_settings],
                    keyPath: _key,
                    indexs: [_key, _value]
                })
                db[_createObjectStore]<ObjectStoreMiscellaneous>({
                    name: ObjectStoreNames[_miscellaneous],
                    keyPath: _key,
                    indexs: [_key, _value]
                })
            },
        })
    }

    function initSettings(): void {
        const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
        if (store_settings == null) return

        db[_get]<ObjectStoreSettings<ErrorCorrectionLevel>>(store_settings, ObjectStoreKeys.settings_errorCorrectionLevel)[_then](result => {
            if (result == null) return
            setSettings(_errorCorrectionLevel, result[_value])
        })
        db[_get]<ObjectStoreSettings<HEXColor>>(store_settings, ObjectStoreKeys.settings_color)[_then](result => {
            if (result == null) return
            setSettings(_color, result[_value])
        })
        db[_get]<ObjectStoreSettings<HEXColor>>(store_settings, ObjectStoreKeys.settings_backgroundColor)[_then](result => {
            if (result == null) return
            setSettings(_backgroundColor, result[_value])
        })
        db[_get]<ObjectStoreSettings<Settings['version']>>(store_settings, ObjectStoreKeys.settings_version)[_then](result => {
            if (result == null) return
            setSettings(_version, result[_value])
        })
        db[_get]<ObjectStoreSettings<Settings['encodingMode']>>(store_settings, ObjectStoreKeys.settings_encodingMode)[_then](result => {
            if (result == null) return
            setSettings(_encodingMode, result[_value])
        })
        db[_get]<ObjectStoreSettings<Settings['margin']>>(store_settings, ObjectStoreKeys.settings_margin)[_then](result => {
            if (result == null) return
            setSettings(_margin, result[_value])
        })
    }

    function initLastPage(): void {
        const store_miscellaneous = db[_readObjectStore](ObjectStoreNames[_miscellaneous])
        if (store_miscellaneous == null) return

        db[_get]<ObjectStoreMiscellaneous<Pages>>(store_miscellaneous, ObjectStoreKeys.miscellaneous_lastPage)[_then](result => {
            if (result == null) return
            setPage(result[_value])
        })
    }

    onMount(() => {
        initDatabase()
        removeSplashScreen()
    })

    const Toasts: VoidComponent = () => (<>
        <Toast ref={r => toast_copied_ref = r} leading={<Icon code={0xE51B}/>}>Copied to clipboard</Toast>
    </>)

    return (<App
        appBar={<AppBar
            settings={settings}
            command={command}
            isGenerateError={isGenerateError()}
            page={page()}
        />}>
        <Body
            page={page()}
            isGenerateError={isGenerateError()}
            command={command}
            settings={settings}
            canvasRef={r => canvas_ref = r}
        />
        <Toasts/>
    </App>)
}

export default _