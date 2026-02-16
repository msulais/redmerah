import { ObservableStore } from "@/utils/store"
import { GradientStore, type GradientItem } from "./_gradients"
import { $, $$, $$$ } from "./_dom-utils"
import { CSSClasses } from "../../_styles/_css"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { createElementId } from "@/utils/ids"
import { CMenu } from "@/components/Menu"
import { ElementIds } from "../_shared/_ids"
import { CPopover } from "@/components/Popover"
import { CButton } from "@/components/Button"
import { gradientToCSSText } from "./_gradient-utils"
import { ColorSpace } from "../_shared/_enums"
import { SettingsStore } from "./_settings"
import { CToast } from "@/components/Toast"
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

const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_savedGradientList = $$<HTMLUListElement>('.' + CSSClasses.bodySavedGradient)
const _ref_actionMenu = $(ElementIds.bdSv_menu) as CMenu.CElement
const _refs_gradientItem = () => $$$<CButton.CElement>(`[data-command="${CSS.escape(Commands.GradientUse)}"]`)
const _ref_actionView = $(ElementIds.bdSv_view) as CMenu.CItem.CElement
const _ref_actionCopy = $(ElementIds.bdSv_copy) as CMenu.CItem.CElement
const _ref_actionDelete = $(ElementIds.bdSv_delete) as CMenu.CItem.CElement
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
		const ref_li = document.createElement('li')
		const ref_button = CButton.create({Button: {children: [(() => {
			const span = document.createElement('span')
			const g: string[] = []
			for (const layer of gradient.gradients) {
				g.push(gradientToCSSText(layer, ColorSpace.HEX, false))
			}
			span.style.setProperty('background', g.join(','))
			return span
		})()]}})
		ref_button.setAttribute('data-command', Commands.GradientUse)
		ref_button.setAttribute('popovertarget', ElementIds.bdSv_menu)
		ref_button.setAttribute('popovertargetaction', 'show')
		ref_li.append(ref_button)
		children.push(ref_li)
	}
	_ref_savedGradientList?.replaceChildren(...children)
}

function _initEvents(): void {
	_ref_savedGradientList?.addEventListener('click', (ev) => {
		const ref_btn = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_savedGradientList, ref_btn)) {return}

		const getButtonId = () => {
			let id = ref_btn.id
			if (!id) {
				ref_btn.id = (id = createElementId())
			}
			return id
		}

		const hasGradientIndex = () => {
			const ref_li = ref_btn.closest('li')
			if (!ref_li) {
				return false
			}

			const refs_liGrad = _ref_savedGradientList.children
			let i = -1
			for (; i < refs_liGrad.length; i++) {
				if (refs_liGrad[i] === ref_li) {
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

		const command = ref_btn.dataset.command as Commands
		switch (command) {
		case Commands.GradientUse: {
			if (!hasGradientIndex()) {
				return ev.preventDefault()
			}

			const id = getButtonId()
			CMenu.update(_ref_actionMenu, {
				Popover: {anchorBy: id}
			})

			// wait for open
			setTimeout(() => {
				if (!CPopover.isOpen(_ref_actionMenu)) {return}

				CPopover.reposition(_ref_actionMenu)
				for (const ref of _refs_gradientItem()) {
					const isEqual = id === ref.id
					CButton.update(ref, {Button: {focused: isEqual}})
					ref.setAttribute('popovertargetaction', isEqual? 'hide' : 'show')
				}
			})
		} break }
	})

	_ref_actionMenu.addEventListener('toggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		if (isOpen) {return}

		for (const ref of _refs_gradientItem()) {
			CButton.update(ref, {
				Button: {focused: false}
			})
			ref.setAttribute('popovertargetaction', 'show')
		}
	})

	_ref_actionView.addEventListener('click', () => {
		_ref_actionMenu.hidePopover()
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

		GradientStore.update(v => v.gradients = arr)
	})

	_ref_actionCopy.addEventListener('click', () => {
		_ref_actionMenu.hidePopover()
		const gradient = SavedGradients.value.gradients[_selectedGradientIndex]?.gradients
		if (!gradient) {return}

		const gradientText: string[] = []
		for (const grad of gradient) {
			gradientText.push(gradientToCSSText(grad, SettingsStore.value.colorSpace, true))
		}

		navigator.clipboard.writeText(gradientText.join(',\n')).then(() => {
			_ref_toastCopied.showPopover()
		})
	})

	_ref_actionDelete.addEventListener('click', () => {
		_ref_actionMenu.hidePopover()
		const gradientId = SavedGradients.value.gradients[_selectedGradientIndex]?.id
		if (!gradientId) {return}

		removeGradientDB(gradientId)
		const gradients = [...SavedGradients.value.gradients]
		gradients.splice(_selectedGradientIndex, 1)
		SavedGradients.update(v => v.gradients = gradients)
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