import { createSignal, onMount, type VoidComponent } from "solid-js";
import { marked } from 'marked'

import type { Settings } from "./_types";
import { IDB } from "@/utils/indexeddb";
import { DatabaseNames } from "@/enums/storage";
import { _animate, _clipboard, _contains, _createObjectStore, _css, _db, _finished, _fontSize, _get, _html, _key, _lastInput, _length, _markdown, _markdownConverter, _newVersion, _objectStore, _objectStoreNames, _oldVersion, _open, _put, _readObjectStore, _readonly, _remove, _settings, _splash, _spring, _textWrap, _then, _transaction, _value, _writeObjectStore, _writeText } from "@/data/string";
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage";
import { createStore } from "solid-js/store";
import { Commands } from "./_enums";
import { defaultCSSText } from "./_css";
import { defaultMarkdownText } from "./_markdown";
import { downloadFile, openFile, readFileAsText } from "@/utils/file";
import { getNavigator } from "@/data/window";
import { AnimationEffectTiming } from "@/enums/animation";
import { ElementIds } from "@/enums/ids";
import { getElementById } from "@/utils/element";
import { setMicrotask } from "@/utils/timeout";

import Icon from "@/components/Icon";
import Toast, { openToast } from "@/components/Toast";
import App from "@/components/App";
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
    const db = new IDB(DatabaseNames[_markdownConverter], 2)
    const [htmlText, setHtmlText] = createSignal<string>('')
    const [markdownText, setMarkdownText] = createSignal<string>('')
    const [cssText, setCssText] = createSignal<string>('')
    const [settings, setSettings] = createStore<Settings>({
        textWrap: true,
        fontSize: 14
    })
    let toast_noFileSelected_ref: HTMLDivElement
    let toast_errorReadingFiles_ref: HTMLDivElement
    let toast_copied_ref: HTMLDivElement

    function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
        const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
        if (!store_settings) return;

        for (const item of items) {
            store_settings[_put]({ key: item[0], value: item[1] })
        }
    }

    function saveLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
        const store_lastInput = db[_writeObjectStore](ObjectStoreNames[_lastInput])
        if (!store_lastInput) return;

        for (const item of items) {
            store_lastInput[_put]({ key: item[0], value: item[1] })
        }
    }

    function updateOutput(): void {
        setHtmlText(marked(markdownText(), { async: false }) as string)
    }

    function command(type: Commands, ...args: unknown[]): unknown {
        // toggle_textWrap
        if (type == Commands.toggle_textWrap) {
            setSettings(_textWrap, t => !t)
            saveSettings([ObjectStoreKeys.settings_textWrap, settings[_textWrap]])
        }

        // change_fontSize
        else if (type == Commands.change_fontSize) {
            setSettings(_fontSize, args[0] as number)
            saveSettings([ObjectStoreKeys.settings_fontSize, settings[_fontSize]])
        }

        // update_css_text
        else if (type == Commands.update_css_text) {
            setCssText(args[0] as string)
            saveLastInput([ObjectStoreKeys.lastInput_css, args[0]])
        }

        // update_markdown_text
        else if (type == Commands.update_markdown_text) {
            setMarkdownText(args[0] as string)
            saveLastInput([ObjectStoreKeys.lastInput_markdown, args[0]])
            updateOutput()
        }

        // reset_inputs
        else if (type == Commands.reset_inputs) {
            setMarkdownText(defaultMarkdownText)
            setCssText(defaultCSSText)
            saveLastInput(
                [ObjectStoreKeys.lastInput_markdown, defaultMarkdownText],
                [ObjectStoreKeys.lastInput_css, defaultCSSText]
            )
            updateOutput()
        }

        // open_file
        else if (type == Commands.open_file) {
            openFile('text/*', true)[_then](async (files) => {
                if (files == null || files[_length] == 0) {
                    openToast(args[0] as Event, toast_noFileSelected_ref)
                    return
                }

                let text: string = ''
                try {
                    for (let i = 0; i < files[_length]; i++) {
                        if (i > 0) text += '\n\n'

                        const file = files[i]
                        text += await readFileAsText(file)
                    }
                } catch {
                    openToast(args[0] as Event, toast_errorReadingFiles_ref)
                    return
                }

                setMarkdownText(text)
                saveLastInput([ObjectStoreKeys.lastInput_markdown, text])
                updateOutput()
            })
        }

        // copy_all
        else if (type == Commands.copy_all) {
            const t = args[1] as ('markdown' | 'css' | 'html')
            let text = ''
            if (t == _markdown) text = markdownText()
            else if (t == _html) text = htmlText()
            else if (t == _css) text = cssText()

            getNavigator()[_clipboard][_writeText](text)
            openToast(args[0] as Event, toast_copied_ref)
        }

        // download_file
        else if (type == Commands.download_file) {
            const t = args[0] as ('markdown' | 'css' | 'html')
            let text = ''
            let filename = ''
            if (t == _markdown) text = markdownText(), filename = 'markdown.md'
            else if (t == _html) text = htmlText(), filename = 'hypertext-markup-language.html'
            else if (t == _css) text = cssText(), filename = 'cascading-style-sheets.css'

            downloadFile(new Blob([text]), filename)
        }
        return
    }

    function initSettings(): void {
        const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
        if (store_settings == null) return

        db[_get]<ObjectStoreSettings<boolean>>(store_settings, ObjectStoreKeys.settings_textWrap)[_then](
            result => setSettings(_textWrap, defaultValue => result? result[_value] : defaultValue)
        )
        db[_get]<ObjectStoreSettings<number>>(store_settings, ObjectStoreKeys.settings_fontSize)[_then](
            result => setSettings(_fontSize, defaultValue => result? result[_value] : defaultValue)
        )
    }

    function initLastInputs(): void {
        const store_lastInput = db[_readObjectStore](ObjectStoreNames[_lastInput])
        if (store_lastInput == null) return

        db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_css)[_then](
            result => setCssText(result? result[_value] : defaultCSSText)
        )
        db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_markdown)[_then](
            result => {
                setMarkdownText(result == undefined? defaultMarkdownText : result[_value])
                updateOutput()
            }
        )
    }

    function initDatabase(): void {
        db[_open]({
            onSuccess(_ev, _db) {
                initSettings()
                initLastInputs()
            },
            onError() {
                setMarkdownText(defaultMarkdownText)
                setCssText(defaultCSSText)
                updateOutput()
            },
            onUpgradeNeeded(_, db) {
                db[_createObjectStore]({
                    name: ObjectStoreNames[_settings],
                    keyPath: _key,
                    indexs: [_key, _value]
                })
                db[_createObjectStore]({
                    name: ObjectStoreNames[_lastInput],
                    keyPath: _key,
                    indexs: [_key, _value]
                })
            }
        })
    }

    function removeSplashScreen(): void {
        setMicrotask(() => {
            const splash_ref = getElementById(ElementIds[_splash]) as HTMLDivElement
            splash_ref[_animate](
                {opacity: 0},
                {
                    duration: 1000,
                    easing: AnimationEffectTiming[_spring]
                }
            )[_finished][_then](() => splash_ref[_remove]())
        })
    }

    onMount(() => {
        initDatabase()
        removeSplashScreen()
    })

    const Toasts: VoidComponent = () => (<>
        <Toast
            ref={r => toast_noFileSelected_ref = r}
            leading={<Icon code={0xE631}/>}>
            No file selected
        </Toast>
        <Toast
            ref={r => toast_errorReadingFiles_ref = r}
            leading={<Icon code={0xEDC5}/>}>
            Error reading files
        </Toast>
        <Toast
            ref={r => toast_copied_ref = r}
            leading={<Icon code={0xE51B}/>}>
            Copied
        </Toast>
    </>)

    return (<App
        appBar={<AppBar
            settings={settings}
            command={command}
        />}>
        <Body
            settings={settings}
            command={command}
            markdownText={markdownText()}
            cssText={cssText()}
            htmlText={htmlText()}
        />
        <Toasts/>
    </App>)
}

export default _