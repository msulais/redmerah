import { ObservableStore } from "@/utils/store"
import { GradientStore, type GradientItem } from "./_gradients"
import { $, $$, $$$ } from "./_dom-utils"
import { CSSClasses } from "../../_styles/_css"
import { elementValidTarget } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { createId } from "@/utils/ids"
import { updateMenuRef, type MenuElement, type MenuItemElement } from "@/native-components/Menu"
import { ElementIds } from "../_shared/_ids"
import { isPopoverRefOpen } from "@/native-components/Popover"
import { repositionPopoverRef } from "@/native-components/Popover"
import { createButtonRef, updateButtonRef } from "@/native-components/Button"
import { gradientToCSSText } from "./_gradient-utils"
import { ColorSpace } from "../_shared/_enums"
import { SettingsStore } from "./_settings"
import type { ToastElement } from "@/native-components/Toast"
import { removeGradientDB } from "./_database"

export type SavedGradientsType = {
	gradients: {
		id: string
		gradients: GradientItem[]
	}[]
}

export const SavedGradients = new ObservableStore<SavedGradientsType>({
	gradients: []
})

const _toastCopiedRef = $(ElementIds.bdToas_copied) as ToastElement
const _savedGradientListRef = $$<HTMLUListElement>('.' + CSSClasses.bodySavedGradient)
const _actionMenuRef = $(ElementIds.bdSave_actionMenu) as MenuElement
const _gradientItemRefs = () => $$$<HTMLButtonElement>(`[data-command="${CSS.escape(Commands.grad_use)}"]`)
const _actionViewRef = $(ElementIds.bdSave_actionView) as MenuItemElement
const _actionCopyRef = $(ElementIds.bdSave_actionCopy) as MenuItemElement
const _actionDeleteRef = $(ElementIds.bdSave_actionDelete) as MenuItemElement
let _selectedGradientIndex = 0
let _idIndex = 0

export function generateSavedGradientId(): string {
	return 'gradients-' + (++_idIndex)
}

function _subscribeGradientsChanges(v: SavedGradientsType): void {

	// avoid duplicate from database
	for (const grad of v.gradients) {
		const id = Number.parseInt(grad.id.replace(/[^0-9]/gs, ''))
		if (_idIndex > id) {continue}

		_idIndex = id
	}
}

function _subscribeGradientsRefView(v: SavedGradientsType): void {
	const children: HTMLLIElement[] = []
	for (const gradient of v.gradients) {
		const li = document.createElement('li')
		const button = createButtonRef({
			ButtonChildren: [
				(() => {
					const span = document.createElement('span')
					const g: string[] = []
					for (const layer of gradient.gradients) {
						g.push(gradientToCSSText(layer, ColorSpace.hex, false))
					}
					span.style.setProperty('background', g.join(','))
					return span
				})()
			]
		})
		button.setAttribute('data-command', Commands.grad_use)
		button.setAttribute('popovertarget', ElementIds.bdSave_actionMenu)
		button.setAttribute('popovertargetaction', 'show')
		li.append(button)
		children.push(li)
	}
	_savedGradientListRef?.replaceChildren(...children)
}

function _initEvents(): void {
	_savedGradientListRef?.addEventListener('click', (ev) => {
		const buttonRef = document.activeElement as HTMLButtonElement
		if (!elementValidTarget(_savedGradientListRef, buttonRef)) {return}

		const getButtonId = () => {
			let id = buttonRef.id
			if (!id) {
				buttonRef.id = (id = createId())
			}
			return id
		}

		const hasGradientIndex = () => {
			const liRef = buttonRef.closest('li')
			if (!liRef) {
				return false
			}

			const gradLIRefs = _savedGradientListRef.children
			let i = -1
			for (; i < gradLIRefs.length; i++) {
				if (gradLIRefs[i] === liRef) {
					break
				}
			}

			const gradient = SavedGradients.value.gradients[i]
			if (!gradient) {
				return false
			}

			_selectedGradientIndex = i
			return true
		}

		const command = buttonRef.dataset.command as Commands
		switch (command) {
		case Commands.grad_use: {
			if (!hasGradientIndex()) {
				return ev.preventDefault()
			}

			const id = getButtonId()
			updateMenuRef(_actionMenuRef, {
				PopoverAnchorBy: id
			})

			// wait for open
			setTimeout(() => {
				if (!isPopoverRefOpen(_actionMenuRef)) {return}

				repositionPopoverRef(_actionMenuRef)
				for (const ref of _gradientItemRefs()) {
					const isEqual = id === ref.id
					updateButtonRef(ref, {ButtonFocused: isEqual})

					ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
				}
			})
		} break }
	})

	_actionMenuRef.addEventListener('toggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		if (isOpen) {return}

		for (const ref of _gradientItemRefs()) {
			updateButtonRef(ref, {
				ButtonFocused: false
			})
			ref.setAttribute('popovertargetaction', 'show')
		}
	})

	_actionViewRef.addEventListener('click', () => {
		_actionMenuRef.hidePopover()
		const gradient = SavedGradients.value.gradients[_selectedGradientIndex]?.gradients
		if (!gradient) {return}

		const arr: ObservableStore<GradientItem>[] = []
		for (const g of gradient){
			const newGradient = new ObservableStore<GradientItem>({
				...g,
				stops: g.stops.map(v => ({...v}))
			})
			arr.push(newGradient)
		}

		GradientStore.update(v => ({...v, gradients: arr}))
	})

	_actionCopyRef.addEventListener('click', () => {
		_actionMenuRef.hidePopover()
		const gradient = SavedGradients.value.gradients[_selectedGradientIndex]?.gradients
		if (!gradient) {return}

		const gradientText: string[] = []
		for (const grad of gradient) {
			gradientText.push(gradientToCSSText(grad, SettingsStore.value.colorSpace, true))
		}

		navigator.clipboard.writeText(gradientText.join(',\n')).then(() => {
			_toastCopiedRef.showPopover()
		})
	})

	_actionDeleteRef.addEventListener('click', () => {
		_actionMenuRef.hidePopover()
		const gradientId = SavedGradients.value.gradients[_selectedGradientIndex]?.id
		if (!gradientId) {return}

		removeGradientDB(gradientId)
		const gradients = [...SavedGradients.value.gradients]
		gradients.splice(_selectedGradientIndex, 1)
		SavedGradients.update(v => ({...v, gradients: gradients}))
	})
}

function _initSubscriber(): void {
	SavedGradients.subscribe(_subscribeGradientsChanges)
	SavedGradients.subscribe(_subscribeGradientsRefView)
}

export default () => {
	_initEvents()
	_initSubscriber()
}