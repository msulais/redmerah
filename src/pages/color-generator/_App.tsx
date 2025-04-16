import { type Component, For, Show, type VoidComponent, createMemo, createSignal, createUniqueId, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

import type { HEXColor, RGBColor } from '@/types/color'
import type { Palette } from './_types'
import { colorGeneratePalette, colorHexToRgb, colorIsValid } from '@/utils/color'
import { elementValidTarget } from '@/utils/element'
import { DatabaseNames, LocalStorageKeys } from '@/enums/storage'
import { ElementIds } from '@/enums/ids'
import { IDB } from '@/utils/indexeddb'
import { ObjectStoreNames, type ObjectStorePaletteList } from './_storage'
import { removeSplashScreen } from '@/utils/splash'
import { attrClassListModule } from '@/utils/attributes'
import { numberIsNotDefined } from '@/utils/number'
import { AnimationEffectTiming } from '@/enums/animation'
import { ICON_CHECKMARK, ICON_COPY, ICON_DELETE } from '@/constants/icons'

import {Tooltip} from '@/components/Tooltip'
import Divider from '@/components/Divider'
import Button, { ButtonVariant, FloatingActionButton, IconButton } from '@/components/Button'
import List from '@/components/List'
import ColorPicker, { closeColorPicker, openColorPicker } from '@/components/ColorPicker'
import Dialog, { closeDialog, openDialog } from '@/components/Dialog'
import App from '@/components/App'
import AppBar from './_AppBar'
import Body from './_Body'
import CSS from './_styles.module.scss'
import { keyboardOnFocusIn, keyboardOnFocusOut, keyboardOnKeyDown } from '@/utils/keyboard'
import { isAnimationAllowed } from '@/utils/animation'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.colorGenerator)
	const [palette, setPalette] = createStore<Palette>({
		seed: '#00FFF0',
		accentLight: '#005C56',
		onAccentLight: '#FFFFFF',
		accentDark: '#00C7BB',
		onAccentDark: '#000000'
	})
	const [paletteList, setPaletteList] = createSignal<Palette[]>([])
	const [timeId, setTimeId] = createSignal<number | NodeJS.Timeout | null>(null)
	const [colorPickerRef, setColorPickerRef] = createSignal<HTMLDialogElement | null>(null)
	const [dialogColorListRef, setDialogColorListRef] = createSignal<HTMLDialogElement | null>(null)
	const timeCopyList: Record<string, number> = {}
	let dialogDeleteAllRef: HTMLDialogElement

	function deleteAllPaletteList(): void {
		setPaletteList([])
		const storePaletteList = db.writeStore(ObjectStoreNames.paletteList)
		storePaletteList?.clear()
	}

	function rgbToCSSValue(rgb: RGBColor): string {
		return `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
	}

	function onColorChange(color: HEXColor): void {
		const generatedColor = colorGeneratePalette(color)
		const elementAccentColorStyle = document.getElementById(ElementIds.colorAccent)!
		elementAccentColorStyle.innerHTML = `:root{--g-color-accent-light: ${rgbToCSSValue(colorHexToRgb(generatedColor.color))};--g-color-accent-dark: ${rgbToCSSValue(colorHexToRgb(generatedColor.colorDark))};--g-color-on-accent-light: ${rgbToCSSValue(colorHexToRgb(generatedColor.onColor))};--g-color-on-accent-dark: ${rgbToCSSValue(colorHexToRgb(generatedColor.onColorDark))};}`;
		localStorage.setItem(LocalStorageKeys.platformColor, color)
		setPalette({
			seed: color.toUpperCase() as HEXColor,
			accentLight: generatedColor.color.toUpperCase() as HEXColor,
			onAccentLight: generatedColor.onColor.toUpperCase() as HEXColor,
			accentDark: generatedColor.colorDark.toUpperCase() as HEXColor,
			onAccentDark: generatedColor.onColorDark.toUpperCase() as HEXColor
		})
	}

	function copyAllPaletteList(): void {
		if (timeId()) {
			clearTimeout(timeId()!)
			setTimeId(null)
		}

		const colorsText: string[] = []
		for (const i in paletteList()) {
			const palette = paletteList()[i]
			colorsText.push([
				`--seed-${i + 1}: ` + palette.seed,
				`--accent-light-${i + 1}: ` + palette.accentLight,
				`--on-accent-light-${i + 1}: ` + palette.onAccentLight,
				`--accent-dark-${i + 1}: ` + palette.accentDark,
				`--on-accent-dark-${i + 1}: ` + palette.onAccentDark,
			].join(';\n') + ';')
		}

		navigator.clipboard
		.writeText(colorsText.join('\n\n'))
		.then(() => setTimeId(setTimeout(() => setTimeId(null), 2000)))
	}

	function onAddColor(): void {
		for (const p of paletteList()) {
			if (p.seed == palette.seed) return
		}

		setPaletteList(l => [...l, {...palette}])
		const storePaletteList = db.writeStore(ObjectStoreNames.paletteList)
		storePaletteList?.put({...palette})
	}

	function initColor(): void {
		const color = localStorage.getItem(LocalStorageKeys.platformColor)
		if (!colorIsValid(color ?? '')) return;

		onColorChange(color as HEXColor)
		setPalette('seed', color as HEXColor)
	}

	function initPaletteList(): void {
		const store_palettelist = db.readStore(ObjectStoreNames.paletteList)
		if (store_palettelist == null) return;

		db.getAll<ObjectStorePaletteList>(store_palettelist)
		.then((result) => setPaletteList(v => result? [...result] : v))
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initPaletteList()
			},
			onUpgrade(_, db) {
				db.createStore<ObjectStorePaletteList>({
					name: ObjectStoreNames.paletteList,
					keyPath: 'seed',
					indexs: ['seed', 'accentLight', 'onAccentLight', 'accentDark', 'onAccentDark']
				})
			},
		})
	}

	function copyList(button: HTMLElement, index: number) {
		const palette = paletteList()[index]
		if (timeCopyList[palette.seed]) return

		navigator.clipboard
		.writeText([
			'--seed: ' + palette.seed,
			'--accent-light: ' + palette.accentLight,
			'--on-accent-light: ' + palette.onAccentLight,
			'--accent-dark: ' + palette.accentDark,
			'--on-accent-dark: ' + palette.onAccentDark,
		].join(';\n') + ';')
		.then(() => {
			const icon = button.firstElementChild
			if (!icon) return

			timeCopyList[palette.seed] = 1
			const animationOptions = {
				duration: 150,
				easing: AnimationEffectTiming.spring
			}

			if (!isAnimationAllowed()){
				icon.textContent = String.fromCharCode(ICON_CHECKMARK)
				setTimeout(() => {
					icon.textContent = String.fromCharCode(ICON_COPY)
					icon.animate({scale: [0, 1]}, animationOptions)
					delete timeCopyList[palette.seed]
				}, 1000)
				return
			}

			icon.animate({scale: [1, 0]}, animationOptions).finished.then(() => {
				icon.textContent = String.fromCharCode(ICON_CHECKMARK)
				icon.animate({scale: [0, 1]}, animationOptions).finished.then(() => setTimeout(() => {
					icon.animate({scale: [1, 0]}, animationOptions).finished.then(() => {
						icon.textContent = String.fromCharCode(ICON_COPY)
						icon.animate({scale: [0, 1]}, animationOptions)
						delete timeCopyList[palette.seed]
					})
				}, 1000))
			})
		})
	}

	onMount(() => {
		initColor()
		initDatabase()
		removeSplashScreen()
	})

	const ListItem: Component<{palette: Palette, index: number}> = (props) => {
		const palette = createMemo(() => props.palette)
		return (<List
			tabIndex={props.index === 0? 0 : undefined}
			c:trailing={<>
				<IconButton
					data-tooltip="Copy"
					data-listitem-copy={props.index}
					c:code={ICON_COPY}
				/>
				<IconButton
					data-tooltip="Delete"
					data-listitem-delete={props.index}
					c:code={ICON_DELETE}
				/>
			</>}
			c:subtitle={<div class={CSS.app_dialog_colors}>
				<div data-tooltip="Accent Light" style={{
					"background-color": palette().accentLight,
					color: palette().onAccentLight,
				}}>{palette().accentLight}</div>
				<div data-tooltip="On Accent Light" style={{
					"background-color": palette().onAccentLight,
					color: palette().accentLight,
				}}>{palette().onAccentLight}</div>
				<div data-tooltip="Accent Dark" style={{
					"background-color": palette().accentDark,
					color: palette().onAccentDark,
				}}>{palette().accentDark}</div>
					<div data-tooltip="On Accent Dark" style={{
					"background-color": palette().onAccentDark,
					color: palette().accentDark,
				}}>{palette().onAccentDark}</div>
			</div>}
			c:leading={<div class={CSS.app_seed} style={{"background-color": palette().seed}}/>}>
			{ palette().seed }
		</List>)
	}

	const Dialogs: VoidComponent = () => {
		const buttonColorList_deleteAllId = createUniqueId()
		const buttonColorList_copyId = createUniqueId()
		const buttonColorList_closeId = createUniqueId()
		const buttonDeleteAll_cancelId = createUniqueId()
		const buttonDeleteAll_deleteAllId = createUniqueId()
		const colorPaletteList: HTMLElement[] = []
		return (<>
			<Dialog
				ref={r => setDialogColorListRef(r)}
				style={{width: '640px'}}
				c:header="Color list"
				onClick={ev => {
					const button = document.activeElement! as HTMLButtonElement
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonColorList_deleteAllId:
						openDialog(dialogDeleteAllRef, {important: true})
						break
					case buttonColorList_copyId:
						copyAllPaletteList()
						break
					case buttonColorList_closeId:
						closeDialog(dialogColorListRef()!)
						break
					default:
						const dataset = button.dataset
						const dataListitemCopy = dataset.listitemCopy
						if (dataListitemCopy) {
							const index = Number.parseInt(dataListitemCopy)
							if (numberIsNotDefined(index)) return

							copyList(button, index)
							return
						}

						const dataListitemDelete = dataset.listitemDelete
						if (dataListitemDelete) {
							const index = Number.parseInt(dataListitemDelete)
							if (numberIsNotDefined(index)) return

							const palette = paletteList()[index]
							setPaletteList(l => l.filter(v => v.seed != palette.seed))
							if (paletteList().length == 0) {
								closeColorPicker(dialogColorListRef()!)
							}

							const storePaletteList = db.writeStore(ObjectStoreNames.paletteList)
							storePaletteList?.delete(palette.seed)
							return
						}
					}
				}}
				c:actions={<>
					<Button
						c:variant={ButtonVariant.tonal}
						id={buttonColorList_deleteAllId}>
						Delete all
					</Button>
					<Button
						c:variant={ButtonVariant.tonal}
						id={buttonColorList_copyId}>
						<Show when={timeId()} fallback='Copy all'>Copied</Show>
					</Button>
					<Button
						c:variant={ButtonVariant.filled}
						id={buttonColorList_closeId}>
						Close
					</Button>
				</>}>
				<Tooltip
					onFocusIn={ev => {
						const self = ev.currentTarget
						if (
							colorPaletteList.length === 0
							|| colorPaletteList[0] !== self.firstElementChild
						) {
							colorPaletteList.length = 0
							colorPaletteList.push(
								...self.querySelectorAll<HTMLDivElement>('.c-list')
							)
						}
						keyboardOnFocusIn(ev, colorPaletteList)
					}}
					onFocusOut={ev => keyboardOnFocusOut(ev, colorPaletteList)}
					onKeyDown={ev => keyboardOnKeyDown(ev, colorPaletteList, {up: 'prev', down: 'next'})}>
					<For each={paletteList()}>{(p, i) => <>
						<Show when={i() > 0}><Divider /></Show>
						<ListItem palette={p} index={i()}/>
					</>}</For>
				</Tooltip>
			</Dialog>
			<Dialog
				ref={r => dialogDeleteAllRef = r}
				c:header="Delete all"
				onClick={ev => {
					const button = document.activeElement!
					if (!elementValidTarget(
						ev.currentTarget,
						button,
					)) return

					switch (button.id) {
					case buttonDeleteAll_cancelId:
						closeDialog(dialogDeleteAllRef)
						break
					case buttonDeleteAll_deleteAllId:
						closeDialog(dialogDeleteAllRef)
						closeDialog(dialogColorListRef()!)
						deleteAllPaletteList()
						break
					}
				}}
				c:actions={<>
					<Button
						id={buttonDeleteAll_cancelId}
						c:variant={ButtonVariant.tonal}>
						Cancel
					</Button>
					<Button
						id={buttonDeleteAll_deleteAllId}
						c:variant={ButtonVariant.filled}>
						Delete all
					</Button>
				</>}>
				Are you sure want to delete all palette color?
			</Dialog>
		</>)
	}

	return (<>
		<App
			c:appBar={<AppBar
				colorPickerRef={colorPickerRef()!}
				dialogColorListRef={dialogColorListRef()!}
				onAddColor={onAddColor}
				seed={palette.seed}
				palette={palette}
				onColorChange={onColorChange}
				paletteList={paletteList()}
			/>}
			c:floatingActionButton={<FloatingActionButton
				classList={attrClassListModule(CSS.app_fab)}
				c:variant={ButtonVariant.filled}
				onClick={(ev) => openColorPicker(colorPickerRef()!, {
					anchor: ev.currentTarget,
					color: palette.seed as HEXColor
				})}>
				{palette.seed}
			</FloatingActionButton>}>
			<Body {...palette} />
		</App>
		<ColorPicker
			ref={r => setColorPickerRef(r)}
			c:color={palette.seed}
			c:draggable
			c:disabledAction
			c:disabledOpacityControl
			c:onUpdateColor={onColorChange}
		/>
		<Dialogs />
	</>)
}

export default _