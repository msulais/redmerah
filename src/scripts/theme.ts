import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { attr_set } from "@/utils/attributes"
import { document_root } from "@/utils/document"
import { storage_get } from "@/utils/storage"

export function check_theme(): void {
	const theme = storage_get(LocalStorageKeys.theme)
	if (
		!theme
		|| (
			theme != ThemeData.system
			&& theme != ThemeData.dark
			&& theme != ThemeData.light
		)
	) return
	attr_set(document_root(), RootAttributes.theme, theme)
}