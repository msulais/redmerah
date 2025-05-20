import { GlobalElementIds } from "@/enums/ids"

function main(): void {
	if ('popover' in HTMLElement.prototype) return

	const warningDialogRef = document.getElementById(GlobalElementIds.popoverWarningNotice) as HTMLDialogElement
	warningDialogRef.showModal()
}

main()