import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { array_includes } from "@/utils/array"
import { attr_set } from "@/utils/attributes"
import { storage_get } from "@/utils/storage"

export function check_theme(): void {
	const theme = storage_get(LocalStorageKeys.theme)

	if (theme && array_includes([ThemeData.system, ThemeData.light, ThemeData.dark], theme as ThemeData)) {
		attr_set(document.documentElement, RootAttributes.theme, theme)
	}
}