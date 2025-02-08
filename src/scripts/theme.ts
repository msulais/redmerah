import { RootAttributes } from "@/enums/attributes"
import { LocalStorageKeys } from "@/enums/storage"
import { ThemeData } from "@/enums/theme"
import { attrSet } from "@/utils/attributes"
import { documentRoot } from "@/utils/document"
import { validEnumValue } from "@/utils/object"
import { storageGet } from "@/utils/storage"

export function checkTheme(): void {
	const theme = storageGet(LocalStorageKeys.theme)
	if (!theme || !validEnumValue(theme, ThemeData)) return

	attrSet(documentRoot(), RootAttributes.theme, theme)
}