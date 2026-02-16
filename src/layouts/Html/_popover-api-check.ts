import { GlobalElementIds } from "@/enums/ids"

const ref_warningDialog = document.getElementById(GlobalElementIds.PopoverWarningNotice) as HTMLDialogElement

function main(): void {
	if ('popover' in HTMLElement.prototype) {
		ref_warningDialog?.remove()
		return
	}

	ref_warningDialog?.showModal()
}

main()