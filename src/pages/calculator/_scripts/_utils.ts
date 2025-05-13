import { Commands, BodyEvents } from "./_enums"
import type { CommandDetail } from "./_types"

export function command<T extends CommandDetail>(type: Commands, options: Omit<T, 'type'>): void {
	document.body.dispatchEvent(new CustomEvent(BodyEvents.command, {detail: {
		type,
		...options
	}}))
}